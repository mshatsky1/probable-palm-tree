let tasks = [];
const taskInput = document.getElementById('taskInput');
const addButton = document.getElementById('addButton');
const clearButton = document.getElementById('clearButton');
const prioritySelect = document.getElementById('prioritySelect');
const taskList = document.getElementById('taskList');

// Load tasks from localStorage on page load
function loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        tasks.forEach(task => {
            const li = createTaskElement(task.text, task.completed, task.priority || 'medium', task.createdAt);
            taskList.appendChild(li);
        });
    }
}

// Save tasks to localStorage
function saveTasks() {
    const taskElements = taskList.querySelectorAll('li');
    tasks = Array.from(taskElements).map(li => {
        const priorityClass = Array.from(li.classList).find(c => c.startsWith('priority-'));
        const priority = priorityClass ? priorityClass.replace('priority-', '') : 'medium';
        const timeSpan = li.querySelector('.task-time');
        const createdAt = timeSpan ? timeSpan.getAttribute('data-time') : new Date().toISOString();
        return {
            text: li.childNodes[1].textContent.trim(),
            completed: li.querySelector('.task-checkbox').checked,
            priority: priority,
            createdAt: createdAt
        };
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
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
});

function createTaskElement(taskText, isCompleted = false, priority = 'medium', createdAt = null) {
    const li = document.createElement('li');
    const textNode = document.createTextNode(taskText);
    
    // Add priority class
    li.className = `priority-${priority}`;
    
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
    checkbox.addEventListener('change', function() {
        if (checkbox.checked) {
            li.style.textDecoration = 'line-through';
            li.style.opacity = '0.6';
        } else {
            li.style.textDecoration = 'none';
            li.style.opacity = '1';
        }
        saveTasks();
    });
    li.appendChild(checkbox);
    li.appendChild(textNode);
    li.appendChild(timeSpan);
    
    if (isCompleted) {
        li.style.textDecoration = 'line-through';
        li.style.opacity = '0.6';
    }
    
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
        const priority = prioritySelect.value;
        const li = createTaskElement(taskText, false, priority);
        taskList.appendChild(li);
        taskInput.value = '';
        saveTasks();
        updateTaskCount();
    }
}

// Update task counter
function updateTaskCount() {
    const count = taskList.querySelectorAll('li').length;
    const taskCountElement = document.getElementById('taskCount');
    if (taskCountElement) {
        taskCountElement.textContent = `${count} ${count === 1 ? 'task' : 'tasks'}`;
    }
}

// Load tasks when page loads
loadTasks();
updateTaskCount();

