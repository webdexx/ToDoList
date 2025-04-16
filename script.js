// Initialize jsPDF
const { jsPDF } = window.jspdf;

// DOM Elements
const taskInput = document.getElementById('taskInput');
const categoryInput = document.getElementById('categoryInput');
const priorityInput = document.getElementById('priorityInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const categoryFilter = document.getElementById('categoryFilter');
const priorityFilter = document.getElementById('priorityFilter');
const downloadPdfBtn = document.getElementById('downloadPdfBtn');

// Store tasks and categories
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let categories = JSON.parse(localStorage.getItem('categories')) || ['Work', 'Personal', 'Shopping'];

// Initialize the app
function init() {
    renderTasks();
    updateCategoryFilter();
    addEventListeners();
}

// Add event listeners
function addEventListeners() {
    addTaskBtn.addEventListener('click', addTask);
    downloadPdfBtn.addEventListener('click', downloadTasksAsPdf);
    categoryFilter.addEventListener('change', renderTasks);
    priorityFilter.addEventListener('change', renderTasks);
}

// Add a new task
function addTask() {
    const taskText = taskInput.value.trim();
    const category = categoryInput.value.trim();
    const priority = priorityInput.value;

    if (taskText && category) {
        const task = {
            id: Date.now(),
            text: taskText,
            category: category,
            priority: priority,
            completed: false,
            createdAt: new Date()
        };

        tasks.push(task);
        
        // Add category if it's new
        if (!categories.includes(category)) {
            categories.push(category);
            updateCategoryFilter();
        }

        saveTasks();
        renderTasks();
        clearInputs();
    }
}

// Clear input fields
function clearInputs() {
    taskInput.value = '';
    categoryInput.value = '';
    priorityInput.value = 'low';
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('categories', JSON.stringify(categories));
}

// Update category filter options
function updateCategoryFilter() {
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    categories.forEach(category => {
        categoryFilter.innerHTML += `<option value="${category}">${category}</option>`;
    });
}

// Render tasks based on filters
function renderTasks() {
    const selectedCategory = categoryFilter.value;
    const selectedPriority = priorityFilter.value;

    const filteredTasks = tasks.filter(task => {
        const categoryMatch = selectedCategory === 'all' || task.category === selectedCategory;
        const priorityMatch = selectedPriority === 'all' || task.priority === selectedPriority;
        return categoryMatch && priorityMatch;
    });

    taskList.innerHTML = '';
    filteredTasks.forEach(task => {
        const taskElement = createTaskElement(task);
        taskList.appendChild(taskElement);
    });
}

// Create task element
function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.dataset.id = task.id;

    const taskContent = document.createElement('div');
    taskContent.className = 'task-content';
    
    const categoryBadge = document.createElement('span');
    categoryBadge.className = 'category-badge';
    categoryBadge.textContent = task.category;

    const taskText = document.createElement('span');
    taskText.className = `task-text priority-${task.priority}`;
    taskText.textContent = task.text;

    taskContent.appendChild(categoryBadge);
    taskContent.appendChild(taskText);

    const taskActions = document.createElement('div');
    taskActions.className = 'task-actions';

    const completeBtn = document.createElement('button');
    completeBtn.textContent = task.completed ? 'Undo' : 'Complete';
    completeBtn.addEventListener('click', () => toggleTaskComplete(task.id));

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => editTask(task.id));

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    taskActions.appendChild(completeBtn);
    taskActions.appendChild(editBtn);
    taskActions.appendChild(deleteBtn);

    li.appendChild(taskContent);
    li.appendChild(taskActions);

    return li;
}

// Toggle task completion
function toggleTaskComplete(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

// Edit task
function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        const newText = prompt('Edit task:', task.text);
        const newCategory = prompt('Edit category:', task.category);
        const newPriority = prompt('Edit priority (low/medium/high):', task.priority);

        if (newText && newCategory && ['low', 'medium', 'high'].includes(newPriority)) {
            task.text = newText;
            task.category = newCategory;
            task.priority = newPriority;

            if (!categories.includes(newCategory)) {
                categories.push(newCategory);
                updateCategoryFilter();
            }

            saveTasks();
            renderTasks();
        }
    }
}

// Delete task
function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        renderTasks();
    }
}

// Download tasks as PDF
function downloadTasksAsPdf() {
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(20);
    doc.text('ToDoList Tasks', 20, y);
    y += 20;

    doc.setFontSize(12);
    tasks.forEach(task => {
        const status = task.completed ? 'Completed' : 'Pending';
        const priority = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
        
        doc.text(`Task: ${task.text}`, 20, y);
        y += 10;
        doc.text(`Category: ${task.category}`, 20, y);
        y += 10;
        doc.text(`Priority: ${priority}`, 20, y);
        y += 10;
        doc.text(`Status: ${status}`, 20, y);
        y += 15;
    });

    doc.save('todolist_tasks.pdf');
}

// Initialize the application
init(); 