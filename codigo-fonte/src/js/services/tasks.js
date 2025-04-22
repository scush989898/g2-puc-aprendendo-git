document.addEventListener('DOMContentLoaded', function () {
    // Get current user
    const currentUser = Storage.getCurrentUser();
    if (!currentUser && window.location.pathname.indexOf('/tasks.html') > -1) {
        window.location.href = 'login.html';
        return;
    }

    // DOM elements
    const taskDaysContainer = document.getElementById('taskDays');
    const taskListContainer = document.getElementById('taskList');
    const horizontalView = document.getElementById('horizontalView');
    const verticalView = document.getElementById('verticalView');
    const toggleViewBtn = document.getElementById('toggleViewBtn');
    const statusFilter = document.getElementById('statusFilter');
    const categoryFilter = document.getElementById('categoryFilter');

    // Task repeat checkbox handler
    const taskRepeatCheckbox = document.getElementById('taskRepeat');
    const repeatOptions = document.getElementById('repeatOptions');
    if (taskRepeatCheckbox) {
        taskRepeatCheckbox.addEventListener('change', function () {
            repeatOptions.classList.toggle('d-none', !this.checked);
        });
    }

    const editTaskRepeatCheckbox = document.getElementById('editTaskRepeat');
    const editRepeatOptions = document.getElementById('editRepeatOptions');
    if (editTaskRepeatCheckbox) {
        editTaskRepeatCheckbox.addEventListener('change', function () {
            editRepeatOptions.classList.toggle('d-none', !this.checked);
        });
    }

    // Save task button handler
    const saveTaskBtn = document.getElementById('saveTaskBtn');
    if (saveTaskBtn) {
        saveTaskBtn.addEventListener('click', function () {
            const title = document.getElementById('taskTitle').value;
            const description = document.getElementById('taskDescription').value;
            const categoryId = document.getElementById('taskCategory').value;
            const dueDate = document.getElementById('taskDueDate').value;
            const notes = document.getElementById('taskNotes').value;
            const repeat = document.getElementById('taskRepeat').checked;
            const repeatFrequency = repeat ? document.getElementById('repeatFrequency').value : null;

            if (!title) {
                alert('Task title is required');
                return;
            }

            const newTask = {
                id: Storage.generateId(),
                title,
                description,
                categoryId,
                dueDate: dueDate || null,
                notes,
                status: 'active',
                repeat: {
                    enabled: repeat,
                    frequency: repeatFrequency
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                userId: currentUser.id
            };

            const tasks = Storage.getTasks();
            tasks.push(newTask);
            Storage.saveTasks(tasks);

            // Close modal and reset form
            const modal = bootstrap.Modal.getInstance(document.getElementById('addTaskModal'));
            modal.hide();
            document.getElementById('addTaskForm').reset();
            repeatOptions.classList.add('d-none');

            // Reload tasks
            loadTasks();
            updateNotificationBadge();
        });
    }

    // Update task button handler
    const updateTaskBtn = document.getElementById('updateTaskBtn');
    if (updateTaskBtn) {
        updateTaskBtn.addEventListener('click', function () {
            const taskId = document.getElementById('editTaskId').value;
            const title = document.getElementById('editTaskTitle').value;
            const description = document.getElementById('editTaskDescription').value;
            const categoryId = document.getElementById('editTaskCategory').value;
            const dueDate = document.getElementById('editTaskDueDate').value;
            const notes = document.getElementById('editTaskNotes').value;
            const status = document.getElementById('editTaskStatus').value;
            const repeat = document.getElementById('editTaskRepeat').checked;
            const repeatFrequency = repeat ? document.getElementById('editRepeatFrequency').value : null;

            if (!title) {
                alert('Task title is required');
                return;
            }

            const tasks = Storage.getTasks();
            const taskIndex = tasks.findIndex(t => t.id === taskId);

            if (taskIndex !== -1) {
                tasks[taskIndex] = {
                    ...tasks[taskIndex],
                    title,
                    description,
                    categoryId,
                    dueDate: dueDate || null,
                    notes,
                    status,
                    repeat: {
                        enabled: repeat,
                        frequency: repeatFrequency
                    },
                    updatedAt: new Date().toISOString()
                };

                Storage.saveTasks(tasks);

                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('editTaskModal'));
                modal.hide();

                // Reload tasks
                loadTasks();
                updateNotificationBadge();
            }
        });
    }

    // Delete task button handler
    const deleteTaskBtn = document.getElementById('deleteTaskBtn');
    if (deleteTaskBtn) {
        deleteTaskBtn.addEventListener('click', function () {
            if (!confirm('Are you sure you want to delete this task?')) {
                return;
            }

            const taskId = document.getElementById('editTaskId').value;
            const tasks = Storage.getTasks();
            const filteredTasks = tasks.filter(t => t.id !== taskId);

            Storage.saveTasks(filteredTasks);

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editTaskModal'));
            modal.hide();

            // Reload tasks
            loadTasks();
            updateNotificationBadge();
        });
    }

    // Toggle view button handler
    if (toggleViewBtn) {
        toggleViewBtn.addEventListener('click', function () {
            horizontalView.classList.toggle('d-none');
            verticalView.classList.toggle('d-none');

            // Update local storage preference
            localStorage.setItem('taskViewPreference',
                horizontalView.classList.contains('d-none') ? 'vertical' : 'horizontal');
        });
    }

    // Filter handlers
    if (statusFilter) {
        statusFilter.addEventListener('change', loadTasks);
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', loadTasks);
    }

    // Load tasks with filters
    function loadTasks() {
        if (!currentUser) return;

        const tasks = Storage.getUserTasks(currentUser.id);
        const categories = Storage.getUserCategories(currentUser.id);

        // Apply filters
        let filteredTasks = [...tasks];

        if (statusFilter && statusFilter.value !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.status === statusFilter.value);
        }

        if (categoryFilter && categoryFilter.value !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.categoryId === categoryFilter.value);
        }

        // Group tasks by date for horizontal view
        if (taskDaysContainer) {
            taskDaysContainer.innerHTML = '';

            // Get next 3 days
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const dayAfterTomorrow = new Date(today);
            dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

            const days = [
                { date: today, label: 'Today' },
                { date: tomorrow, label: 'Tomorrow' },
                { date: dayAfterTomorrow, label: new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(dayAfterTomorrow) }
            ];

            days.forEach(day => {
                const dayTasks = filteredTasks.filter(task => {
                    if (!task.dueDate) return false;
                    const taskDate = new Date(task.dueDate);
                    taskDate.setHours(0, 0, 0, 0);
                    return taskDate.getTime() === day.date.getTime();
                });

                const dayColumn = document.createElement('div');
                dayColumn.className = 'col-md-4 mb-4';

                const dayCard = document.createElement('div');
                dayCard.className = 'card h-100';

                const cardHeader = document.createElement('div');
                cardHeader.className = 'card-header text-center';
                cardHeader.textContent = day.label;

                const cardBody = document.createElement('div');
                cardBody.className = 'card-body';

                if (dayTasks.length === 0) {
                    const noTasks = document.createElement('p');
                    noTasks.className = 'text-center text-muted';
                    noTasks.textContent = 'No tasks for this day';
                    cardBody.appendChild(noTasks);
                } else {
                    dayTasks.forEach(task => {
                        const category = categories.find(c => c.id === task.categoryId);

                        const taskElement = document.createElement('div');
                        taskElement.className = 'task-item mb-3 p-2 border rounded';
                        taskElement.dataset.taskId = task.id;

                        if (task.status === 'completed') {
                            taskElement.classList.add('task-completed');
                        } else if (task.status === 'inactive') {
                            taskElement.classList.add('task-inactive');
                        }

                        // Add category color indicator
                        if (category) {
                            taskElement.style.borderLeft = `4px solid ${category.color}`;
                        }

                        const taskTitle = document.createElement('div');
                        taskTitle.className = 'd-flex justify-content-between align-items-center';

                        const titleText = document.createElement('h6');
                        titleText.className = 'mb-0';
                        titleText.textContent = task.title;

                        const statusToggle = document.createElement('div');
                        statusToggle.className = 'form-check';

                        const checkbox = document.createElement('input');
                        checkbox.className = 'form-check-input';
                        checkbox.type = 'checkbox';
                        checkbox.checked = task.status === 'completed';
                        checkbox.dataset.taskId = task.id;
                        checkbox.addEventListener('change', function () {
                            toggleTaskStatus(this.dataset.taskId, this.checked);
                        });

                        statusToggle.appendChild(checkbox);
                        taskTitle.appendChild(titleText);
                        taskTitle.appendChild(statusToggle);

                        const taskDescription = document.createElement('p');
                        taskDescription.className = 'mb-0 small text-muted';
                        taskDescription.textContent = task.description;

                        taskElement.appendChild(taskTitle);
                        taskElement.appendChild(taskDescription);

                        // Edit task on click
                        taskElement.addEventListener('click', function (e) {
                            if (e.target !== checkbox) {
                                openEditTaskModal(task.id);
                            }
                        });

                        cardBody.appendChild(taskElement);
                    });
                }

                dayCard.appendChild(cardHeader);
                dayCard.appendChild(cardBody);
                dayColumn.appendChild(dayCard);
                taskDaysContainer.appendChild(dayColumn);
            });
        }

        // Populate vertical list view
        if (taskListContainer) {
            taskListContainer.innerHTML = '';

            if (filteredTasks.length === 0) {
                const noTasks = document.createElement('div');
                noTasks.className = 'alert alert-info text-center';
                noTasks.textContent = 'No tasks found';
                taskListContainer.appendChild(noTasks);
            } else {
                filteredTasks.sort((a, b) => {
                    // Sort by due date first
                    if (a.dueDate && b.dueDate) {
                        return new Date(a.dueDate) - new Date(b.dueDate);
                    }
                    if (a.dueDate) return -1;
                    if (b.dueDate) return 1;

                    // Then by status (active first)
                    if (a.status !== b.status) {
                        if (a.status === 'active') return -1;
                        if (b.status === 'active') return 1;
                        if (a.status === 'inactive') return -1;
                        if (b.status === 'inactive') return 1;
                    }

                    // Finally by creation date
                    return new Date(b.createdAt) - new Date(a.createdAt);
                });

                filteredTasks.forEach(task => {
                    const category = categories.find(c => c.id === task.categoryId);

                    const taskElement = document.createElement('div');
                    taskElement.className = 'list-group-item list-group-item-action d-flex align-items-center';
                    taskElement.dataset.taskId = task.id;

                    if (task.status === 'completed') {
                        taskElement.classList.add('task-completed');
                    } else if (task.status === 'inactive') {
                        taskElement.classList.add('task-inactive');
                    }

                    // Status toggle
                    const statusToggle = document.createElement('div');
                    statusToggle.className = 'form-check me-3';

                    const checkbox = document.createElement('input');
                    checkbox.className = 'form-check-input';
                    checkbox.type = 'checkbox';
                    checkbox.checked = task.status === 'completed';
                    checkbox.dataset.taskId = task.id;
                    checkbox.addEventListener('change', function (e) {
                        e.stopPropagation();
                        toggleTaskStatus(this.dataset.taskId, this.checked);
                    });

                    statusToggle.appendChild(checkbox);

                    // Task content
                    const taskContent = document.createElement('div');
                    taskContent.className = 'flex-grow-1';

                    const taskTitle = document.createElement('h6');
                    taskTitle.className = 'mb-0';
                    taskTitle.textContent = task.title;

                    const taskDescription = document.createElement('p');
                    taskDescription.className = 'mb-0 small text-muted';
                    taskDescription.textContent = task.description;

                    taskContent.appendChild(taskTitle);
                    taskContent.appendChild(taskDescription);

                    // Due date
                    const dueDate = document.createElement('div');
                    dueDate.className = 'ms-auto text-end';

                    if (task.dueDate) {
                        const date = new Date(task.dueDate);
                        dueDate.textContent = date.toLocaleDateString();

                        // Highlight overdue tasks
                        if (date < new Date() && task.status !== 'completed') {
                            dueDate.className += ' text-danger';
                        }
                    }

                    // Category badge
                    const categoryBadge = document.createElement('span');
                    categoryBadge.className = 'badge rounded-pill d-block mt-1';

                    if (category) {
                        categoryBadge.textContent = category.name;
                        categoryBadge.style.backgroundColor = category.color;
                    }

                    dueDate.appendChild(categoryBadge);

                    // Assemble task item
                    taskElement.appendChild(statusToggle);
                    taskElement.appendChild(taskContent);
                    taskElement.appendChild(dueDate);

                    // Edit task on click
                    taskElement.addEventListener('click', function (e) {
                        if (e.target !== checkbox) {
                            openEditTaskModal(task.id);
                        }
                    });

                    taskListContainer.appendChild(taskElement);
                });
            }
        }
    }

    // Toggle task status
    function toggleTaskStatus(taskId, isCompleted) {
        const tasks = Storage.getTasks();
        const taskIndex = tasks.findIndex(t => t.id === taskId);

        if (taskIndex !== -1) {
            tasks[taskIndex].status = isCompleted ? 'completed' : 'active';
            tasks[taskIndex].updatedAt = new Date().toISOString();

            Storage.saveTasks(tasks);
            loadTasks();
            updateNotificationBadge();
        }
    }

    // Open edit task modal
    function openEditTaskModal(taskId) {
        const tasks = Storage.getTasks();
        const task = tasks.find(t => t.id === taskId);

        if (task) {
            document.getElementById('editTaskId').value = task.id;
            document.getElementById('editTaskTitle').value = task.title;
            document.getElementById('editTaskDescription').value = task.description;
            document.getElementById('editTaskCategory').value = task.categoryId;

            if (task.dueDate) {
                document.getElementById('editTaskDueDate').value = task.dueDate;
            } else {
                document.getElementById('editTaskDueDate').value = '';
            }

            document.getElementById('editTaskNotes').value = task.notes || '';
            document.getElementById('editTaskStatus').value = task.status;

            document.getElementById('editTaskRepeat').checked = task.repeat?.enabled || false;
            editRepeatOptions.classList.toggle('d-none', !task.repeat?.enabled);

            if (task.repeat?.enabled) {
                document.getElementById('editRepeatFrequency').value = task.repeat.frequency;
            }

            // Open modal
            const modal = new bootstrap.Modal(document.getElementById('editTaskModal'));
            modal.show();
        }
    }

    // Update notification badge
    function updateNotificationBadge() {
        const badge = document.getElementById('notificationBadge');
        if (!badge) return;

        const tasks = Storage.getUserTasks(currentUser.id);

        // Count overdue tasks
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const overdueTasks = tasks.filter(task => {
            if (task.status === 'completed' || !task.dueDate) return false;

            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0);

            return dueDate < today;
        });

        if (overdueTasks.length > 0) {
            badge.textContent = overdueTasks.length;
            badge.classList.remove('d-none');
        } else {
            badge.classList.add('d-none');
        }
    }

    // Initialize
    if (taskDaysContainer || taskListContainer) {
        loadTasks();
        updateNotificationBadge();

        // Set view preference
        const viewPreference = localStorage.getItem('taskViewPreference');
        if (viewPreference === 'vertical') {
            horizontalView.classList.add('d-none');
            verticalView.classList.remove('d-none');
        }
    }
});