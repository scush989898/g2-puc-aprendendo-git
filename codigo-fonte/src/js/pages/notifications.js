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

        // Today's date for comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get overdue tasks
        const overdueTasks = tasks.filter(task => {
            if (task.status === 'completed' || !task.dueDate) return false;

            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0);

            return dueDate < today;
        });

        // Get tasks due today
        const todayTasks = tasks.filter(task => {
            if (task.status === 'completed' || !task.dueDate) return false;

            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0);

            return dueDate.getTime() === today.getTime();
        });

        // Get tasks due tomorrow
        const tomorrowTasks = tasks.filter(task => {
            if (task.status === 'completed' || !task.dueDate) return false;

            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0);

            return dueDate.getTime() === tomorrow.getTime();
        });

        // Update notification badge
        const totalNotifications = overdueTasks.length;
        if (totalNotifications > 0) {
            notificationBadge.textContent = totalNotifications;
            notificationBadge.classList.remove('d-none');
        } else {
            notificationBadge.classList.add('d-none');
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
                dueDate.textContent = `Due: ${new Date(task.dueDate).toLocaleDateString()}`;

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

        // Display today's tasks
        if (todayTasks.length > 0) {
            const todayHeader = document.createElement('h5');
            todayHeader.className = 'text-primary mt-3';
            todayHeader.textContent = 'Due Today';
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
            tomorrowHeader.textContent = 'Due Tomorrow';
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
        if (overdueTasks.length === 0 && todayTasks.length === 0 && tomorrowTasks.length === 0) {
            const noNotifications = document.createElement('div');
            noNotifications.className = 'alert alert-success';
            noNotifications.textContent = 'You have no pending notifications!';
            notificationsList.appendChild(noNotifications);
        }
    }

    // Initialize
    loadNotifications();
});