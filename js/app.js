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
    const newListBtn = document.querySelector('.new-list-btn');
    const modal = document.getElementById('new-category-modal');
    const modalClose = document.querySelector('.modal-close');
    const modalCancel = document.querySelector('.modal-cancel');
    const modalCreate = document.querySelector('.modal-create');
    const newCategoryInput = document.getElementById('new-category-name');

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
    }

    // Configuration des écouteurs d'événements
    function setupEventListeners() {
        // Ajouter une tâche
        addTaskBtn.addEventListener('click', addTask);
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addTask();
        });

        // Modal
        newListBtn.addEventListener('click', openModal);
        modalClose.addEventListener('click', closeModal);
        modalCancel.addEventListener('click', closeModal);
        modalCreate.addEventListener('click', createNewCategory);
        newCategoryInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') createNewCategory();
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
            activeTaskList.innerHTML = '<div class="empty-state">No tasks yet. Add one above!</div>';
            return;
        }

        tasks[activeCategory].forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskItem.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}">
                <span class="task-text">${task.text}</span>
                <div class="task-actions">
                    <button class="task-action-btn btn-edit" data-id="${task.id}" aria-label="Edit task">Edit</button>
                    <button class="task-action-btn btn-delete" data-id="${task.id}" aria-label="Delete task">Delete</button>
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
        const newText = prompt('Edit task:', currentText);

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
        langButtons.forEach(button => {
            button.classList.remove('active');
            if (button.dataset.lang === lang) {
                button.classList.add('active');
            }
        });
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
            count.textContent = tasks[category] ? tasks[category].length : 0;
        });
    }

    // Sauvegarder les tâches dans localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Ouvrir la modal
    function openModal() {
        modal.classList.add('active');
        newCategoryInput.focus();
    }

    // Fermer la modal
    function closeModal() {
        modal.classList.remove('active');
        newCategoryInput.value = '';
    }

    // Créer une nouvelle catégorie
    function createNewCategory() {
        const categoryName = newCategoryInput.value.trim().toLowerCase();

        if (!categoryName) {
            alert('Please enter a category name');
            return;
        }

        // Vérifier si la catégorie existe déjà
        if (tasks[categoryName]) {
            alert('This category already exists');
            return;
        }

        // Créer la nouvelle catégorie
        tasks[categoryName] = [];

        // Ajouter le bouton dans la sidebar
        const categoriesUl = document.querySelector('.categories ul');
        const newLi = document.createElement('li');
        newLi.innerHTML = `<a href="#" data-category="${categoryName}">${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}</a>`;
        categoriesUl.appendChild(newLi);

        // Créer la section de tâches pour cette catégorie
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

        // Ajouter l'écouteur d'événement au nouveau bouton
        const newButton = newLi.querySelector('a');
        newButton.addEventListener('click', (e) => {
            e.preventDefault();
            changeCategory(categoryName);
        });

        // Sauvegarder et fermer
        saveTasks();
        updateTaskCounts();
        closeModal();

        // Optionnel : basculer vers la nouvelle catégorie
        changeCategory(categoryName);
    }
});
