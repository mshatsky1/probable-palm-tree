// Utility functions for task management

export function exportTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tasks-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export function importTasks(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const tasks = JSON.parse(e.target.result);
            if (Array.isArray(tasks)) {
                localStorage.setItem('tasks', JSON.stringify(tasks));
                location.reload();
            } else {
                alert('Error importing tasks: Invalid file format');
            }
        } catch (error) {
            alert('Error importing tasks: Invalid file format');
        }
    };
    reader.readAsText(file);
}

