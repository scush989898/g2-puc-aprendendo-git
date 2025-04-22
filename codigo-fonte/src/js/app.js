// Check if user is already logged in
if (localStorage.getItem('currentUser')) {
    window.location.href = 'pages/tasks.html';
}