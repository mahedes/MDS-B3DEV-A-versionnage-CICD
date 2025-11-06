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

    // Textes de traduction
    const translations = {
        en: {
            title: "TodoList Pro",
            inputPlaceholder: "Add a new task...",
            addButton: "Add",
            all: "All Tasks",
            work: "Work",
            personal: "Personal",
            shopping: "Shopping",
            totalTasks: "Total Tasks",
            completedTasks: "Completed Tasks",
            emptyState: "No tasks yet. Add one above!",
            edit: "Edit",
            delete: "Delete",
            editPrompt: "Edit task:",
            categories: "Categories",
            stats: "Stats",
            newList: "+ New List",
            copyright: "© 2025 TodoList Pro. All rights reserved.",
            about: "About",
            help: "Help",
            slogan: "Organize your tasks efficiently"
        },
        fr: {
            title: "Liste de Tâches Pro",
            inputPlaceholder: "Ajouter une nouvelle tâche...",
            addButton: "Ajouter",
            all: "Toutes les Tâches",
            work: "Travail",
            personal: "Personnel",
            shopping: "Courses",
            totalTasks: "Tâches Totales",
            completedTasks: "Tâches Terminées",
            emptyState: "Aucune tâche pour le moment. Ajoutez-en une !",
            edit: "Modifier",
            delete: "Supprimer",
            editPrompt: "Modifier la tâche :",
            categories: "Catégories",
            stats: "Statistiques",
            newList: "+ Nouvelle Liste",
            copyright: "© 2025 Liste de Tâches Pro. Tous droits réservés.",
            about: "À propos",
            help: "Aide",
            slogan: "Organisez vos tâches efficacement"
        }
    };

    // Langue par défaut
    let currentLang = 'en';

    // État initial de l'application
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
        updateLanguage(); // Appliquer la langue au chargement
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

        if (tasks[activeCategory].length === 0) {
            activeTaskList.innerHTML = `<div class="empty-state">${translations[currentLang].emptyState}</div>`;
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
        const taskTextElement = taskItem.querySelector('.task-text');
        const currentText = taskTextElement.textContent;

        const newText = prompt(translations[currentLang].editPrompt, currentText);
        if (newText !== null && newText.trim() !== '') {
            taskTextElement.textContent = newText.trim();

            // Mettre à jour dans les tâches
            const taskIndex = tasks[activeCategory].findIndex(task => task.id === taskId);
            tasks[activeCategory][taskIndex].text = newText.trim();

            const allTaskIndex = tasks.all.findIndex(task => task.id === taskId);
            tasks.all[allTaskIndex].text = newText.trim();

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
        
        // Mettre à jour les boutons de langue
        langButtons.forEach(button => {
            button.classList.remove('active');
            if (button.dataset.lang === lang) {
                button.classList.add('active');
            }
        });
        updateLanguage();
        renderTasks();
    }

        // Mettre à jour tous les textes de l'interface
        updateLanguage();
        
        // Re-rendre les tâches pour mettre à jour les boutons Edit/Delete
        renderTasks();
    }

    // Mettre à jour tous les textes de l'interface
    function updateLanguage() {
        const t = translations[currentLang];
        
        // Mettre à jour le titre
        document.querySelector('h1').textContent = t.title;
        
        // Mettre à jour le slogan
        document.querySelector('.app-header p').textContent = t.slogan;
        
        // Mettre à jour le placeholder de l'input
        taskInput.placeholder = t.inputPlaceholder;
        
        // Mettre à jour le bouton d'ajout
        addTaskBtn.textContent = t.addButton;
        
        // Mettre à jour le bouton New List
        document.querySelector('.new-list-btn').textContent = t.newList;
        
        // Mettre à jour les titres des sections
        document.querySelector('.categories h3').textContent = t.categories;
        document.querySelector('.stats h3').textContent = t.stats;
        
        // Mettre à jour les catégories
        document.querySelector('[data-category="all"]').textContent = t.all;
        document.querySelector('[data-category="work"]').textContent = t.work;
        document.querySelector('[data-category="personal"]').textContent = t.personal;
        document.querySelector('[data-category="shopping"]').textContent = t.shopping;
        
        // Mettre à jour les titres des catégories dans la zone des tâches
        document.querySelector('#category-all h2').textContent = t.all;
        document.querySelector('#category-work h2').textContent = t.work;
        document.querySelector('#category-personal h2').textContent = t.personal;
        document.querySelector('#category-shopping h2').textContent = t.shopping;
        
        // Mettre à jour les statistiques - CORRECTION ICI
        const statItems = document.querySelectorAll('.stat-item');
        statItems[0].querySelector('.stat-label').textContent = t.totalTasks;
        statItems[1].querySelector('.stat-label').textContent = t.completedTasks;
        
        // Mettre à jour le footer
        document.querySelector('.app-footer p').textContent = t.copyright;
        document.querySelectorAll('.btn-secondary')[0].textContent = t.about;
        document.querySelectorAll('.btn-secondary')[1].textContent = t.help;
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
});
