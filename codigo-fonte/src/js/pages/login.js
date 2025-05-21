// login.js

function initLogin() {
    const currentUser = Storage.getCurrentUser();
    if (currentUser) {
        window.location.href = 'tasks.html';
        return;
    }

    setupLoginForm();
}

function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            processLogin();
        });
    }
}

/**
 * RF-14: Processa o login
 */
function processLogin() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe')?.checked || false;

    if (!email || !password) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    const users = Storage.getUsers();

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        const userWithoutPassword = { ...user };
        delete userWithoutPassword.password;

        Storage.setCurrentUser(userWithoutPassword, rememberMe);
        window.location.href = 'tasks.html';

    } else {
        alert('Email ou senha incorretos.');
    }
}

document.addEventListener('DOMContentLoaded', initLogin);