// TodoList Pro - Enhanced by Thibault - Group A
class TodoListPro {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('todoListTasks')) || {};
        this.currentCategory = 'today';
        this.currentLanguage = localStorage.getItem('todoListLanguage') || 'en';
        this.translations = {
            en: {
                appTitle: "TodoList Pro",
                appSubtitle: "Organize your tasks efficiently",
                newList: "➕ New List",
                categories: "Categories",
                today: "📅 Today",
                tomorrow: "⏰ Tomorrow", 
                later: "📌 Later",
                work: "💼 Work",
                personal: "🏠 Personal",
                statistics: "Statistics",
                totalTasks: "Total Tasks:",
                completed: "Completed:",
                pending: "Pending:",
                todaysTasks: "Today's Tasks",
                tomorrowTasks: "Tomorrow",
                laterTasks: "Later", 
                done: "✅ Done",
                tasks: "tasks",
                task: "task",
                addTaskPlaceholder: "Type and hit Enter to add a new task...",
                addTaskPlaceholderTomorrow: "Type and hit Enter to add a task for tomorrow...",
                addTaskPlaceholderLater: "Type and hit Enter to add a task for later...",
                addButton: "Add",
                noItems: "No items. Why not add one below?",
                noTomorrowTasks: "No tasks scheduled for tomorrow.",
                noLaterTasks: "No tasks scheduled for later.",
                noDoneItems: "No done items yet. Complete some tasks!",
                clearCompleted: "Clear Completed",
                exportTasks: "Export Tasks",
                enhancedBy: "Enhanced by Thibault - Group A",
                taskAdded: "Task added successfully!",
                taskDeleted: "Task deleted!",
                taskUpdated: "Task updated!",
                newListCreated: "New list created!",
                completedCleared: "Completed tasks cleared!",
                noCompletedTasks: "No completed tasks to clear!",
                tasksExported: "Tasks exported successfully!",
                confirmClear: "Are you sure you want to clear all completed tasks?",
                enterListName: "Enter name for new list:",
                editTask: "Edit task:"
            },
            fr: {
                appTitle: "TodoList Pro",
                appSubtitle: "Organisez vos tâches efficacement",
                newList: "➕ Nouvelle Liste",
                categories: "Catégories",
                today: "📅 Aujourd'hui",
                tomorrow: "⏰ Demain",
                later: "📌 Plus Tard", 
                work: "💼 Travail",
                personal: "🏠 Personnel",
                statistics: "Statistiques",
                totalTasks: "Tâches Total:",
                completed: "Terminées:",
                pending: "En Attente:",
                todaysTasks: "Tâches d'Aujourd'hui",
                tomorrowTasks: "Demain",
                laterTasks: "Plus Tard",
                done: "✅ Terminé",
                tasks: "tâches",
                task: "tâche",
                addTaskPlaceholder: "Tapez et appuyez sur Entrée pour ajouter une tâche...",
                addTaskPlaceholderTomorrow: "Tapez et appuyez sur Entrée pour ajouter une tâche pour demain...",
                addTaskPlaceholderLater: "Tapez et appuyez sur Entrée pour ajouter une tâche pour plus tard...",
                addButton: "Ajouter",
                noItems: "Aucun élément. Pourquoi ne pas en ajouter un ci-dessous ?",
                noTomorrowTasks: "Aucune tâche prévue pour demain.",
                noLaterTasks: "Aucune tâche prévue pour plus tard.",
                noDoneItems: "Aucune tâche terminée. Complétez quelques tâches !",
                clearCompleted: "Effacer Terminées",
                exportTasks: "Exporter Tâches",
                enhancedBy: "Amélioré par Thibault - Groupe A",
                taskAdded: "Tâche ajoutée avec succès !",
                taskDeleted: "Tâche supprimée !",
                taskUpdated: "Tâche mise à jour !",
                newListCreated: "Nouvelle liste créée !",
                completedCleared: "Tâches terminées effacées !",
                noCompletedTasks: "Aucune tâche terminée à effacer !",
                tasksExported: "Tâches exportées avec succès !",
                confirmClear: "Êtes-vous sûr de vouloir effacer toutes les tâches terminées ?",
                enterListName: "Entrez le nom de la nouvelle liste :",
                editTask: "Modifier la tâche :"
            }
        };
        this.init();
    }

    init() {
        this.bindEvents();
        this.applyLanguage();
        this.render();
        console.log('🚀 TodoList Pro initialized - Enhanced by Thibault');
    }

    bindEvents() {
        // Language switcher
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchLanguage(e.target.dataset.lang);
            });
        });

        // Category navigation
        document.querySelectorAll('.categories a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchCategory(e.target.getAttribute('href').substring(1));
            });
        });

        // Add task buttons
        document.querySelectorAll('.add-task-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const input = e.target.previousElementSibling;
                this.addTask(input.value, this.currentCategory);
                input.value = '';
            });
        });

        // Enter key to add task
        document.querySelectorAll('.task-input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addTask(e.target.value, this.currentCategory);
                    e.target.value = '';
                }
            });
        });

        // New list button
        document.querySelector('.new-list-btn').addEventListener('click', () => {
            this.createNewList();
        });

        // Clear completed
        document.querySelector('#clear-completed').addEventListener('click', () => {
            this.clearCompleted();
        });

        // Export tasks
        document.querySelector('#export-tasks').addEventListener('click', () => {
            this.exportTasks();
        });
    }

    switchLanguage(lang) {
        this.currentLanguage = lang;
        localStorage.setItem('todoListLanguage', lang);
        
        // Update active button
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`.lang-btn[data-lang="${lang}"]`).classList.add('active');
        
        this.applyLanguage();
        this.render();
    }

    applyLanguage() {
        const t = this.translations[this.currentLanguage];
        
        // Update all text content
        document.querySelector('.app-header h1').textContent = t.appTitle;
        document.querySelector('.app-header p').textContent = t.appSubtitle;
        document.querySelector('.new-list-btn').innerHTML = t.newList;
        document.querySelector('.categories h3').textContent = t.categories;
        document.querySelector('.stats h3').textContent = t.statistics;
        document.querySelector('.stat-item:nth-child(1) .stat-label').textContent = t.totalTasks;
        document.querySelector('.stat-item:nth-child(2) .stat-label').textContent = t.completed;
        document.querySelector('.stat-item:nth-child(3) .stat-label').textContent = t.pending;
        document.querySelector('#clear-completed').textContent = t.clearCompleted;
        document.querySelector('#export-tasks').textContent = t.exportTasks;
        document.querySelector('.app-footer p').textContent = t.enhancedBy;

        // Update category links
        const categoryLinks = {
            'today': t.today,
            'tomorrow': t.tomorrow,
            'later': t.later,
            'work': t.work,
            'personal': t.personal
        };
        
        for (const [category, text] of Object.entries(categoryLinks)) {
            const link = document.querySelector(`.categories a[href="#${category}"]`);
            if (link) {
                link.innerHTML = text;
            }
        }

        // Update category headers
        document.querySelector('#today .category-header h2').textContent = t.todaysTasks;
        document.querySelector('#tomorrow .category-header h2').textContent = t.tomorrowTasks;
        document.querySelector('#later .category-header h2').textContent = t.laterTasks;
        document.querySelector('#done .category-header h2').textContent = t.done;

        // Update placeholders and buttons
        document.querySelector('#today .task-input').placeholder = t.addTaskPlaceholder;
        document.querySelector('#tomorrow .task-input').placeholder = t.addTaskPlaceholderTomorrow;
        document.querySelector('#later .task-input').placeholder = t.addTaskPlaceholderLater;
        document.querySelectorAll('.add-task-btn').forEach(btn => {
            btn.textContent = t.addButton;
        });

        // Update empty states
        document.querySelector('#today .empty-state p').textContent = t.noItems;
        document.querySelector('#tomorrow .empty-state p').textContent = t.noTomorrowTasks;
        document.querySelector('#later .empty-state p').textContent = t.noLaterTasks;
        document.querySelector('#done .empty-state p').textContent = t.noDoneItems;
    }

    switchCategory(category) {
        this.currentCategory = category;
        
        // Update active states
        document.querySelectorAll('.categories li').forEach(li => {
            li.classList.remove('active');
        });
        document.querySelectorAll('.task-category').forEach(cat => {
            cat.classList.remove('active');
        });
        
        document.querySelector(`.categories a[href="#${category}"]`).parentElement.classList.add('active');
        document.querySelector(`#${category}`).classList.add('active');
        
        this.render();
    }

    addTask(text, category) {
        if (!text.trim()) return;

        if (!this.tasks[category]) {
            this.tasks[category] = [];
        }

        const task = {
            id: Date.now(),
            text: text.trim(),
            completed: false,
            createdAt: new Date().toISOString(),
            category: category
        };

        this.tasks[category].push(task);
        this.saveTasks();
        this.render();
        
        this.showNotification(this.translations[this.currentLanguage].taskAdded);
    }

    toggleTask(taskId, category) {
        const task = this.tasks[category].find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            
            // Move to done category if completed
            if (task.completed && category !== 'done') {
                this.tasks[category] = this.tasks[category].filter(t => t.id !== taskId);
                if (!this.tasks.done) this.tasks.done = [];
                this.tasks.done.push(task);
            }
            
            this.saveTasks();
            this.render();
        }
    }

    deleteTask(taskId, category) {
        this.tasks[category] = this.tasks[category].filter(t => t.id !== taskId);
        this.saveTasks();
        this.render();
        
        this.showNotification(this.translations[this.currentLanguage].taskDeleted);
    }

    createNewList() {
        const t = this.translations[this.currentLanguage];
        const listName = prompt(t.enterListName);
        if (listName && listName.trim()) {
            const categoryId = listName.toLowerCase().replace(/\s+/g, '-');
            
            // Add to categories
            const categoriesList = document.querySelector('.categories ul');
            const newCategory = document.createElement('li');
            newCategory.innerHTML = `<a href="#${categoryId}">📋 ${listName}</a>`;
            categoriesList.appendChild(newCategory);
            
            // Add click event
            newCategory.querySelector('a').addEventListener('click', (e) => {
                e.preventDefault();
                this.switchCategory(categoryId);
            });
            
            // Initialize empty task list
            this.tasks[categoryId] = [];
            this.saveTasks();
            
            this.showNotification(t.newListCreated);
        }
    }

    clearCompleted() {
        const t = this.translations[this.currentLanguage];
        if (this.tasks.done && this.tasks.done.length > 0) {
            if (confirm(t.confirmClear)) {
                this.tasks.done = [];
                this.saveTasks();
                this.render();
                this.showNotification(t.completedCleared);
            }
        } else {
            this.showNotification(t.noCompletedTasks);
        }
    }

    exportTasks() {
        const t = this.translations[this.currentLanguage];
        const tasksText = this.formatTasksForExport();
        const blob = new Blob([tasksText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'todolist-tasks.txt';
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification(t.tasksExported);
    }

    formatTasksForExport() {
        const t = this.translations[this.currentLanguage];
        let output = `${t.appTitle} - ${t.exportTasks}\n`;
        output += `${t.todaysTasks}: ${new Date().toLocaleString()}\n`;
        output += `${t.enhancedBy}\n\n`;
        
        for (const [category, tasks] of Object.entries(this.tasks)) {
            if (tasks.length > 0) {
                output += `=== ${category.toUpperCase()} ===\n`;
                tasks.forEach(task => {
                    output += `${task.completed ? '✅' : '◯'} ${task.text}\n`;
                });
                output += '\n';
            }
        }
        
        return output;
    }

    render() {
        this.renderTasks();
        this.updateStats();
        this.updateEmptyStates();
    }

    renderTasks() {
        const t = this.translations[this.currentLanguage];
        
        // Render each category
        for (const [category, tasks] of Object.entries(this.tasks)) {
            const container = document.querySelector(`#${category} .tasks-list`);
            const emptyState = container.querySelector('.empty-state');
            const taskCount = document.querySelector(`#${category} .task-count`);
            
            if (tasks.length > 0) {
                emptyState.style.display = 'none';
                
                container.innerHTML = tasks.map(task => `
                    <div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                        <span class="task-text">${this.escapeHtml(task.text)}</span>
                        <div class="task-actions">
                            <button class="task-action-btn btn-edit">Edit</button>
                            <button class="task-action-btn btn-delete">Delete</button>
                        </div>
                    </div>
                `).join('');
                
                // Add event listeners
                container.querySelectorAll('.task-checkbox').forEach((checkbox, index) => {
                    checkbox.addEventListener('change', () => {
                        this.toggleTask(tasks[index].id, category);
                    });
                });
                
                container.querySelectorAll('.btn-delete').forEach((btn, index) => {
                    btn.addEventListener('click', () => {
                        this.deleteTask(tasks[index].id, category);
                    });
                });
                
                container.querySelectorAll('.btn-edit').forEach((btn, index) => {
                    btn.addEventListener('click', () => {
                        this.editTask(tasks[index], category);
                    });
                });
                
                const taskText = tasks.length === 1 ? t.task : t.tasks;
                taskCount.textContent = `${tasks.length} ${taskText}`;
            } else {
                container.innerHTML = '';
                container.appendChild(emptyState);
                emptyState.style.display = 'block';
                taskCount.textContent = `0 ${t.tasks}`;
            }
        }
    }

    editTask(task, category) {
        const t = this.translations[this.currentLanguage];
        const newText = prompt(t.editTask, task.text);
        if (newText !== null && newText.trim() !== '') {
            task.text = newText.trim();
            this.saveTasks();
            this.render();
            this.showNotification(t.taskUpdated);
        }
    }

    updateStats() {
        let total = 0;
        let completed = 0;
        
        for (const tasks of Object.values(this.tasks)) {
            total += tasks.length;
            completed += tasks.filter(t => t.completed).length;
        }
        
        document.getElementById('total-tasks').textContent = total;
        document.getElementById('completed-tasks').textContent = completed;
        document.getElementById('pending-tasks').textContent = total - completed;
    }

    updateEmptyStates() {
        // Empty states are already updated in applyLanguage()
    }

    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #48bb78;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveTasks() {
        localStorage.setItem('todoListTasks', JSON.stringify(this.tasks));
    }
}

// Add CSS for notification animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new TodoListPro();
});