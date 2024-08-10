//Create the class Person, UserRegular and Admin, role and permission
class Person {

    constructor(name, username, password) {

        this.name = name;
        this.username = username;
        this.password = password;
        
    }


    static createUser(name, username, password, role) {
        if (localStorage.getItem(username)) {
            throw new Error('Registered user')
        }
        if (role === 'admin') {
            return new Admin(name, username, password)
        } else {
            return new UserRegular(name, username, password)
        }
    }


    register() {

        localStorage.setItem(this.username, JSON.stringify(this))
    }

    static login(username, password) {

        const user = JSON.parse(localStorage.getItem(username))
        if (user && user.password === password) {

            return user.role === 'admin' ? new Admin(user.name, user.username, user.password) : new UserRegular(user.name, user.username, user.password)
        
        }
        return null
    }
}



class Admin extends Person {
    constructor(name, username, password) {
        super(name, username, password)
        this.role = 'admin'
    }

    createReservation(reservation) {

        let reservations = JSON.parse(localStorage.getItem('reservations')) || []
        reservations.push(reservation)
        localStorage.setItem('reservations', JSON.stringify(reservations))
    
    }

    deleteReservation(id) {

        let reservations = JSON.parse(localStorage.getItem('reservations')) || []
        reservations = reservations.filter(reservation => reservation.id !== id)
        localStorage.setItem('reservations', JSON.stringify(reservations))
    
    }

    updateReservation(id, newReservation) {
        

        let reservations = JSON.parse(localStorage.getItem('reservations')) || []
        reservations = reservations.map(reservation => reservation.id === id ? { ...reservation, ...newReservation } : reservation)
        localStorage.setItem('reservations', JSON.stringify(reservations))
   
    }
}

class UserRegular extends Person {

    constructor(name, username, password) {
        super(name, username, password)
        this.role = 'user'
    }
    

    createReservation(reservation) {
        let reservations = JSON.parse(localStorage.getItem('reservations')) || [];
        reservations.push({ ...reservation, user: this.username })
        localStorage.setItem('reservations', JSON.stringify(reservations))
    }

}

class Auth {

    static login(username, password) {
        const user = Person.login(username, password);
        if (user) {
            localStorage.setItem('session', JSON.stringify(user))
            return user
        }
        return null
    }


    static logout() {

        localStorage.removeItem('session')
    }

    static getCurrentUser() {

        return JSON.parse(localStorage.getItem('session'))
    }
}

// Create DOM

document.getElementById('registerForm').addEventListener('submit', function(event) {

    event.preventDefault()

    const name = document.getElementById('name').value
    const username = document.getElementById('username').value
    const password = document.getElementById('password').value
    const role = document.getElementById('role').value

    try {

        const user = Person.createUser(name, username, password, role)
        user.register()
        alert('User successfully created')
    } catch (error) {

        alert(error.message);
    }
});

document.getElementById('loginForm').addEventListener('submit', function(event) {

    event.preventDefault();

    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    const user = Auth.login(username, password);
    if (user) {

        getReservations();
        document.querySelector('.forms-wrapper').style.display = 'none';
        document.querySelector('.reservations').style.display = 'block';

    } else {

        alert('Incorrect username or password');
    }
});

document.getElementById('logout').addEventListener('click', function() {

    Auth.logout();

    document.querySelector('.forms-wrapper').style.display = 'block';

    document.querySelector('.reservations').style.display = 'none';

});

document.getElementById('createReservation').addEventListener('click', function() {

    const user = Auth.getCurrentUser();

    if (user) {

        const reservation = {
            
            id: Date.now(),

            Description: prompt('Reservation description:')
            
        };

        if (user.role === 'admin') {
            new Admin(user.name, user.username, user.password).createReservation(reservation);
        } else {
            new UserRegular(user.name, user.username, user.password).createReservation(reservation);
        }

        getReservations();
    } else {
        alert('Login to create a reservation');
    }
});

function getReservations() {
    const user = Auth.getCurrentUser();
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    const listReservations = document.getElementById('reservationList');
    listReservations.innerHTML = '';

    reservations.forEach(reservation => {
        const li = document.createElement('li');
        li.textContent = `Reservation: ${reservation.descripcion} - User: ${reservation.user}`;

        if (user.role === 'admin') {
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', function() {
                new Admin(user.name, user.username, user.password).deleteReservation(reservation.id);
                getReservations();
            });

            const updateButton = document.createElement('button');
            updateButton.textContent = 'Update';
            updateButton.addEventListener('click', function() {
                const nuevaDescripcion = prompt('Type the new reservation description:', reservation.descripcion);
                new Admin(user.name, user.username, user.password).updateReservation(reservation.id, { descripcion: newDescription });
                getReservations();
            });

            li.appendChild(updateButton);
            li.appendChild(deleteButton);
        }

        listReservations.appendChild(li);
    });
}

window.onload = function() {
    const user = Auth.getCurrentUser();
    if (user) {
        document.querySelector('.forms-wrapper').style.display = 'none';
        document.querySelector('.reservations').style.display = 'block';
        getReservations();
    }
};
