// notifications.js

document.addEventListener('DOMContentLoaded', function () {
    const currentUser = Storage.getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    const notificationsList = document.getElementById('notificationsList');
    const notificationBadge = document.getElementById('notificationBadge');

    // Load notifications (overdue tasks and upcoming tasks)
    function loadNotifications() {
        const tasks = Storage.getUserTasks(currentUser.id);
        const categories = Storage.getUserCategories(currentUser.id);

        notificationsList.innerHTML = '';

        // Get current date offset from localStorage (set by tasks page)
        const currentDateOffset = parseInt(localStorage.getItem('currentDateOffset') || '0');

        // Today's date for comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Apply the offset to the base date
        const baseDate = new Date(today);
        baseDate.setDate(baseDate.getDate() + currentDateOffset);

        const yesterday = new Date(baseDate);
        yesterday.setDate(yesterday.getDate() - 1);

        const tomorrow = new Date(baseDate);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Convert dates to ISO format (YYYY-MM-DD) for consistent comparison
        const baseDateISO = baseDate.toISOString().split('T')[0];
        const yesterdayISO = yesterday.toISOString().split('T')[0];
        const tomorrowISO = tomorrow.toISOString().split('T')[0];

        // Get overdue tasks relative to the selected date
        const overdueTasks = tasks.filter(task => {
            if (task.status === 'completed' || !task.dueDate) return false;

            // Compare dates in ISO format
            return task.dueDate < baseDateISO;
        });

        // Get tasks due on the selected "today"
        const todayTasks = tasks.filter(task => {
            if (task.status === 'completed' || !task.dueDate) return false;

            // Compare dates in ISO format
            return task.dueDate === baseDateISO;
        });

        // Get tasks due on the selected "tomorrow"
        const tomorrowTasks = tasks.filter(task => {
            if (task.status === 'completed' || !task.dueDate) return false;

            // Compare dates in ISO format
            return task.dueDate === tomorrowISO;
        });

        // Get tasks from the selected "yesterday"
        const yesterdayTasks = tasks.filter(task => {
            if (task.status === 'completed' || !task.dueDate) return false;

            // Compare dates in ISO format
            return task.dueDate === yesterdayISO;
        });

        // Update notification badge
        const totalNotifications = overdueTasks.length;
        if (totalNotifications > 0) {
            notificationBadge.textContent = totalNotifications;
            notificationBadge.classList.remove('d-none');
        } else {
            notificationBadge.classList.add('d-none');
        }

        // Get the date labels based on offset
        let yesterdayLabel = 'Yesterday';
        let todayLabel = 'Today';
        let tomorrowLabel = 'Tomorrow';

        if (currentDateOffset !== 0) {
            yesterdayLabel = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(yesterday);
            todayLabel = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(baseDate);
            tomorrowLabel = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(tomorrow);
        }

        // Add reference date information if we're not viewing the actual today
        if (currentDateOffset !== 0) {
            const referenceInfo = document.createElement('div');
            referenceInfo.className = 'alert alert-info';
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            // Convert to local date format ONLY for display
            referenceInfo.innerHTML = `<strong>Note:</strong> You are viewing notifications for <strong>${baseDate.toLocaleDateString('en-US', options)}</strong> (${currentDateOffset > 0 ? currentDateOffset + ' days ahead' : Math.abs(currentDateOffset) + ' days ago'})`;
            notificationsList.appendChild(referenceInfo);
        }

        // Display overdue tasks
        if (overdueTasks.length > 0) {
            const overdueHeader = document.createElement('h5');
            overdueHeader.className = 'text-danger mt-3';
            overdueHeader.textContent = 'Overdue Tasks';
            notificationsList.appendChild(overdueHeader);

            overdueTasks.forEach(task => {
                const category = categories.find(c => c.id === task.categoryId);

                const notificationItem = document.createElement('a');
                notificationItem.href = 'tasks.html';
                notificationItem.className = 'list-group-item list-group-item-action list-group-item-danger';

                const taskTitle = document.createElement('div');
                taskTitle.className = 'd-flex justify-content-between align-items-center';

                const title = document.createElement('h6');
                title.className = 'mb-0';
                title.textContent = task.title;

                const dueDate = document.createElement('small');
                // Convert to local date format ONLY for display
                const displayDate = new Date(task.dueDate + 'T12:00:00Z');
                dueDate.textContent = `Due: ${displayDate.toLocaleDateString()}`;

                taskTitle.appendChild(title);
                taskTitle.appendChild(dueDate);

                const description = document.createElement('p');
                description.className = 'mb-0 small';
                description.textContent = task.description || 'No description';

                const categoryBadge = document.createElement('small');
                categoryBadge.className = 'd-block mt-1';
                categoryBadge.textContent = category ? `Category: ${category.name}` : '';

                notificationItem.appendChild(taskTitle);
                notificationItem.appendChild(description);
                notificationItem.appendChild(categoryBadge);

                notificationsList.appendChild(notificationItem);
            });
        }

        // Display yesterday's tasks
        if (yesterdayTasks.length > 0) {
            const yesterdayHeader = document.createElement('h5');
            yesterdayHeader.className = 'text-warning mt-3';
            yesterdayHeader.textContent = `${yesterdayLabel}'s Tasks`;
            notificationsList.appendChild(yesterdayHeader);

            yesterdayTasks.forEach(task => {
                const category = categories.find(c => c.id === task.categoryId);

                const notificationItem = document.createElement('a');
                notificationItem.href = 'tasks.html';
                notificationItem.className = 'list-group-item list-group-item-action list-group-item-warning';

                const taskTitle = document.createElement('div');
                taskTitle.className = 'd-flex justify-content-between align-items-center';

                const title = document.createElement('h6');
                title.className = 'mb-0';
                title.textContent = task.title;

                taskTitle.appendChild(title);

                const description = document.createElement('p');
                description.className = 'mb-0 small';
                description.textContent = task.description || 'No description';

                const categoryBadge = document.createElement('small');
                categoryBadge.className = 'd-block mt-1';
                categoryBadge.textContent = category ? `Category: ${category.name}` : '';

                notificationItem.appendChild(taskTitle);
                notificationItem.appendChild(description);
                notificationItem.appendChild(categoryBadge);

                notificationsList.appendChild(notificationItem);
            });
        }

        // Display today's tasks
        if (todayTasks.length > 0) {
            const todayHeader = document.createElement('h5');
            todayHeader.className = 'text-primary mt-3';
            todayHeader.textContent = `Due ${todayLabel}`;
            notificationsList.appendChild(todayHeader);

            todayTasks.forEach(task => {
                const category = categories.find(c => c.id === task.categoryId);

                const notificationItem = document.createElement('a');
                notificationItem.href = 'tasks.html';
                notificationItem.className = 'list-group-item list-group-item-action list-group-item-primary';

                const taskTitle = document.createElement('div');
                taskTitle.className = 'd-flex justify-content-between align-items-center';

                const title = document.createElement('h6');
                title.className = 'mb-0';
                title.textContent = task.title;

                taskTitle.appendChild(title);

                const description = document.createElement('p');
                description.className = 'mb-0 small';
                description.textContent = task.description || 'No description';

                const categoryBadge = document.createElement('small');
                categoryBadge.className = 'd-block mt-1';
                categoryBadge.textContent = category ? `Category: ${category.name}` : '';

                notificationItem.appendChild(taskTitle);
                notificationItem.appendChild(description);
                notificationItem.appendChild(categoryBadge);

                notificationsList.appendChild(notificationItem);
            });
        }

        // Display tomorrow's tasks
        if (tomorrowTasks.length > 0) {
            const tomorrowHeader = document.createElement('h5');
            tomorrowHeader.className = 'text-info mt-3';
            tomorrowHeader.textContent = `Due ${tomorrowLabel}`;
            notificationsList.appendChild(tomorrowHeader);

            tomorrowTasks.forEach(task => {
                const category = categories.find(c => c.id === task.categoryId);

                const notificationItem = document.createElement('a');
                notificationItem.href = 'tasks.html';
                notificationItem.className = 'list-group-item list-group-item-action list-group-item-info';

                const taskTitle = document.createElement('div');
                taskTitle.className = 'd-flex justify-content-between align-items-center';

                const title = document.createElement('h6');
                title.className = 'mb-0';
                title.textContent = task.title;

                taskTitle.appendChild(title);

                const description = document.createElement('p');
                description.className = 'mb-0 small';
                description.textContent = task.description || 'No description';

                const categoryBadge = document.createElement('small');
                categoryBadge.className = 'd-block mt-1';
                categoryBadge.textContent = category ? `Category: ${category.name}` : '';

                notificationItem.appendChild(taskTitle);
                notificationItem.appendChild(description);
                notificationItem.appendChild(categoryBadge);

                notificationsList.appendChild(notificationItem);
            });
        }

        // If no notifications
        if (overdueTasks.length === 0 && todayTasks.length === 0 && tomorrowTasks.length === 0 && yesterdayTasks.length === 0) {
            const noNotifications = document.createElement('div');
            noNotifications.className = 'alert alert-success';
            noNotifications.textContent = 'You have no pending notifications!';
            notificationsList.appendChild(noNotifications);
        }
    }

    // Initialize notifications
    loadNotifications();

    // Add a date navigation control if we're on the notifications page
    if (window.location.pathname.indexOf('/notifications.html') > -1) {
        // Create a button to return to the current day view
        const resetDateView = document.createElement('button');
        resetDateView.className = 'btn btn-outline-primary mt-3';
        resetDateView.textContent = 'Reset to Today';
        resetDateView.addEventListener('click', function () {
            localStorage.setItem('currentDateOffset', '0');
            loadNotifications();
        });

        // Only show the reset button if we're not already on the current day
        const currentDateOffset = parseInt(localStorage.getItem('currentDateOffset') || '0');
        if (currentDateOffset !== 0) {
            const container = document.querySelector('.container');
            if (container && notificationsList) {
                container.insertBefore(resetDateView, notificationsList);
            }
        }
    }
});