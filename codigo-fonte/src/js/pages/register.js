// register.js
import { standardizeDate } from '../utils/date.js'

function initRegister() {
    const currentUser = Storage.getCurrentUser();
    if (currentUser) {
        window.location.href = 'tasks.html';
        return;
    }

    setupRegisterForm();
}

function setupRegisterForm() {
    const registerForm = document.getElementById('registerForm');

    if (registerForm) {
        registerForm.addEventListener('submit', function (e) {
            e.preventDefault();
            processRegistration();
        });
    }
}

/**
 * RF-13: Processa o registro de usuário
 */
function processRegistration() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!name || !email || !password || !confirmPassword) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    if (password !== confirmPassword) {
        alert('As senhas não coincidem.');
        return;
    }

    const users = Storage.getUsers();
    if (users.some(user => user.email === email)) {
        alert('Este email já está em uso. Por favor, use outro ou faça login.');
        return;
    }

    const newUser = {
        id: Storage.generateId(),
        name,
        email,
        password,
        createdAt: standardizeDate()
    };

    users.push(newUser);
    Storage.saveUsers(users);

    const userWithoutPassword = { ...newUser };
    delete userWithoutPassword.password;

    Storage.setCurrentUser(userWithoutPassword);
    window.location.href = 'tasks.html';
}


document.addEventListener('DOMContentLoaded', initRegister);