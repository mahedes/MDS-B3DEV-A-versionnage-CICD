document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.querySelector('.task-input');
    const addTaskBtn = document.querySelector('.add-task-btn');
    const taskLists = document.querySelectorAll('.tasks-list');
    const categoryButtons = document.querySelectorAll('.categories a');
    const langButtons = document.querySelectorAll('.lang-btn');
    const taskCounts = document.querySelectorAll('.task-count');
    const statTotalTasks = document.getElementById('total-tasks');
    const statCompletedTasks = document.getElementById('completed-tasks');
    const newListBtn = document.querySelector('.new-list-btn');
    const modal = document.getElementById('new-category-modal');
    const modalClose = document.querySelector('.modal-close');
    const modalCancel = document.querySelector('.modal-cancel');
    const modalCreate = document.querySelector('.modal-create');
    const newCategoryInput = document.getElementById('new-category-name');

    const translations = {
        en: {
            edit: 'Edit',
            delete: 'Delete',
            editPrompt: 'Edit task:',
            emptyState: 'No tasks yet. Add one above!'
        },
        fr: {
            edit: 'Modifier',
            delete: 'Supprimer',
            editPrompt: 'Modifier la tâche :',
            emptyState: 'Aucune tâche pour le moment. Ajoutez-en une !'
        }
    };

    let currentLang = 'en';
    let tasks = JSON.parse(localStorage.getItem('tasks')) || {
        all: [],
        work: [],
        personal: [],
        shopping: []
    };
    let activeCategory = 'all';

    init();

    function init() {
        renderTasks();
        updateStats();
        updateTaskCounts();
        setupEventListeners();
        updateLanguage();
    }

    function setupEventListeners() {
        addTaskBtn.addEventListener('click', addTask);
        taskInput.addEventListener('keypress', e => {
            if (e.key === 'Enter') addTask();
        });

        // Modal
        newListBtn.addEventListener('click', openModal);
        modalClose.addEventListener('click', closeModal);
        modalCancel.addEventListener('click', closeModal);
        modalCreate.addEventListener('click', createNewCategory);
        newCategoryInput.addEventListener('keypress', e => {
            if (e.key === 'Enter') createNewCategory();
        });

        // Catégories
        categoryButtons.forEach(button => {
            button.addEventListener('click', e => {
                e.preventDefault();
                changeCategory(button.dataset.category);
            });
        });

        langButtons.forEach(button => {
            button.addEventListener('click', () => changeLanguage(button.dataset.lang));
        });

        if (statCompletedTasks) {
            statCompletedTasks.addEventListener('click', e => {
                e.preventDefault();
                changeCategory('completed');
            });
        }

        taskLists.forEach(list => {
            list.addEventListener('dragover', e => {
                e.preventDefault();
                list.classList.add('drag-over');
            });
            list.addEventListener('dragleave', () => list.classList.remove('drag-over'));
            list.addEventListener('drop', handleDrop);
        });
    }

    function addTask() {
        const taskText = taskInput.value.trim();
        if (!taskText) return;

        const newTask = { id: Date.now(), text: taskText, completed: false };
        const targetCategory = activeCategory === 'completed' ? 'all' : activeCategory;

        if (!Array.isArray(tasks[targetCategory])) tasks[targetCategory] = [];
        tasks[targetCategory].push(newTask);
        if (!tasks.all.some(t => t.id === newTask.id)) tasks.all.push(newTask);

        saveTasks();
        renderTasks();
        updateStats();
        updateTaskCounts();
        taskInput.value = '';
    }

    function renderTasks() {
        const activeTaskList = document.getElementById(`${activeCategory}-tasks-list`);
        if (!activeTaskList) return;
        activeTaskList.innerHTML = '';

        const tasksToRender =
            activeCategory === 'completed'
                ? tasks.all.filter(t => t.completed)
                : (Array.isArray(tasks[activeCategory]) ? tasks[activeCategory] : []);

        if (tasksToRender.length === 0) {
            activeTaskList.innerHTML = `<div class="empty-state">${translations[currentLang]?.emptyState}</div>`;
            return;
        }

        tasksToRender.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskItem.draggable = true;
            taskItem.dataset.id = task.id;

            taskItem.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}">
                <span class="task-text">${task.text}</span>
                <div class="task-actions">
                    <button class="task-action-btn btn-edit" data-id="${task.id}" aria-label="${translations[currentLang].edit}">${translations[currentLang].edit}</button>
                    <button class="task-action-btn btn-delete" data-id="${task.id}" aria-label="${translations[currentLang].delete}">${translations[currentLang].delete}</button>
                </div>
            `;

            taskItem.addEventListener('dragstart', ev => {
                ev.dataTransfer.setData('text/plain', JSON.stringify({ id: task.id, from: activeCategory }));
                ev.dataTransfer.effectAllowed = 'move';
            });

            activeTaskList.appendChild(taskItem);
        });

        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', toggleTaskCompletion);
        });
        document.querySelectorAll('.btn-delete').forEach(btn => btn.addEventListener('click', deleteTask));
        document.querySelectorAll('.btn-edit').forEach(btn => btn.addEventListener('click', editTask));
    }

    function toggleTaskCompletion(e) {
        const taskId = parseInt(e.target.dataset.id, 10);
        const checked = e.target.checked;

        const allTask = tasks.all.find(t => t.id === taskId);
        if (allTask) allTask.completed = checked;

        Object.keys(tasks).forEach(cat => {
            if (Array.isArray(tasks[cat])) {
                const t = tasks[cat].find(x => x.id === taskId);
                if (t) t.completed = checked;
            }
        });

        saveTasks();
        updateStats();
        renderTasks();
    }

    function handleDrop(e) {
        e.preventDefault();
        const list = e.currentTarget;
        list.classList.remove('drag-over');

        let data;
        try {
            data = JSON.parse(e.dataTransfer.getData('text/plain'));
        } catch {
            return;
        }

        const taskId = parseInt(data.id, 10);
        const fromCategory = data.from;
        const toCategory = list.id.replace('-tasks-list', '');

        if (!taskId || fromCategory === toCategory) return;
        const taskObj = tasks[fromCategory].find(t => t.id === taskId);
        if (!taskObj) return;

        tasks[fromCategory] = tasks[fromCategory].filter(t => t.id !== taskId);
        if (!Array.isArray(tasks[toCategory])) tasks[toCategory] = [];
        tasks[toCategory].push(taskObj);

        saveTasks();
        updateStats();
        updateTaskCounts();
        renderTasks();
    }

    function deleteTask(e) {
        const taskId = parseInt(e.target.dataset.id, 10);
        Object.keys(tasks).forEach(cat => {
            if (Array.isArray(tasks[cat])) tasks[cat] = tasks[cat].filter(t => t.id !== taskId);
        });
        saveTasks();
        renderTasks();
        updateStats();
        updateTaskCounts();
    }

    function editTask(e) {
        const taskId = parseInt(e.target.dataset.id);
        const taskItem = e.target.closest('.task-item');
        const currentText = taskItem.querySelector('.task-text').textContent;
        const newText = prompt(translations[currentLang].editPrompt, currentText);

        if (newText && newText.trim() !== '') {
            Object.keys(tasks).forEach(cat => {
                if (Array.isArray(tasks[cat])) {
                    const task = tasks[cat].find(t => t.id === taskId);
                    if (task) task.text = newText.trim();
                }
            });
            saveTasks();
            renderTasks();
        }
    }

    function changeCategory(category) {
        document.querySelectorAll('.task-category').forEach(el => el.classList.remove('active'));
        const target = document.getElementById(`category-${category}`);
        if (target) target.classList.add('active');
        activeCategory = category;

        categoryButtons.forEach(btn => {
            btn.closest('li').classList.remove('active');
            if (btn.dataset.category === category) btn.closest('li').classList.add('active');
        });

        renderTasks();
    }

    function changeLanguage(lang) {
        currentLang = lang;
        langButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
        updateLanguage();
        renderTasks();
    }

    function updateLanguage() {
        taskInput.placeholder = currentLang === 'fr' ? 'Nouvelle tâche...' : 'New task...';
        addTaskBtn.textContent = currentLang === 'fr' ? 'Ajouter' : 'Add';
    }

    function updateStats() {
        const total = tasks.all.length;
        const completed = tasks.all.filter(t => t.completed).length;
        if (statTotalTasks) statTotalTasks.textContent = total;
        if (statCompletedTasks) statCompletedTasks.textContent = completed;
    }

    function updateTaskCounts() {
        taskCounts.forEach(count => {
            const cat = count.id.replace('-tasks-count', '');
            count.textContent =
                cat === 'completed'
                    ? tasks.all.filter(t => t.completed).length
                    : (Array.isArray(tasks[cat]) ? tasks[cat].length : 0);
        });
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // --- MODAL ---
    function openModal() {
        modal.classList.add('active');
        newCategoryInput.focus();
    }

    function closeModal() {
        modal.classList.remove('active');
        newCategoryInput.value = '';
    }

    function createNewCategory() {
        const categoryName = newCategoryInput.value.trim().toLowerCase();
        if (!categoryName) {
            alert('Please enter a category name');
            return;
        }
        if (tasks[categoryName]) {
            alert('This category already exists');
            return;
        }

        tasks[categoryName] = [];

        const categoriesUl = document.querySelector('.categories ul');
        const newLi = document.createElement('li');
        newLi.innerHTML = `<a href="#" data-category="${categoryName}">${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}</a>`;
        categoriesUl.appendChild(newLi);

        const tasksArea = document.querySelector('.tasks-area');
        const newCategoryDiv = document.createElement('div');
        newCategoryDiv.className = 'task-category';
        newCategoryDiv.id = `category-${categoryName}`;
        newCategoryDiv.innerHTML = `
            <div class="category-header">
                <h2>${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}</h2>
                <span class="task-count" id="${categoryName}-tasks-count">0</span>
            </div>
            <div class="task-input-container">
                <input type="text" class="task-input" placeholder="Add a new task...">
                <button class="add-task-btn">Add</button>
            </div>
            <ul class="tasks-list" id="${categoryName}-tasks-list"></ul>
        `;
        tasksArea.appendChild(newCategoryDiv);

        const newButton = newLi.querySelector('a');
        newButton.addEventListener('click', e => {
            e.preventDefault();
            changeCategory(categoryName);
        });

        saveTasks();
        updateTaskCounts();
        closeModal();
        changeCategory(categoryName);
    }
});
