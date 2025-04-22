const Storage = {
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    getUsers() {
        return JSON.parse(localStorage.getItem('users') || '[]');
    },

    saveUsers(users) {
        localStorage.setItem('users', JSON.stringify(users));
    },

    getTasks() {
        return JSON.parse(localStorage.getItem('tasks') || '[]');
    },

    saveTasks(tasks) {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    },

    getCategories() {
        return JSON.parse(localStorage.getItem('categories') || '[]');
    },

    saveCategories(categories) {
        localStorage.setItem('categories', JSON.stringify(categories));
    },

    getCurrentUser() {
        return JSON.parse(localStorage.getItem('currentUser'));
    },

    setCurrentUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    },

    clearCurrentUser() {
        localStorage.removeItem('currentUser');
    },

    getUserTasks(userId) {
        return this.getTasks().filter(task => task.userId === userId);
    },

    getUserCategories(userId) {
        return this.getCategories().filter(category => category.userId === userId);
    }
};