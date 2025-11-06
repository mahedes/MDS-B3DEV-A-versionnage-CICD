document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.querySelector('.task-input');
    const addTaskBtn = document.querySelector('.add-task-btn');
    const taskLists = document.querySelectorAll('.tasks-list');
    const categoryButtons = document.querySelectorAll('.categories a');
    const langButtons = document.querySelectorAll('.lang-btn');
    const taskCounts = document.querySelectorAll('.task-count');
    const statTotalTasks = document.getElementById('total-tasks');
    const statCompletedTasks = document.getElementById('completed-tasks');

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
    }

    function setupEventListeners() {
        addTaskBtn.addEventListener('click', addTask);
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addTask();
        });

        categoryButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                changeCategory(button.dataset.category);
            });
        });



        langButtons.forEach(button => {
            button.addEventListener('click', () => {
                changeLanguage(button.dataset.lang);
            });
        });

        if (statCompletedTasks) {
            statCompletedTasks.addEventListener('click', (e) => {
                e.preventDefault();
                changeCategory('completed');
            });
        }

        document.querySelectorAll('.tasks-list').forEach(list => {
            list.addEventListener('dragover', (e) => {
                e.preventDefault();
                list.classList.add('drag-over');
            });

            list.addEventListener('dragleave', () => {
                list.classList.remove('drag-over');
            });

            list.addEventListener('drop', handleDrop);
        });
    }

    function addTask() {
        const taskText = taskInput.value.trim();
        if (!taskText) return;

        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false
        };

        const targetCategory = activeCategory === 'completed' ? 'all' : activeCategory;

        if (targetCategory === 'all') {
            tasks.all.push(newTask);
        } else {
            if (!Array.isArray(tasks[targetCategory])) tasks[targetCategory] = [];
            tasks[targetCategory].push(newTask);
            tasks.all.push(newTask);
        }

        saveTasks();
        renderTasks();
        updateStats();
        updateTaskCounts();
        taskInput.value = '';
    }

    function renderTasks() {
        const activeTaskList = document.getElementById(`${activeCategory}-tasks-list`);
        activeTaskList.innerHTML = '';

        const tasksToRender = activeCategory === 'completed'
            ? tasks.all.filter(t => t.completed)
            : (Array.isArray(tasks[activeCategory]) ? tasks[activeCategory] : []);

        if (tasksToRender.length === 0) {
            activeTaskList.innerHTML = '<li class="empty-state">No tasks yet. Add one above!</li>';
            return;
        }

        tasksToRender.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskItem.draggable = true;
            taskItem.dataset.id = task.id;

            let sourceCategory = 'all';
            ['work', 'personal', 'shopping'].some(cat => {
                if (Array.isArray(tasks[cat]) && tasks[cat].some(t => t.id === task.id)) {
                    sourceCategory = cat;
                    return true;
                }
                return false;
            });

            taskItem.dataset.category = sourceCategory;
            taskItem.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}">
                <span class="task-text">${task.text}</span>
                <div class="task-actions">
                    <button class="task-action-btn btn-edit" data-id="${task.id}" aria-label="Edit task">Edit</button>
                    <button class="task-action-btn btn-delete" data-id="${task.id}" aria-label="Delete task">Delete</button>
                </div>
            `;

            taskItem.addEventListener('dragstart', (ev) => {
                ev.dataTransfer.setData('text/plain', JSON.stringify({ id: task.id, from: sourceCategory }));
                ev.dataTransfer.effectAllowed = 'move';
            });

            activeTaskList.appendChild(taskItem);
        });

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

    function toggleTaskCompletion(e) {
        const taskId = parseInt(e.target.dataset.id, 10);
        const checked = e.target.checked;

        const allTaskIndex = tasks.all.findIndex(task => task.id === taskId);
        if (allTaskIndex !== -1) tasks.all[allTaskIndex].completed = checked;

        Object.keys(tasks).forEach(cat => {
            if (cat === 'all') return;
            if (!Array.isArray(tasks[cat])) return;
            const idx = tasks[cat].findIndex(t => t.id === taskId);
            if (idx !== -1) tasks[cat][idx].completed = checked;
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
        } catch (err) {
            return;
        }

        const taskId = parseInt(data.id, 10);
        const fromCategory = String(data.from || 'all');
        const toCategory = list.id.replace('-tasks-list', '');

        if (!taskId || fromCategory === toCategory) return;

        let taskObj = tasks.all.find(t => t.id === taskId);
        if (!taskObj && tasks[fromCategory]) {
            taskObj = tasks[fromCategory].find(t => t.id === taskId);
            if (taskObj && !tasks.all.some(t => t.id === taskId)) tasks.all.push(taskObj);
        }

        if (!taskObj) return;

        if (fromCategory !== 'all' && Array.isArray(tasks[fromCategory])) {
            tasks[fromCategory] = tasks[fromCategory].filter(t => t.id !== taskId);
        }

        if (toCategory !== 'all' && Array.isArray(tasks[toCategory])) {
            if (!tasks[toCategory].some(t => t.id === taskId)) {
                tasks[toCategory].push(taskObj);
            }
        }

        if (toCategory === 'all' && !tasks.all.some(t => t.id === taskId)) {
            tasks.all.push(taskObj);
        }

        saveTasks();
        updateStats();
        updateTaskCounts();

        renderTasks();
    }

    function deleteTask(e) {
        const taskId = parseInt(e.target.dataset.id, 10);

        Object.keys(tasks).forEach(cat => {
            if (!Array.isArray(tasks[cat])) return;
            tasks[cat] = tasks[cat].filter(t => t.id !== taskId);
        });

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
            const allIdx = tasks.all.findIndex(t => t.id === taskId);
            if (allIdx !== -1) tasks.all[allIdx].text = newText.trim();

            Object.keys(tasks).forEach(cat => {
                if (cat === 'all') return;
                if (!Array.isArray(tasks[cat])) return;
                const idx = tasks[cat].findIndex(t => t.id === taskId);
                if (idx !== -1) tasks[cat][idx].text = newText.trim();
            });

            saveTasks();
            renderTasks();
        }
    }

    function changeCategory(category) {
        document.querySelectorAll('.task-category').forEach(cat => {
            cat.classList.remove('active');
        });

        const targetEl = document.getElementById(`category-${category}`);
        if (targetEl) targetEl.classList.add('active');
        activeCategory = category;

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

    function updateStats() {
        const totalTasks = tasks.all.length;
        const completedTasks = tasks.all.filter(task => task.completed).length;

        statTotalTasks.textContent = totalTasks;
        statCompletedTasks.textContent = completedTasks;
    }

    function updateTaskCounts() {
        taskCounts.forEach(count => {
            const category = count.id.replace('-tasks-count', '');
            if (category === 'completed') {
                count.textContent = tasks.all.filter(t => t.completed).length;
            } else {
                count.textContent = Array.isArray(tasks[category]) ? tasks[category].length : 0;
            }
        });
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
});
