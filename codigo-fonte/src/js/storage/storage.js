const Storage = {
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    getUsers() {
        return JSON.parse(localStorage.getItem('organizai_users') || '[]');
    },

    saveUsers(users) {
        localStorage.setItem('organizai_users', JSON.stringify(users));
    },

    getTasks() {
        return JSON.parse(localStorage.getItem('organizai_tasks') || '[]');
    },

    saveTasks(tasks) {
        localStorage.setItem('organizai_tasks', JSON.stringify(tasks));
    },

    getCategories() {
        const defaultCategories = [
            { id: 'default-1', name: "Urgente", color: "#e53935", userId: "default" },
            { id: 'default-2', name: "Média Prioridade", color: "#fbc02d", userId: "default" },
            { id: 'default-3', name: "Rotina", color: "#43a047", userId: "default" },
            { id: 'default-4', name: "Trabalho", color: "#0288d1", userId: "default" }
        ];

        const categories = JSON.parse(localStorage.getItem('organizai_categories') || '[]');
        return categories.length ? categories : defaultCategories;
    },

    saveCategories(categories) {
        localStorage.setItem('organizai_categories', JSON.stringify(categories));
    },

    getNotifications() {
        return JSON.parse(localStorage.getItem('organizai_notifications') || '[]');
    },

    saveNotifications(notifications) {
        localStorage.setItem('organizai_notifications', JSON.stringify(notifications));
    },

    getCurrentUser() {
        return JSON.parse(localStorage.getItem('organizai_currentUser') || sessionStorage.getItem('organizai_currentUser') || 'null');
    },

    setCurrentUser(user, remember = false) {
        if (remember) {
            localStorage.setItem('organizai_currentUser', JSON.stringify(user));
        } else {
            sessionStorage.setItem('organizai_currentUser', JSON.stringify(user));
        }
    },

    clearCurrentUser() {
        localStorage.removeItem('organizai_currentUser');
        sessionStorage.removeItem('organizai_currentUser');
    },

    getUserTasks(userId) {
        return this.getTasks().filter(task => task.userId === userId);
    },

    getUserCategories(userId) {
        const defaultCategories = [
            { id: 'default-1', name: "Urgente", color: "#e53935", userId: "default" },
            { id: 'default-2', name: "Média Prioridade", color: "#fbc02d", userId: "default" },
            { id: 'default-3', name: "Rotina", color: "#43a047", userId: "default" },
            { id: 'default-4', name: "Trabalho", color: "#0288d1", userId: "default" }
        ];

        const userCategories = this.getCategories().filter(
            category => category.userId === userId || category.userId === "default"
        );

        return userCategories.length ? userCategories : defaultCategories;
    },

    getUserNotifications(userId) {
        return this.getNotifications()
            .filter(notification => notification.userId === userId)
            .filter(notification => notification.read == false);
    },

    saveUserPreferences(userId, preferences) {
        const key = `organizai_preferences_${userId}`;
        localStorage.setItem(key, JSON.stringify(preferences));
    },

    getUserPreferences(userId) {
        const key = `organizai_preferences_${userId}`;
        return JSON.parse(localStorage.getItem(key) || '{}');
    }
};