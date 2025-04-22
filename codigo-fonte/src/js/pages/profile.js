// profile.js

document.addEventListener('DOMContentLoaded', function () {
    const currentUser = Storage.getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Fill profile form
    document.getElementById('profileName').value = currentUser.name;
    document.getElementById('profileEmail').value = currentUser.email;

    // Convert ISO date to local date format ONLY for display
    const createdDate = new Date(currentUser.createdAt);
    document.getElementById('createdAt').value = createdDate.toLocaleDateString();

    // Handle form submission
    document.getElementById('profileForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('profileName').value;

        if (!name) {
            alert('Name is required');
            return;
        }

        // Update user
        const users = Storage.getUsers();
        const userIndex = users.findIndex(u => u.id === currentUser.id);

        if (userIndex !== -1) {
            users[userIndex].name = name;
            Storage.saveUsers(users);

            // Update current user
            currentUser.name = name;
            Storage.setCurrentUser(currentUser);

            alert('Profile updated successfully');
        }
    });

    // Update notification badge
    const badge = document.getElementById('notificationBadge');
    if (badge) {
        const tasks = Storage.getUserTasks(currentUser.id);

        // Get today's date in UTC
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Count overdue tasks
        const overdueTasks = tasks.filter(task => {
            if (task.status === 'completed' || !task.dueDate) return false;

            // Parse the ISO date string directly
            const dueDate = new Date(task.dueDate + 'T12:00:00Z');
            return dueDate < today;
        });

        if (overdueTasks.length > 0) {
            badge.textContent = overdueTasks.length;
            badge.classList.remove('d-none');
        } else {
            badge.classList.add('d-none');
        }
    }
});