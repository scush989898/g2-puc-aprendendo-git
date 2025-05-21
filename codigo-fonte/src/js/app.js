document.addEventListener('DOMContentLoaded', function () {
    const currentUser = JSON.parse(localStorage.getItem('organizai_currentUser') ||
        sessionStorage.getItem('organizai_currentUser') || 'null');

    if (currentUser) {
        window.location.href = 'src/pages/tasks.html';
    } else {
        window.location.href = 'src/pages/login.html';
    }
});