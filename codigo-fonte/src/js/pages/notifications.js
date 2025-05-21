// notifications.js

function initNotifications() {
    const currentUser = Storage.getCurrentUser();
    if (!currentUser) return;

    loadNotifications();
    setupCloseButtons();

}

/**
 * RF-11: Carrega e exibe notificações
 */
function loadNotifications() {
    const currentUser = Storage.getCurrentUser();
    if (!currentUser) return;

    const notifications = Storage.getUserNotifications(currentUser.id);

    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const container = document.getElementById('notificationsList');
    if (!container) return;

    if (notifications.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info">
                <i class="bi bi-info-circle me-2"></i> Você não tem notificações.
            </div>
        `;
        return;
    }

    let notificationsHtml = '';

    notifications.forEach(notification => {
        const createdAt = new Date(notification.createdAt);
        const brazilDate = new Date(createdAt.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
        brazilDate.setHours(12, 0, 0, 0); // Padronizar para meio-dia

        const date = brazilDate.toLocaleDateString('pt-BR');

        const readClass = notification.read ? 'notification-read' : '';

        notificationsHtml += `
            <div class="alert alert-${notification.type} alert-dismissible fade show ${readClass}" 
                role="alert" 
                data-notification-id="${notification.id}">
                <i class="bi bi-${getIconForType(notification.type)} me-2"></i>
                <strong>${notification.title}:</strong> ${notification.message}
                <div class="small text-muted">Recebida em: ${date}</div>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
            </div>
        `;
    });

    if (!document.getElementById('notification-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'notification-styles';
        styleElement.textContent = `
            .notification-read {
                opacity: 0.7;
            }
        `;
        document.head.appendChild(styleElement);
    }

    container.innerHTML = notificationsHtml;
}

function getIconForType(type) {
    switch (type) {
        case 'success': return 'check2-circle';
        case 'warning': return 'exclamation-triangle';
        case 'danger': return 'x-octagon';
        case 'info':
        default: return 'info-circle';
    }
}

/**
 * RF-11: Configura botões para fechar notificações
 */
function setupCloseButtons() {
    document.body.addEventListener('close.bs.alert', function (event) {
        const alert = event.target;
        if (alert && alert.dataset.notificationId) {
            const notificationId = alert.dataset.notificationId;
            markNotificationAsRead(notificationId);
        }
    });

    document.addEventListener('click', function (event) {
        if (event.target.classList.contains('btn-close') &&
            event.target.closest('.alert')) {
            const alert = event.target.closest('.alert');
            const notificationId = alert.dataset.notificationId;
            if (notificationId) {
                markNotificationAsRead(notificationId);
            }
        }
    });
}

/**
 * RF-11: Marca uma notificação como lida
 */
function markNotificationAsRead(notificationId) {
    if (!notificationId) return;

    const notifications = Storage.getNotifications();
    const index = notifications.findIndex(notice => notice.id === notificationId);

    if (index >= 0) {
        notifications[index].read = true;
        Storage.saveNotifications(notifications);

    }
}

document.addEventListener('DOMContentLoaded', function () {
    initNotifications();
});