import { exportTasks, importTasks } from './utils.js';

// Application state
let tasks = [];
const taskInput = document.getElementById('taskInput');
const addButton = document.getElementById('addButton');
const clearButton = document.getElementById('clearButton');
const prioritySelect = document.getElementById('prioritySelect');
const dueDateInput = document.getElementById('dueDateInput');
const categoryInput = document.getElementById('categoryInput');
const taskList = document.getElementById('taskList');
const filterAll = document.getElementById('filterAll');
const filterActive = document.getElementById('filterActive');
const filterCompleted = document.getElementById('filterCompleted');
const filterOverdue = document.getElementById('filterOverdue');
const darkModeToggle = document.getElementById('darkModeToggle');
const sortSelect = document.getElementById('sortSelect');
const exportButton = document.getElementById('exportButton');
const importButton = document.getElementById('importButton');
const importInput = document.getElementById('importInput');
const searchInput = document.getElementById('searchInput');
const undoButton = document.getElementById('undoButton');
const redoButton = document.getElementById('redoButton');
const bulkCompleteButton = document.getElementById('bulkCompleteButton');
const archiveButton = document.getElementById('archiveButton');
const templateButton = document.getElementById('templateButton');
const templateSelect = document.getElementById('templateSelect');

// Application configuration
let currentFilter = 'all';
let darkMode = localStorage.getItem('darkMode') === 'true';
let taskHistory = [];
let historyIndex = -1;

// Dark mode functionality
function toggleDarkMode() {
    // Toggle dark mode state and update UI
    darkMode = !darkMode;
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', darkMode);
    darkModeToggle.textContent = darkMode ? '☀️ Light Mode' : '🌙 Dark Mode';
}

if (darkMode) {
    document.body.classList.add('dark-mode');
    darkModeToggle.textContent = '☀️ Light Mode';
}

darkModeToggle.addEventListener('click', toggleDarkMode);

// Load tasks from localStorage on page load
function loadTasks() {
    // Retrieve and restore saved tasks
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        tasks.forEach(task => {
            const li = createTaskElement(task.text, task.completed, task.priority || 'medium', task.createdAt, task.dueDate, task.category);
            taskList.appendChild(li);
        });
    }
}

// Debounce function for performance optimization
function debounce(func, wait) {
    // Prevents function from being called too frequently
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Save tasks to localStorage with debouncing for performance
const saveTasksDebounced = debounce(function() {
    const taskElements = taskList.querySelectorAll('li');
    tasks = Array.from(taskElements).map(li => {
        const priorityClass = Array.from(li.classList).find(c => c.startsWith('priority-'));
        const priority = priorityClass ? priorityClass.replace('priority-', '') : 'medium';
        const timeSpan = li.querySelector('.task-time');
        const createdAt = timeSpan ? timeSpan.getAttribute('data-time') : new Date().toISOString();
        const dueDateSpan = li.querySelector('.due-date');
        const dueDate = dueDateSpan ? dueDateSpan.getAttribute('data-due') : null;
        const categorySpan = li.querySelector('.category-badge');
        const category = categorySpan ? categorySpan.getAttribute('data-category') : null;
        return {
            text: li.childNodes[1].textContent.trim(),
            completed: li.querySelector('.task-checkbox').checked,
            priority: priority,
            createdAt: createdAt,
            dueDate: dueDate,
            category: category
        };
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    // Add to history for undo/redo
    taskHistory = taskHistory.slice(0, historyIndex + 1);
    taskHistory.push(JSON.stringify(tasks));
    historyIndex++;
    if (taskHistory.length > 50) {
        taskHistory.shift();
        historyIndex--;
    }
}, 300);

function saveTasks() {
    saveTasksDebounced();
}

addButton.addEventListener('click', function() {
    addTask();
});

clearButton.addEventListener('click', function() {
    if (confirm('Are you sure you want to clear all tasks?')) {
        taskList.innerHTML = '';
        tasks = [];
        localStorage.removeItem('tasks');
        updateTaskCount();
    }
});

// Bulk operations
bulkCompleteButton.addEventListener('click', function() {
    const visibleTasks = Array.from(taskList.querySelectorAll('li')).filter(li => li.style.display !== 'none');
    const incompleteTasks = visibleTasks.filter(li => !li.querySelector('.task-checkbox').checked);
    
    if (incompleteTasks.length === 0) {
        alert('No incomplete tasks to complete.');
        return;
    }
    
    if (confirm(`Mark ${incompleteTasks.length} task(s) as completed?`)) {
        incompleteTasks.forEach(li => {
            const checkbox = li.querySelector('.task-checkbox');
            checkbox.checked = true;
            li.style.textDecoration = 'line-through';
            li.style.opacity = '0.6';
        });
        saveTasks();
        updateTaskCount();
    }
});

taskInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K to focus input
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        taskInput.focus();
    }
    // Escape to clear input
    if (e.key === 'Escape' && document.activeElement === taskInput) {
        taskInput.value = '';
        taskInput.blur();
    }
    // Arrow keys for navigation
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const visibleTasks = Array.from(taskList.querySelectorAll('li')).filter(li => li.style.display !== 'none');
        if (visibleTasks.length > 0) {
            const currentIndex = visibleTasks.findIndex(li => li === document.activeElement);
            let nextIndex;
            if (e.key === 'ArrowDown') {
                nextIndex = currentIndex < visibleTasks.length - 1 ? currentIndex + 1 : 0;
            } else {
                nextIndex = currentIndex > 0 ? currentIndex - 1 : visibleTasks.length - 1;
            }
            visibleTasks[nextIndex].focus();
            e.preventDefault();
        }
    }
});

function createTaskElement(taskText, isCompleted = false, priority = 'medium', createdAt = null, dueDate = null, category = null) {
        const li = document.createElement('li');
    const textNode = document.createTextNode(taskText);
    
    // Add priority class
    li.className = `priority-${priority}`;
    li.setAttribute('tabindex', '0');
    
    // Add timestamp
    const timestamp = createdAt || new Date().toISOString();
    const date = new Date(timestamp);
    const timeStr = date.toLocaleString();
    const timeSpan = document.createElement('span');
    timeSpan.className = 'task-time';
    timeSpan.textContent = timeStr;
    timeSpan.setAttribute('data-time', timestamp);
    timeSpan.style.fontSize = '12px';
    timeSpan.style.color = '#666';
    timeSpan.style.marginLeft = '10px';
    
    // Add checkbox for task completion
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = isCompleted;
    checkbox.setAttribute('aria-label', `Mark "${taskText}" as ${isCompleted ? 'incomplete' : 'complete'}`);
    checkbox.addEventListener('change', function() {
        if (checkbox.checked) {
            li.style.textDecoration = 'line-through';
            li.style.opacity = '0.6';
            // Show completion animation
            li.style.transform = 'scale(0.98)';
            setTimeout(() => {
                li.style.transform = 'scale(1)';
            }, 200);
        } else {
            li.style.textDecoration = 'none';
            li.style.opacity = '1';
        }
        saveTasks();
        updateTaskCount();
        filterTasks(currentFilter);
    });
    li.appendChild(checkbox);
    li.appendChild(textNode);
    li.appendChild(timeSpan);
    
    // Add due date if provided
    if (dueDate) {
        const dueDateSpan = document.createElement('span');
        dueDateSpan.className = 'due-date';
        const dueDateObj = new Date(dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dueDateObj.setHours(0, 0, 0, 0);
        
        if (dueDateObj < today) {
            dueDateSpan.textContent = `⚠️ Overdue: ${dueDateObj.toLocaleDateString()}`;
            dueDateSpan.style.color = '#f44336';
            dueDateSpan.style.fontWeight = 'bold';
        } else if (dueDateObj.getTime() === today.getTime()) {
            dueDateSpan.textContent = `📅 Due today`;
            dueDateSpan.style.color = '#ff9800';
        } else {
            dueDateSpan.textContent = `📅 Due: ${dueDateObj.toLocaleDateString()}`;
            dueDateSpan.style.color = '#4CAF50';
        }
        dueDateSpan.style.fontSize = '12px';
        dueDateSpan.style.marginLeft = '10px';
        dueDateSpan.setAttribute('data-due', dueDate);
        li.appendChild(dueDateSpan);
    }
    
    if (isCompleted) {
        li.style.textDecoration = 'line-through';
        li.style.opacity = '0.6';
    }
    
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.style.backgroundColor = '#2196F3';
    editBtn.style.marginLeft = '10px';
    editBtn.className = 'edit-btn';
    editBtn.addEventListener('click', function() {
        const newText = prompt('Edit task:', taskText);
        if (newText !== null && newText.trim() !== '') {
            if (newText.trim().length > 200) {
                alert('Task text is too long. Maximum 200 characters allowed.');
                return;
            }
            textNode.textContent = newText.trim();
            saveTasks();
        }
    });
    li.appendChild(editBtn);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.style.backgroundColor = '#f44336';
        deleteBtn.style.marginLeft = '10px';
        deleteBtn.className = 'delete-btn';
        deleteBtn.addEventListener('click', function() {
            li.remove();
        saveTasks();
        updateTaskCount();
        });
        li.appendChild(deleteBtn);
        
    return li;
}

function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText) {
        if (taskText.length > 200) {
            alert('Task text is too long. Maximum 200 characters allowed.');
            return;
        }
        const priority = prioritySelect.value;
        const dueDate = dueDateInput.value || null;
        const category = categoryInput.value.trim() || null;
        const li = createTaskElement(taskText, false, priority, null, dueDate, category);
        taskList.appendChild(li);
        taskInput.value = '';
        dueDateInput.value = '';
        categoryInput.value = '';
        saveTasks();
        updateTaskCount();
        filterTasks(currentFilter); // Reapply filter
    } else {
        alert('Please enter a task before adding.');
    }
}

// Update task counter and statistics
function updateTaskCount() {
    const allTasks = taskList.querySelectorAll('li');
    const count = allTasks.length;
    const taskCountElement = document.getElementById('taskCount');
    if (taskCountElement) {
        taskCountElement.textContent = `${count} ${count === 1 ? 'task' : 'tasks'}`;
    }
    
    // Update statistics
    let active = 0, completed = 0, overdue = 0;
    allTasks.forEach(li => {
        const checkbox = li.querySelector('.task-checkbox');
        if (checkbox.checked) {
            completed++;
        } else {
            active++;
        }
        const dueDateSpan = li.querySelector('.due-date');
        if (dueDateSpan && dueDateSpan.textContent.includes('Overdue')) {
            overdue++;
        }
    });
    
    document.getElementById('statTotal').textContent = count;
    document.getElementById('statActive').textContent = active;
    document.getElementById('statCompleted').textContent = completed;
    document.getElementById('statOverdue').textContent = overdue;
}

// Filter tasks based on selected filter
function filterTasks(filter) {
    currentFilter = filter;
    const taskItems = taskList.querySelectorAll('li');
    taskItems.forEach(li => {
        const checkbox = li.querySelector('.task-checkbox');
        const isCompleted = checkbox.checked;
        const dueDateSpan = li.querySelector('.due-date');
        const isOverdue = dueDateSpan && dueDateSpan.textContent.includes('Overdue');
        
        if (filter === 'all') {
            li.style.display = 'flex';
        } else if (filter === 'active' && !isCompleted) {
            li.style.display = 'flex';
        } else if (filter === 'completed' && isCompleted) {
            li.style.display = 'flex';
        } else if (filter === 'overdue' && isOverdue && !isCompleted) {
            li.style.display = 'flex';
        } else {
            li.style.display = 'none';
        }
    });
    
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if (filter === 'all') filterAll.classList.add('active');
    if (filter === 'active') filterActive.classList.add('active');
    if (filter === 'completed') filterCompleted.classList.add('active');
    if (filter === 'overdue') filterOverdue.classList.add('active');
}

filterAll.addEventListener('click', () => filterTasks('all'));
filterActive.addEventListener('click', () => filterTasks('active'));
filterCompleted.addEventListener('click', () => filterTasks('completed'));
filterOverdue.addEventListener('click', () => filterTasks('overdue'));

// Sort functionality
sortSelect.addEventListener('change', function() {
    sortTasks(sortSelect.value);
});

function sortTasks(sortBy) {
    const taskItems = Array.from(taskList.querySelectorAll('li'));
    
    taskItems.sort((a, b) => {
        if (sortBy === 'priority') {
            const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
            const aPriority = Array.from(a.classList).find(c => c.startsWith('priority-'))?.replace('priority-', '') || 'medium';
            const bPriority = Array.from(b.classList).find(c => c.startsWith('priority-'))?.replace('priority-', '') || 'medium';
            return priorityOrder[bPriority] - priorityOrder[aPriority];
        } else if (sortBy === 'dueDate') {
            const aDue = a.querySelector('.due-date')?.getAttribute('data-due');
            const bDue = b.querySelector('.due-date')?.getAttribute('data-due');
            if (!aDue && !bDue) return 0;
            if (!aDue) return 1;
            if (!bDue) return -1;
            return new Date(aDue) - new Date(bDue);
        } else if (sortBy === 'alphabetical') {
            const aText = a.childNodes[1].textContent.trim().toLowerCase();
            const bText = b.childNodes[1].textContent.trim().toLowerCase();
            return aText.localeCompare(bText);
        } else { // date
            const aTime = a.querySelector('.task-time')?.getAttribute('data-time');
            const bTime = b.querySelector('.task-time')?.getAttribute('data-time');
            return new Date(bTime) - new Date(aTime);
        }
    });
    
    taskItems.forEach(li => taskList.appendChild(li));
}

// Export/Import functionality
exportButton.addEventListener('click', function() {
    exportTasks();
});

importButton.addEventListener('click', function() {
    importInput.click();
});

importInput.addEventListener('change', function(e) {
    if (e.target.files.length > 0) {
        importTasks(e.target.files[0]);
    }
});

// Undo/Redo functionality
undoButton.addEventListener('click', function() {
    if (historyIndex > 0) {
        historyIndex--;
        const previousState = JSON.parse(taskHistory[historyIndex]);
        restoreTasks(previousState);
    }
});

redoButton.addEventListener('click', function() {
    if (historyIndex < taskHistory.length - 1) {
        historyIndex++;
        const nextState = JSON.parse(taskHistory[historyIndex]);
        restoreTasks(nextState);
    }
});

function restoreTasks(tasksData) {
    taskList.innerHTML = '';
    tasksData.forEach(task => {
        const li = createTaskElement(task.text, task.completed, task.priority || 'medium', task.createdAt, task.dueDate, task.category);
        taskList.appendChild(li);
    });
    updateTaskCount();
    filterTasks(currentFilter);
}

// Search functionality with debouncing
const searchTasksDebounced = debounce(function(searchTerm) {
    const taskItems = taskList.querySelectorAll('li');
    taskItems.forEach(li => {
        const taskText = li.childNodes[1].textContent.toLowerCase();
        if (taskText.includes(searchTerm)) {
            li.style.display = 'flex';
        } else {
            li.style.display = 'none';
        }
    });
}, 200);

searchInput.addEventListener('input', function() {
    const searchTerm = searchInput.value.toLowerCase();
    searchTasksDebounced(searchTerm);
});

// Load tasks when page loads
loadTasks();
updateTaskCount();

