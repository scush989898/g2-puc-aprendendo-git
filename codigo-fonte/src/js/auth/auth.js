document.addEventListener('DOMContentLoaded', function () {
    // Check if auth is required and user is not logged in
    if (window.location.pathname.indexOf('/pages/') > -1 &&
        window.location.pathname.indexOf('/login.html') === -1 &&
        window.location.pathname.indexOf('/register.html') === -1 &&
        !Storage.getCurrentUser()) {
        window.location.href = '../pages/login.html';
    }

    // Registration form handling
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }

            const users = Storage.getUsers();

            // Check if email already exists
            if (users.find(u => u.email === email)) {
                alert('Email already registered');
                return;
            }

            // Create new user
            const newUser = {
                id: Storage.generateId(),
                name,
                email,
                password, // In a real app, this should be hashed
                createdAt: new Date().toISOString()
            };

            users.push(newUser);
            Storage.saveUsers(users);

            // Create default categories for the user
            const defaultCategories = [
                { id: Storage.generateId(), name: 'Work', color: '#0d6efd', userId: newUser.id },
                { id: Storage.generateId(), name: 'Personal', color: '#6610f2', userId: newUser.id },
                { id: Storage.generateId(), name: 'Home', color: '#198754', userId: newUser.id }
            ];

            const categories = Storage.getCategories();
            categories.push(...defaultCategories);
            Storage.saveCategories(categories);

            // Set current user and redirect
            Storage.setCurrentUser(newUser);
            window.location.href = 'tasks.html';
        });
    }

    // Login form handling
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const users = Storage.getUsers();
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                Storage.setCurrentUser(user);
                window.location.href = 'tasks.html';
            } else {
                alert('Invalid email or password');
            }
        });
    }

    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            Storage.clearCurrentUser();
            window.location.href = '../../../index.html';
        });
    }
});