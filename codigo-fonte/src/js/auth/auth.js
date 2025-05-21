// auth.js
function initAuth() {
    const protectedPages = [
        '/pages/tasks.html',
        '/pages/profile.html',
        '/pages/notifications.html'
    ];

    const currentPath = window.location.pathname;
    const isProtectedPage = protectedPages.some(page => currentPath.includes(page));
    const currentUser = Storage.getCurrentUser();

    if (isProtectedPage && !currentUser) {
        window.location.href = '../pages/login.html';
        return;
    }

    const logoutLinks = document.querySelectorAll('a[href="login.html"]');
    logoutLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            if (link.querySelector('.bi-box-arrow-right')) {
                e.preventDefault();
                Storage.clearCurrentUser();
                window.location.href = '../pages/login.html';
            }
        });
    });
}

/**
 * RF-10: Logout de usuários
 */
function logoutUser() {
    Storage.clearCurrentUser();
    window.location.href = '../pages/login.html';
}

document.addEventListener('DOMContentLoaded', initAuth);