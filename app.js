let tasks = [];
const taskInput = document.getElementById('taskInput');
const addButton = document.getElementById('addButton');
const taskList = document.getElementById('taskList');

addButton.addEventListener('click', function() {
    addTask();
});

taskInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});

function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText) {
        const li = document.createElement('li');
        li.textContent = taskText;
        
        // Add checkbox for task completion
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.addEventListener('change', function() {
            if (checkbox.checked) {
                li.style.textDecoration = 'line-through';
                li.style.opacity = '0.6';
            } else {
                li.style.textDecoration = 'none';
                li.style.opacity = '1';
            }
        });
        li.insertBefore(checkbox, li.firstChild);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.style.backgroundColor = '#f44336';
        deleteBtn.style.marginLeft = '10px';
        deleteBtn.className = 'delete-btn';
        deleteBtn.addEventListener('click', function() {
            li.remove();
        });
        li.appendChild(deleteBtn);
        
        taskList.appendChild(li);
        taskInput.value = '';
    }
}

