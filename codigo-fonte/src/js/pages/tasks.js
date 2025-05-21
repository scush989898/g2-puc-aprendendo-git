// tasks.js
import {
    standardizeDate,
    configureInputDateFormat,
    dateToHtmlInputFormat,
    formatDateForDisplay
} from '../utils/date.js'


let currentDateOffset = 0;
let tasksData = [];
let categoriesData = [];
let currentViewIsHorizontal = true;
let holidaysData = [];



async function initTasksManager() {
    const currentUser = Storage.getCurrentUser();
    if (!currentUser) return;

    holidaysData = await fetchBrazilianHolidays();

    tasksData = Storage.getUserTasks(currentUser.id);
    categoriesData = Storage.getUserCategories(currentUser.id);

    const viewPreference = localStorage.getItem('taskViewPreference') || 'horizontal';
    currentViewIsHorizontal = viewPreference === 'horizontal';

    configureInputDateFormat();
    initializeUIElements();
    setupDateNavigation();
    loadTasks();
    loadCategories();
}


function initializeUIElements() {
    // Toggle de visualização
    const toggleViewBtn = document.getElementById('toggleViewBtn');
    const horizontalView = document.getElementById('horizontalView');
    const verticalView = document.getElementById('verticalView');

    if (toggleViewBtn) {
        toggleViewBtn.addEventListener('click', function () {
            toggleTaskView();
        });
    }

    if (horizontalView && verticalView) {
        horizontalView.classList.toggle('d-none', !currentViewIsHorizontal);
        verticalView.classList.toggle('d-none', currentViewIsHorizontal);
    }

    const taskRepeatCheckbox = document.getElementById('taskRepeat');
    const repeatOptions = document.getElementById('repeatOptions');

    if (taskRepeatCheckbox && repeatOptions) {
        taskRepeatCheckbox.addEventListener('change', function () {
            repeatOptions.classList.toggle('d-none', !this.checked);
        });
    }

    const editTaskRepeatCheckbox = document.getElementById('editTaskRepeat');
    const editRepeatOptions = document.getElementById('editRepeatOptions');

    if (editTaskRepeatCheckbox && editRepeatOptions) {
        editTaskRepeatCheckbox.addEventListener('change', function () {
            editRepeatOptions.classList.toggle('d-none', !this.checked);
        });
    }

    setupFormHandlers();
    setupFilters();
    setupModalListeners();
}

function setupModalListeners() {
    const modals = ['addTaskModal', 'editTaskModal', 'addCategoryModal'];

    modals.forEach(modalId => {
        const modalElement = document.getElementById(modalId);
        if (modalElement) {
            modalElement.addEventListener('hidden.bs.modal', function () {
                const backdrops = document.getElementsByClassName('modal-backdrop');
                while (backdrops.length > 0) {
                    backdrops[0].parentNode.removeChild(backdrops[0]);
                }

                document.body.classList.remove('modal-open');
                document.body.style.overflow = '';
                document.body.style.paddingRight = '';
            });
        }
    });
}

function setupFormHandlers() {
    const addTaskForm = document.getElementById('addTaskForm');
    const saveTaskBtn = document.getElementById('saveTaskBtn');

    if (addTaskForm && saveTaskBtn) {
        saveTaskBtn.addEventListener('click', function () {
            createTask();
        });
    }

    const updateTaskBtn = document.getElementById('updateTaskBtn');
    if (updateTaskBtn) {
        updateTaskBtn.addEventListener('click', function () {
            updateTask();
        });
    }

    const deleteTaskBtn = document.getElementById('deleteTaskBtn');
    if (deleteTaskBtn) {
        deleteTaskBtn.addEventListener('click', function () {
            if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
                deleteTask();
            }
        });
    }

    const categoryForm = document.getElementById('categoryForm');
    if (categoryForm) {
        categoryForm.addEventListener('submit', function (e) {
            e.preventDefault();
            createCategory();
        });
    }
}

/**
 * RF-20: Implementar API para busca de feriados
 */
async function fetchBrazilianHolidays() {
    const currentYear = new Date().getFullYear();
    try {
        const response = await fetch(`https://brasilapi.com.br/api/feriados/v1/${currentYear}`);
        if (!response.ok) {
            throw new Error('Falha ao buscar feriados');
        }
        const holidaysData = await response.json();
        return holidaysData;
    } catch (error) {
        console.error('Erro ao buscar feriados:', error);
        return [
            { date: `${currentYear}-01-01`, name: "Confraternização Universal" },
            { date: `${currentYear}-04-21`, name: "Tiradentes" },
            { date: `${currentYear}-05-01`, name: "Dia do Trabalho" },
            { date: `${currentYear}-09-07`, name: "Independência do Brasil" },
            { date: `${currentYear}-10-12`, name: "Nossa Senhora Aparecida" },
            { date: `${currentYear}-11-02`, name: "Finados" },
            { date: `${currentYear}-11-15`, name: "Proclamação da República" },
            { date: `${currentYear}-12-25`, name: "Natal" }
        ];
    }
}

function isHoliday(date) {
    if (!date || !holidaysData.length) return null;

    const formattedDate = dateToHtmlInputFormat(date).substring(0, 10); // YYYY-MM-DD
    return holidaysData.find(holiday => holiday.date === formattedDate) || null;
}



/**
 * RF-06: Configurar categorias nas dropdowns
 */
function loadCategories() {
    const currentUser = Storage.getCurrentUser();
    if (!currentUser) return;

    const categories = Storage.getUserCategories(currentUser.id);

    const categoryDropdowns = document.querySelectorAll('#taskCategory, #editTaskCategory');
    const categoryFilter = document.getElementById('categoryFilter');

    const populateDropdown = (dropdown) => {
        if (!dropdown) return;

        dropdown.innerHTML = dropdown.id === 'categoryFilter'
            ? '<option value="all">Todas as Categorias</option>'
            : '';

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            option.style.color = category.color;
            dropdown.appendChild(option);
        });
    };

    categoryDropdowns.forEach(populateDropdown);
    if (categoryFilter) populateDropdown(categoryFilter);

    renderCategoriesList();
}

function renderCategoriesList() {
    const categoriesList = document.getElementById('categoriesList');
    if (!categoriesList) return;

    const currentUser = Storage.getCurrentUser();
    if (!currentUser) return;

    const categories = Storage.getUserCategories(currentUser.id);

    categoriesList.innerHTML = '';
    categories.forEach(cat => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="category-circle" style="background:${cat.color};"></span>${cat.name}`;
        categoriesList.appendChild(li);
    });
}

/**
 * RF-01: Criar nova tarefa
 */
function createTask() {
    const currentUser = Storage.getCurrentUser();
    if (!currentUser) return;

    const taskTitle = document.getElementById('taskTitle').value.trim();
    const taskDescription = document.getElementById('taskDescription').value.trim();
    const taskCategory = document.getElementById('taskCategory').value;
    const taskDueDate = document.getElementById('taskDueDate').value;
    const taskRepeat = document.getElementById('taskRepeat').checked;
    const repeatFrequency = taskRepeat ? document.getElementById('repeatFrequency').value : null;

    if (!taskTitle) {
        alert('Por favor, informe um título para a tarefa.');
        return;
    }

    const newTask = {
        id: Storage.generateId(),
        userId: currentUser.id,
        title: taskTitle,
        description: taskDescription,
        categoryId: taskCategory,
        dueDate: standardizeDate(taskDueDate),
        status: 'active', // active, completed
        repeat: taskRepeat,
        repeatFrequency: repeatFrequency,
        createdAt: standardizeDate(),
        updatedAt: standardizeDate()
    };

    const tasks = Storage.getTasks();
    tasks.push(newTask);
    Storage.saveTasks(tasks);

    createNotification({
        type: 'info',
        title: 'Nova Tarefa',
        message: `A tarefa "${taskTitle}" foi criada.`,
        relatedTo: newTask.id
    });

    loadTasks();

    const modal = bootstrap.Modal.getInstance(document.getElementById('addTaskModal'));
    if (modal) {
        document.getElementById('addTaskForm').reset();
        document.getElementById('repeatOptions').classList.add('d-none');
        modal.hide();

        ensureModalIsClosed('addTaskModal');
    }
}

function ensureModalIsClosed(modalId) {
    const backdrops = document.getElementsByClassName('modal-backdrop');
    while (backdrops.length > 0) {
        backdrops[0].parentNode.removeChild(backdrops[0]);
    }

    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
}

/**
 * RF-04: Atualizar tarefa
 */
function updateTask() {
    const currentUser = Storage.getCurrentUser();
    if (!currentUser) return;

    const taskId = document.getElementById('editTaskId').value;
    const taskTitle = document.getElementById('editTaskTitle').value.trim();
    const taskDescription = document.getElementById('editTaskDescription').value.trim();
    const taskCategory = document.getElementById('editTaskCategory').value;
    const taskDueDate = document.getElementById('editTaskDueDate').value;
    const taskRepeat = document.getElementById('editTaskRepeat').checked;
    const repeatFrequency = taskRepeat ? document.getElementById('editRepeatFrequency').value : null;

    if (!taskTitle) {
        alert('Por favor, informe um título para a tarefa.');
        return;
    }

    const tasks = Storage.getTasks();
    const taskIndex = tasks.findIndex(task => task.id === taskId);

    if (taskIndex >= 0) {
        const updatedTask = {
            ...tasks[taskIndex],
            title: taskTitle,
            description: taskDescription,
            categoryId: taskCategory,
            dueDate: standardizeDate(taskDueDate),
            repeat: taskRepeat,
            repeatFrequency: repeatFrequency,
            updatedAt: standardizeDate()
        };

        tasks[taskIndex] = updatedTask;
        Storage.saveTasks(tasks);

        createNotification({
            type: 'info',
            title: 'Tarefa Atualizada',
            message: `A tarefa "${taskTitle}" foi atualizada.`,
            relatedTo: taskId
        });

        loadTasks();

        const modal = bootstrap.Modal.getInstance(document.getElementById('editTaskModal'));
        if (modal) {
            modal.hide();

            ensureModalIsClosed('editTaskModal');
        }
    }
}

/**
 * RF-05: Excluir tarefa
 */
function deleteTask() {
    const taskId = document.getElementById('editTaskId').value;
    if (!taskId) return;

    const tasks = Storage.getTasks();
    const taskIndex = tasks.findIndex(task => task.id === taskId);

    if (taskIndex >= 0) {
        const deletedTask = tasks[taskIndex];
        tasks.splice(taskIndex, 1);
        Storage.saveTasks(tasks);

        createNotification({
            type: 'warning',
            title: 'Tarefa Excluída',
            message: `A tarefa "${deletedTask.title}" foi excluída.`,
            relatedTo: null
        });

        loadTasks();

        const modal = bootstrap.Modal.getInstance(document.getElementById('editTaskModal'));
        if (modal) {
            modal.hide();

            ensureModalIsClosed('editTaskModal');
        }
    }
}

/**
 * RF-03: Marcar tarefa como concluída/não concluída
 */
function toggleTaskStatus(taskId, completed) {
    const tasks = Storage.getTasks();
    const taskIndex = tasks.findIndex(task => task.id === taskId);

    if (taskIndex >= 0) {
        const taskStatus = completed ? 'completed' : 'active';
        tasks[taskIndex].status = taskStatus;
        tasks[taskIndex].updatedAt = standardizeDate();

        if (completed) {
            tasks[taskIndex].completedAt = standardizeDate();
        } else {
            delete tasks[taskIndex].completedAt;
        }

        Storage.saveTasks(tasks);

        const task = tasks[taskIndex];
        createNotification({
            type: completed ? 'success' : 'info',
            title: completed ? 'Tarefa Concluída' : 'Tarefa Reaberta',
            message: completed
                ? `A tarefa "${task.title}" foi marcada como concluída.`
                : `A tarefa "${task.title}" foi reaberta.`,
            relatedTo: taskId
        });

        loadTasks();
    }
}

/**
 * RF-06: Criar nova categoria
 */
function createCategory() {
    const currentUser = Storage.getCurrentUser();
    if (!currentUser) return;

    const categoryName = document.getElementById('categoryName').value.trim();
    const categoryColor = document.getElementById('categoryColor').value;

    if (!categoryName) {
        alert('Por favor, informe um nome para a categoria.');
        return;
    }

    const categories = Storage.getCategories();
    const userCategories = categories.filter(cat =>
        cat.userId === currentUser.id || cat.userId === "default"
    );

    if (userCategories.some(cat => cat.name.toLowerCase() === categoryName.toLowerCase())) {
        document.getElementById('categoryName').value = "";
        document.getElementById('categoryName').placeholder = "Já existe!";
        document.getElementById('categoryName').classList.add("is-invalid");
        setTimeout(() => document.getElementById('categoryName').classList.remove("is-invalid"), 1200);
        return;
    }

    const newCategory = {
        id: Storage.generateId(),
        userId: currentUser.id,
        name: categoryName,
        color: categoryColor,
        createdAt: standardizeDate()
    };

    categories.push(newCategory);
    Storage.saveCategories(categories);

    loadCategories();

    const modal = bootstrap.Modal.getInstance(document.getElementById('addCategoryModal'));
    if (modal) {
        document.getElementById('categoryName').value = '';
        document.getElementById('categoryColor').value = '#FF7F3E';
        modal.hide();

        ensureModalIsClosed('addCategoryModal');
    }
}

/**
 * RF-12: Configurar navegação de datas
 */
function setupDateNavigation() {
    const dateNavigationContainer = document.querySelector('.date-navigation-container');
    if (!dateNavigationContainer) return;

    currentDateOffset = parseInt(localStorage.getItem('currentDateOffset') || '0');

    const navigationControls = document.createElement('div');
    navigationControls.id = 'dateNavigationControls';
    navigationControls.className = 'mb-4 p-3 bg-light border rounded';

    const today = new Date();
    today.setDate(today.getDate() + currentDateOffset);

    const brazilDate = new Date(today.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    brazilDate.setHours(12, 0, 0, 0);

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = brazilDate.toLocaleDateString('pt-BR', options);

    navigationControls.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-2">
            <h5 class="mb-0">Navegação de datas</h5>
            <button class="btn btn-sm btn-outline-secondary" id="toggleNavControls">
                <i class="bi bi-eye-slash"></i> Esconder
            </button>
        </div>
        
        <div id="dateNavContent">
            <div class="text-center mb-3">
                <div id="currentDateDisplay" class="fw-bold">Visão Atual: ${formattedDate}</div>
            </div>
            <div class="d-flex justify-content-between align-items-center">
                <button class="btn btn-outline-primary" id="prevDayBtn">
                    <i class="bi bi-arrow-left"></i> Dia anterior
                </button>
                <button class="btn btn-primary" id="resetDayBtn">Redefinir para hoje</button>
                <button class="btn btn-outline-primary" id="nextDayBtn">
                    Próximo dia <i class="bi bi-arrow-right"></i>
                </button>
            </div>
        </div>`;

    dateNavigationContainer.appendChild(navigationControls);

    document.getElementById('toggleNavControls').addEventListener('click', function () {
        const controlsContent = document.getElementById('dateNavContent');
        controlsContent.classList.toggle('d-none');
        this.innerHTML = controlsContent.classList.contains('d-none')
            ? '<i class="bi bi-eye"></i> Mostrar'
            : '<i class="bi bi-eye-slash"></i> Esconder';
    });

    document.getElementById('prevDayBtn').addEventListener('click', function () {
        navigateDate(-1);
    });

    document.getElementById('nextDayBtn').addEventListener('click', function () {
        navigateDate(1);
    });

    document.getElementById('resetDayBtn').addEventListener('click', function () {
        navigateDate(0, true);
    });
}

/**
 * RF-12: Navegar entre datas
 */
function navigateDate(offset, reset = false) {
    if (reset) {
        currentDateOffset = 0;
    } else {
        currentDateOffset += offset;
    }

    localStorage.setItem('currentDateOffset', currentDateOffset.toString());

    const today = new Date();
    today.setDate(today.getDate() + currentDateOffset);

    const brazilDate = new Date(today.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    brazilDate.setHours(12, 0, 0, 0); // Padronizar para meio-dia

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = brazilDate.toLocaleDateString('pt-BR', options);

    const currentDateDisplay = document.getElementById('currentDateDisplay');
    if (currentDateDisplay) {
        currentDateDisplay.textContent = `Visão Atual: ${formattedDate}`;
    }

    loadTasks();
}

/**
 * RF-07: Configurar filtros de tarefas
 */
function setupFilters() {
    const statusFilter = document.getElementById('statusFilter');
    const categoryFilter = document.getElementById('categoryFilter');

    if (statusFilter) {
        statusFilter.addEventListener('change', loadTasks);
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', loadTasks);
    }
}

/**
 * RF-08: Alternar entre visualizações
 */
function toggleTaskView() {
    const horizontalView = document.getElementById('horizontalView');
    const verticalView = document.getElementById('verticalView');

    if (!horizontalView || !verticalView) return;

    currentViewIsHorizontal = !currentViewIsHorizontal;

    horizontalView.classList.toggle('d-none', !currentViewIsHorizontal);
    verticalView.classList.toggle('d-none', currentViewIsHorizontal);

    localStorage.setItem('taskViewPreference',
        currentViewIsHorizontal ? 'horizontal' : 'vertical');
}

/**
 * RF-02: Carregar e exibir tarefas
 */
function loadTasks() {
    const currentUser = Storage.getCurrentUser();
    if (!currentUser) return;

    const statusFilter = document.getElementById('statusFilter')?.value || 'all';
    const categoryFilter = document.getElementById('categoryFilter')?.value || 'all';

    let tasks = Storage.getUserTasks(currentUser.id);

    if (statusFilter !== 'all') {
        tasks = tasks.filter(task => task.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
        tasks = tasks.filter(task => task.categoryId === categoryFilter);
    }

    const selectedDate = new Date();
    selectedDate.setDate(selectedDate.getDate() + currentDateOffset);

    const brazilSelectedDate = new Date(selectedDate.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    brazilSelectedDate.setHours(12, 0, 0, 0);

    const yesterday = new Date(brazilSelectedDate);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(12, 0, 0, 0);

    const tomorrow = new Date(brazilSelectedDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(12, 0, 0, 0);

    const tasksByDay = {
        yesterday: [],
        today: [],
        tomorrow: []
    };

    tasks.forEach(task => {
        if (!task.dueDate) {
            tasksByDay.today.push(task);
            return;
        }

        const dueDate = new Date(task.dueDate);
        const brazilDueDate = new Date(dueDate.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
        brazilDueDate.setHours(12, 0, 0, 0);

        if (isSameDay(brazilDueDate, yesterday)) {
            tasksByDay.yesterday.push(task);
        } else if (isSameDay(brazilDueDate, brazilSelectedDate)) {
            tasksByDay.today.push(task);
        } else if (isSameDay(brazilDueDate, tomorrow)) {
            tasksByDay.tomorrow.push(task);
        }
    });

    renderHorizontalView(tasksByDay, brazilSelectedDate, yesterday, tomorrow);
    renderVerticalView(tasks);

    setupTaskCheckboxes();
    setupTaskItemClickHandlers();
}

function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate();
}

function setupTaskItemClickHandlers() {
    document.querySelectorAll('.task-content').forEach(element => {
        element.addEventListener('click', function () {
            const taskId = this.dataset.taskId;
            if (taskId) {
                openEditTaskModal(taskId);
            }
        });
    });
}

function renderHorizontalView(tasksByDay, selectedDate, yesterday, tomorrow) {
    const horizontalContainer = document.getElementById('taskDays');
    if (!horizontalContainer) return;

    const formatDate = (date) => {
        date.setHours(12, 0, 0, 0);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const yesterdayHoliday = isHoliday(yesterday);
    const todayHoliday = isHoliday(selectedDate);
    const tomorrowHoliday = isHoliday(tomorrow);

    horizontalContainer.innerHTML = `
        <div class="col-md-4 mb-4">
            <div class="card h-100">
                <div class="card-header text-center ${yesterdayHoliday ? 'holiday-header' : ''}" 
                    style="background-color: #4335A7; color: #FFF6E9;">
                    ${yesterdayHoliday ?
            `<span class="holiday-badge" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="${yesterdayHoliday.name}">🎉 Feriado</span>` : ''}
                    Ontem - ${formatDate(yesterday)}
                </div>
                <div class="card-body" id="yesterdayTasks">
                    ${renderTasksForDay(tasksByDay.yesterday)}
                </div>
            </div>
        </div>
        <div class="col-md-4 mb-4">
            <div class="card h-100">
                <div class="card-header text-center ${todayHoliday ? 'holiday-header' : ''}" 
                    style="background-color: #4335A7; color: #FFF6E9;">
                    ${todayHoliday ?
            `<span class="holiday-badge" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="${todayHoliday.name}">🎉 Feriado</span>` : ''}
                    Hoje - ${formatDate(selectedDate)}
                </div>
                <div class="card-body" id="todayTasks">
                    ${renderTasksForDay(tasksByDay.today)}
                </div>
            </div>
        </div>
        <div class="col-md-4 mb-4">
            <div class="card h-100">
                <div class="card-header text-center ${tomorrowHoliday ? 'holiday-header' : ''}" 
                    style="background-color: #4335A7; color: #FFF6E9;">
                    ${tomorrowHoliday ?
            `<span class="holiday-badge" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="${tomorrowHoliday.name}">🎉 Feriado</span>` : ''}
                    Amanhã - ${formatDate(tomorrow)}
                </div>
                <div class="card-body" id="tomorrowTasks">
                    ${renderTasksForDay(tasksByDay.tomorrow)}
                </div>
            </div>
        </div>
    `;

    if (!document.getElementById('holiday-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'holiday-styles';
        styleElement.textContent = `
            .holiday-header {
                animation: holiday-glow 2s infinite alternate;
                position: relative;
            }
            @keyframes holiday-glow {
                from { box-shadow: 0 0 5px #ffcc00; }
                to { box-shadow: 0 0 15px #ffcc00; }
            }
            .holiday-badge {
                display: inline-block;
                padding: 2px 5px;
                background-color: #ffcc00;
                color: #4335A7;
                border-radius: 4px;
                margin-right: 5px;
                /* cursor: help; */ /* Removido para não exibir o cursor de interrogação */
                font-weight: bold;
            }
        `;
        document.head.appendChild(styleElement);
    }

    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

/**
 * RF-17 : Renderiza a visualização vertical
 */
function renderVerticalView(tasks) {
    const verticalContainer = document.getElementById('taskList');
    if (!verticalContainer) return;

    if (tasks.length === 0) {
        verticalContainer.innerHTML = `
            <div class="text-center p-4 text-muted">
                Não há tarefas para exibir com os filtros atuais.
            </div>
        `;
        return;
    }

    tasks.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
    });

    let html = '';

    tasks.forEach(task => {
        const category = getCategoryById(task.categoryId);
        const dueDate = task.dueDate
            ? formatDateForDisplay(task.dueDate)
            : 'Sem data';

        const holiday = task.dueDate ? isHoliday(new Date(task.dueDate)) : null;
        const holidayBadge = holiday ?
            `<span class="holiday-badge" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="${holiday.name}" style="font-size: 0.8em;">🎉 Feriado</span>` : '';

        html += `
            <div class="list-group-item list-group-item-action d-flex align-items-center ${task.status === 'completed' ? 'task-completed' : task.status === 'inactive' ? 'task-inactive' : ''}" data-task-id="${task.id}">
                <div class="form-check me-3">
                    <input class="form-check-input task-checkbox" type="checkbox" data-task-id="${task.id}" ${task.status === 'completed' ? 'checked' : ''}>
                </div>
                <div class="task-content flex-grow-1" data-task-id="${task.id}">
                    <h6 class="mb-0">${task.title}</h6>
                    <p class="mb-0 small text-muted">${task.description || 'Sem descrição'}</p>
                </div>
                <div class="ms-auto text-end">
                    ${dueDate} ${holidayBadge}
                    <span class="badge rounded-pill d-block mt-1" style="background-color: ${category?.color || '#ccc'};">
                        ${category?.name || 'Sem categoria'}
                    </span>
                </div>
            </div>
        `;
    });

    verticalContainer.innerHTML = html;

    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

function renderTasksForDay(tasks) {
    if (tasks.length === 0) {
        return `<p class="text-center text-muted">Não há tarefas para esse dia</p>`;
    }

    let html = '';

    tasks.forEach(task => {
        const category = getCategoryById(task.categoryId);
        const statusClass = task.status === 'completed'
            ? 'task-completed'
            : task.status === 'inactive' ? 'task-inactive' : '';

        html += `
            <div class="task-item mb-3 p-2 border rounded ${statusClass}" data-task-id="${task.id}" style="border-left: 4px solid ${category?.color || '#ccc'};">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="task-content flex-grow-1" data-task-id="${task.id}">
                        <h6 class="mb-0">${task.title}</h6>
                        <p class="mb-0 small text-muted">${task.description || 'Sem descrição'}</p>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input task-checkbox" type="checkbox" data-task-id="${task.id}" ${task.status === 'completed' ? 'checked' : ''}>
                    </div>
                </div>
            </div>
        `;
    });

    return html;
}

function setupTaskCheckboxes() {
    const checkboxes = document.querySelectorAll('.task-checkbox');

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function (e) {
            e.stopPropagation();

            const taskId = this.dataset.taskId;
            toggleTaskStatus(taskId, this.checked);
        });
    });
}

function openEditTaskModal(taskId) {
    const task = getTaskById(taskId);
    if (!task) return;

    document.getElementById('editTaskId').value = task.id;
    document.getElementById('editTaskTitle').value = task.title;
    document.getElementById('editTaskDescription').value = task.description || '';

    const categorySelect = document.getElementById('editTaskCategory');
    if (categorySelect) {
        Array.from(categorySelect.options).forEach(option => {
            if (option.value === task.categoryId) {
                option.selected = true;
            }
        });
    }

    if (task.dueDate) {
        document.getElementById('editTaskDueDate').value = dateToHtmlInputFormat(task.dueDate);
    } else {
        document.getElementById('editTaskDueDate').value = '';
    }

    const repeatCheckbox = document.getElementById('editTaskRepeat');
    const repeatOptions = document.getElementById('editRepeatOptions');

    if (repeatCheckbox && repeatOptions) {
        repeatCheckbox.checked = task.repeat || false;
        repeatOptions.classList.toggle('d-none', !task.repeat);

        if (task.repeat && task.repeatFrequency) {
            document.getElementById('editRepeatFrequency').value = task.repeatFrequency;
        }
    }

    const modal = new bootstrap.Modal(document.getElementById('editTaskModal'));
    modal.show();
}

function getTaskById(taskId) {
    const tasks = Storage.getTasks();
    return tasks.find(task => task.id === taskId) || null;
}

function getCategoryById(categoryId) {
    const categories = Storage.getCategories();
    return categories.find(category => category.id === categoryId) || null;
}

/**
 * RF-09: Cria uma notificação
 */
function createNotification(notification) {
    const currentUser = Storage.getCurrentUser();
    if (!currentUser) return;

    const notifications = Storage.getNotifications();

    const newNotification = {
        id: Storage.generateId(),
        userId: currentUser.id,
        type: notification.type || 'info', // info, success, warning, danger
        title: notification.title || 'Notificação',
        message: notification.message || '',
        relatedTo: notification.relatedTo || null,
        read: false,
        createdAt: standardizeDate()
    };

    notifications.push(newNotification);
    Storage.saveNotifications(notifications);

}


document.addEventListener('DOMContentLoaded', initTasksManager);

window.openEditTaskModal = openEditTaskModal;