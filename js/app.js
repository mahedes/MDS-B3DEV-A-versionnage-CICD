// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', () => {
    // Sélection des éléments du DOM
    const taskInput = document.querySelector('.task-input');
    const addTaskBtn = document.querySelector('.add-task-btn');
    const taskLists = document.querySelectorAll('.tasks-list');
    const categoryButtons = document.querySelectorAll('.categories a');
    const langButtons = document.querySelectorAll('.lang-btn');
    const taskCounts = document.querySelectorAll('.task-count');
    const statTotalTasks = document.getElementById('total-tasks');
    const statCompletedTasks = document.getElementById('completed-tasks');

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

    // Catégorie active par défaut
    let activeCategory = 'all';

    // Initialisation
    init();

    // Fonction d'initialisation
    function init() {
        renderTasks();
        updateStats();
        updateTaskCounts();
        setupEventListeners();
        updateLanguage(); // Appliquer la langue au chargement
    }

    // Configuration des écouteurs d'événements
    function setupEventListeners() {
        // Ajouter une tâche
        addTaskBtn.addEventListener('click', addTask);
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addTask();
        });

        // Changer de catégorie
        categoryButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                changeCategory(button.dataset.category);
            });
        });

        // Changer de langue
        langButtons.forEach(button => {
            button.addEventListener('click', () => {
                changeLanguage(button.dataset.lang);
            });
        });
    }

    // Ajouter une tâche
    function addTask() {
        const taskText = taskInput.value.trim();
        if (!taskText) return;

        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false
        };

        if (activeCategory === 'all') {
            tasks.all.push(newTask);
        } else {
            tasks[activeCategory].push(newTask);
            tasks.all.push(newTask);
        }

        saveTasks();
        renderTasks();
        updateStats();
        updateTaskCounts();
        taskInput.value = '';
    }

    // Rendre les tâches
    function renderTasks() {
        const activeTaskList = document.getElementById(`${activeCategory}-tasks-list`);
        activeTaskList.innerHTML = '';

        if (tasks[activeCategory].length === 0) {
            activeTaskList.innerHTML = `<div class="empty-state">${translations[currentLang].emptyState}</div>`;
            return;
        }

        tasks[activeCategory].forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskItem.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}">
                <span class="task-text">${task.text}</span>
                <div class="task-actions">
                    <button class="task-action-btn btn-edit" data-id="${task.id}" aria-label="${translations[currentLang].edit}">${translations[currentLang].edit}</button>
                    <button class="task-action-btn btn-delete" data-id="${task.id}" aria-label="${translations[currentLang].delete}">${translations[currentLang].delete}</button>
                </div>
            `;
            activeTaskList.appendChild(taskItem);
        });

        // Ajouter les écouteurs pour les boutons des tâches
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', toggleTaskCompletion);
        });

        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', deleteTask);
        });

        document.querySelectorAll('.btn-edit').forEach(button => {
            button.addEventListener('click', editTask);
        });
    }

    // Basculer l'état de complétion d'une tâche
    function toggleTaskCompletion(e) {
        const taskId = parseInt(e.target.dataset.id);
        const taskIndex = tasks[activeCategory].findIndex(task => task.id === taskId);
        tasks[activeCategory][taskIndex].completed = e.target.checked;

        // Mettre à jour dans "all"
        const allTaskIndex = tasks.all.findIndex(task => task.id === taskId);
        tasks.all[allTaskIndex].completed = e.target.checked;

        saveTasks();
        updateStats();
    }

    // Supprimer une tâche
    function deleteTask(e) {
        const taskId = parseInt(e.target.dataset.id);

        tasks[activeCategory] = tasks[activeCategory].filter(task => task.id !== taskId);
        tasks.all = tasks.all.filter(task => task.id !== taskId);

        saveTasks();
        renderTasks();
        updateStats();
        updateTaskCounts();
    }

    // Modifier une tâche
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
        }
    }

    // Changer de catégorie
    function changeCategory(category) {
        // Masquer toutes les catégories
        document.querySelectorAll('.task-category').forEach(cat => {
            cat.classList.remove('active');
        });

        // Afficher la catégorie sélectionnée
        document.getElementById(`category-${category}`).classList.add('active');
        activeCategory = category;

        // Mettre à jour les boutons de catégorie
        categoryButtons.forEach(button => {
            button.closest('li').classList.remove('active');
            if (button.dataset.category === category) {
                button.closest('li').classList.add('active');
            }
        });

        renderTasks();
    }

    // Changer de langue
    function changeLanguage(lang) {
        currentLang = lang;
        
        // Mettre à jour les boutons de langue
        langButtons.forEach(button => {
            button.classList.remove('active');
            if (button.dataset.lang === lang) {
                button.classList.add('active');
            }
        });

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

    // Mettre à jour les statistiques
    function updateStats() {
        const totalTasks = tasks.all.length;
        const completedTasks = tasks.all.filter(task => task.completed).length;

        statTotalTasks.textContent = totalTasks;
        statCompletedTasks.textContent = completedTasks;
    }

    // Mettre à jour le compteur de tâches par catégorie
    function updateTaskCounts() {
        taskCounts.forEach(count => {
            const category = count.id.replace('-tasks-count', '');
            count.textContent = tasks[category].length;
        });
    }

    // Sauvegarder les tâches dans localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
});