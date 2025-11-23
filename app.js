let tasks = [];
const taskInput = document.getElementById('taskInput');
const addButton = document.getElementById('addButton');
const clearButton = document.getElementById('clearButton');
const taskList = document.getElementById('taskList');

// Load tasks from localStorage on page load
function loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        tasks.forEach(task => {
            const li = createTaskElement(task.text, task.completed);
            taskList.appendChild(li);
        });
    }
}

// Save tasks to localStorage
function saveTasks() {
    const taskElements = taskList.querySelectorAll('li');
    tasks = Array.from(taskElements).map(li => ({
        text: li.childNodes[1].textContent.trim(),
        completed: li.querySelector('.task-checkbox').checked
    }));
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

function createTaskElement(taskText, isCompleted = false) {
    const li = document.createElement('li');
    const textNode = document.createTextNode(taskText);
    
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
        const li = createTaskElement(taskText);
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

