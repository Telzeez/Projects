document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const elements = {
        taskContainer: document.getElementById('task-container'),
        addItemBtn: document.getElementById('add-item-btn'),
        taskForm: document.getElementById('task-form'),
        taskFormTitle: document.getElementById('form-title'),
        cancelBtn: document.getElementById('cancel-task'),
        saveBtn: document.getElementById('save-task'),
        currentDateEl: document.getElementById('current-date'),
        taskCounterEl: document.getElementById('task-counter'),
        categoriesContainer: document.getElementById('categories-container'),
        categorySelect: document.getElementById('task-category'),
        form: document.getElementById('task-form-content'),
        categoryDialog: document.getElementById('category-dialog'),
        categoryForm: document.getElementById('category-form'),
        categoryNameInput: document.getElementById('category-name'),
        saveCategoryBtn: document.getElementById('save-category'),
        deleteCategoryBtn: document.getElementById('delete-category'),
        cancelCategoryBtn: document.getElementById('cancel-category'),
        addCategoryBtn: document.getElementById('add-category-btn'),
        sidebar: document.querySelector('.sidebar'),
        menuToggle: document.createElement('button') // For mobile menu
    };

    // Create mobile menu button
    elements.menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    elements.menuToggle.className = 'mobile-menu-toggle';
    elements.menuToggle.setAttribute('aria-label', 'Toggle menu');
    document.querySelector('.main-content').prepend(elements.menuToggle);

    // State
    const state = {
        tasks: [],
        categories: ['Work', 'Home', 'Personal'],
        currentCategory: null,
        editingTaskId: null,
        isMobile: window.innerWidth <= 768,
        sidebarVisible: window.innerWidth > 768
    };

    // Initialize
    function init() {
        updateCurrentDate();
        renderCategories();
        renderTasks();
        setupEventListeners();
        handleResponsiveLayout();
        window.addEventListener('resize', handleResponsiveLayout);
    }

    // Responsive Layout
    function handleResponsiveLayout() {
        state.isMobile = window.innerWidth <= 768;
        state.sidebarVisible = !state.isMobile;
        
        if (state.isMobile) {
            elements.sidebar.style.transform = state.sidebarVisible ? 'translateX(0)' : 'translateX(-100%)';
            elements.sidebar.style.position = 'fixed';
            elements.sidebar.style.zIndex = '100';
            elements.sidebar.style.height = '100vh';
            elements.sidebar.style.overflowY = 'auto';
        } else {
            elements.sidebar.style.transform = '';
            elements.sidebar.style.position = '';
            elements.sidebar.style.zIndex = '';
            elements.sidebar.style.height = '';
            elements.sidebar.style.overflowY = '';
        }
    }

    function toggleSidebar() {
        state.sidebarVisible = !state.sidebarVisible;
        elements.sidebar.style.transform = state.sidebarVisible ? 'translateX(0)' : 'translateX(-100%)';
    }

    // Date Functions
    function updateCurrentDate() {
        const now = new Date();
        const options = { day: 'numeric', month: 'long' };
        elements.currentDateEl.textContent = `Today: ${now.toLocaleDateString('en-US', options)}`;
    }

    // Task Functions
    function addTask(task) {
        if (state.editingTaskId !== null) {
            state.tasks = state.tasks.filter(t => t.id !== state.editingTaskId);
            state.editingTaskId = null;
        }
        state.tasks.unshift(task);
        renderTasks();
    }

    function renderTasks() {
        const today = new Date().toISOString().split('T')[0];
        const todayTasks = state.tasks.filter(t => t.date === today).length;
        
        elements.taskCounterEl.textContent = `${todayTasks} of ${state.tasks.length} items`;
        
        if (state.tasks.length === 0) {
            elements.taskContainer.innerHTML = '<p class="no-tasks">No tasks added yet. Click "Add a new item" to get started.</p>';
            return;
        }
        
        elements.taskContainer.innerHTML = '';
        
        state.tasks.forEach(task => {
            const taskElement = document.createElement('article');
            taskElement.className = 'task';
            taskElement.dataset.id = task.id;
            taskElement.setAttribute('aria-label', `Task: ${task.title}`);
            
            taskElement.innerHTML = `
                <div class="task-info">
                    <h3 class="task-title ${task.important ? 'important' : ''}">${task.title}</h3>
                    <div class="task-meta">
                        <span>${task.time}</span>
                        ${task.category ? `<span class="task-category">${task.category}</span>` : ''}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="menu-toggle" aria-label="Task actions">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <div class="task-menu">
                        <button class="edit-task">
                            <i class="fas fa-edit"></i> <span class="menu-text">Edit</span>
                        </button>
                        <button class="delete-task delete">
                            <i class="fas fa-trash"></i> <span class="menu-text">Delete</span>
                        </button>
                    </div>
                </div>
            `;
            
            elements.taskContainer.appendChild(taskElement);
        });
    }

    function editTask(taskId) {
        const task = state.tasks.find(t => t.id === taskId);
        if (task) showTaskForm(task);
        if (state.isMobile) toggleSidebar();
    }

    function deleteTask(taskId) {
        showConfirmationDialog(
            'Are you sure you want to delete this task?',
            () => {
                state.tasks = state.tasks.filter(t => t.id !== taskId);
                renderTasks();
            }
        );
    }

    function showTaskForm(task = null) {
        const now = new Date();
        elements.form.reset();
        
        if (task) {
            state.editingTaskId = task.id;
            elements.taskFormTitle.textContent = 'Edit Task';
            document.getElementById('task-description').value = task.title;
            document.getElementById('task-category').value = task.category;
            document.getElementById('task-date').value = task.date;
            
            if (task.time && task.time !== "any time") {
                const startTime = task.time.includes('-') ? task.time.split('-')[0].trim() : task.time;
                document.getElementById('task-time').value = startTime;
            }
            
            document.getElementById('task-important').checked = task.important;
        } else {
            state.editingTaskId = null;
            elements.taskFormTitle.textContent = 'New Task';
            document.getElementById('task-date').value = now.toISOString().split('T')[0];
            document.getElementById('task-time').value = now.toTimeString().substring(0, 5);
        }
        
        elements.taskForm.showModal();
        document.getElementById('task-description').focus();
    }

    function hideTaskForm() {
        elements.taskForm.close();
    }

    function handleTaskFormSubmit(e) {
        e.preventDefault();
        
        const description = document.getElementById('task-description').value.trim();
        const category = document.getElementById('task-category').value;
        const date = document.getElementById('task-date').value;
        let time = document.getElementById('task-time').value;
        const important = document.getElementById('task-important').checked;
        
        if (!description) {
            alert('Please enter a task description');
            return;
        }
        
        time = time ? time : "any time";
        
        const newTask = {
            id: state.editingTaskId || Date.now(),
            title: description,
            time: time,
            date: date,
            category: category || 'Uncategorized',
            important: important
        };
        
        addTask(newTask);
        
        if (category && !state.categories.includes(category)) {
            addCategory(category);
        }
        
        hideTaskForm();
    }

    // Category Functions
    function addCategory(category) {
        const trimmedCategory = category.trim();
        if (trimmedCategory && !state.categories.includes(trimmedCategory)) {
            state.categories.push(trimmedCategory);
            renderCategories();
            return true;
        }
        return false;
    }

    function updateCategory(oldName, newName) {
        const trimmedNew = newName.trim();
        if (!trimmedNew || oldName === trimmedNew) return false;
        
        const index = state.categories.indexOf(oldName);
        if (index !== -1) {
            state.tasks.forEach(task => {
                if (task.category === oldName) task.category = trimmedNew;
            });
            state.categories[index] = trimmedNew;
            renderCategories();
            renderTasks();
            return true;
        }
        return false;
    }

    function deleteCategory(category) {
        return new Promise((resolve) => {
            const isUsed = state.tasks.some(task => task.category === category);
            
            if (isUsed) {
                showConfirmationDialog(
                    `This category has ${state.tasks.filter(t => t.category === category).length} tasks. Delete anyway?`,
                    () => {
                        state.categories = state.categories.filter(c => c !== category);
                        renderCategories();
                        resolve(true);
                    },
                    () => resolve(false)
                );
            } else {
                state.categories = state.categories.filter(c => c !== category);
                renderCategories();
                resolve(true);
            }
        });
    }

    function renderCategories() {
        elements.categoriesContainer.innerHTML = '';
        document.querySelector('.sidebar-count').textContent = `${state.categories.length} categories`;
        
        state.categories.forEach(category => {
            const categoryEl = document.createElement('section');
            categoryEl.className = 'category-item';
            categoryEl.innerHTML = `
                <span>${category}</span>
                <div class="category-actions">
                    <button class="edit-category" data-category="${category}" aria-label="Edit ${category}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-category" data-category="${category}" aria-label="Delete ${category}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            elements.categoriesContainer.appendChild(categoryEl);
        });
        
        elements.categorySelect.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select a category';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        elements.categorySelect.appendChild(defaultOption);
        
        state.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            elements.categorySelect.appendChild(option);
        });
    }

    function showCategoryDialog(category = null) {
        state.currentCategory = category;
        elements.categoryForm.reset();
        
        if (category) {
            elements.categoryNameInput.value = category;
            elements.deleteCategoryBtn.style.display = 'block';
            document.getElementById('category-dialog-title').textContent = 'Edit Category';
        } else {
            elements.deleteCategoryBtn.style.display = 'none';
            document.getElementById('category-dialog-title').textContent = 'Add New Category';
        }
        
        elements.categoryDialog.showModal();
        elements.categoryNameInput.focus();
    }

    function hideCategoryDialog() {
        elements.categoryDialog.close();
    }

    function showConfirmationDialog(message, onConfirm, onCancel) {
        const dialog = document.createElement('dialog');
        dialog.className = 'confirmation-dialog';
        dialog.innerHTML = `
            <p>${message}</p>
            <div class="confirmation-buttons">
                <button id="confirm-yes">Yes</button>
                <button id="confirm-no">No</button>
            </div>
        `;
        
        document.body.appendChild(dialog);
        dialog.showModal();
        
        dialog.querySelector('#confirm-yes').addEventListener('click', () => {
            dialog.close();
            onConfirm();
        });
        
        dialog.querySelector('#confirm-no').addEventListener('click', () => {
            dialog.close();
            if (onCancel) onCancel();
        });
        
        dialog.addEventListener('close', () => {
            document.body.removeChild(dialog);
        });
    }

    // Event Listeners
    function setupEventListeners() {
        // Mobile menu toggle
        elements.menuToggle.addEventListener('click', toggleSidebar);
        
        // Task form
        elements.addItemBtn.addEventListener('click', () => {
            showTaskForm();
            if (state.isMobile) toggleSidebar();
        });
        elements.cancelBtn.addEventListener('click', hideTaskForm);
        elements.form.addEventListener('submit', handleTaskFormSubmit);
        
        // Category management
        elements.addCategoryBtn.addEventListener('click', () => showCategoryDialog());
        elements.categoryForm.addEventListener('submit', handleCategoryFormSubmit);
        elements.deleteCategoryBtn.addEventListener('click', handleDeleteCategory);
        elements.cancelCategoryBtn.addEventListener('click', hideCategoryDialog);
        elements.categoriesContainer.addEventListener('click', handleCategoryClick);
        
        // Task menu interactions
        elements.taskContainer.addEventListener('click', (e) => {
            const taskElement = e.target.closest('.task');
            if (!taskElement) return;
            
            const taskId = parseInt(taskElement.dataset.id);
            const menu = taskElement.querySelector('.task-menu');
            
            if (e.target.closest('.menu-toggle')) {
                document.querySelectorAll('.task-menu').forEach(m => {
                    if (m !== menu) m.classList.remove('show');
                });
                menu.classList.toggle('show');
            }
            
            if (e.target.closest('.edit-task')) {
                editTask(taskId);
                menu.classList.remove('show');
            }
            
            if (e.target.closest('.delete-task')) {
                deleteTask(taskId);
                menu.classList.remove('show');
            }
        });
        
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.task-actions')) {
                document.querySelectorAll('.task-menu').forEach(menu => {
                    menu.classList.remove('show');
                });
            }
        });
    }

    // Form Handlers
    async function handleCategoryFormSubmit(e) {
        e.preventDefault();
        const newName = elements.categoryNameInput.value.trim();
        
        if (state.currentCategory) {
            if (await updateCategory(state.currentCategory, newName)) {
                hideCategoryDialog();
            }
        } else {
            if (addCategory(newName)) {
                hideCategoryDialog();
            }
        }
    }

    async function handleDeleteCategory() {
        if (state.currentCategory && await deleteCategory(state.currentCategory)) {
            hideCategoryDialog();
        }
    }

    function handleCategoryClick(e) {
        if (e.target.closest('.edit-category')) {
            const category = e.target.closest('button').dataset.category;
            showCategoryDialog(category);
        } else if (e.target.closest('.delete-category')) {
            const category = e.target.closest('button').dataset.category;
            showConfirmationDialog(
                `Are you sure you want to delete "${category}"?`,
                () => deleteCategory(category)
            );
        }
    }

    // Initialize the app
    init();
});

