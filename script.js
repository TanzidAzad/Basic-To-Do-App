class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.descriptionSection = document.getElementById('descriptionSection');
        this.descriptionInput = document.getElementById('descriptionInput');
        this.toggleDescriptionBtn = document.getElementById('toggleDescriptionBtn');
        this.editModal = document.getElementById('editModal');
        this.editDescriptionInput = document.getElementById('editDescriptionInput');
        this.saveDescriptionBtn = document.getElementById('saveDescriptionBtn');
        this.cancelEditBtn = document.getElementById('cancelEditBtn');
        this.currentEditingId = null;
        
        this.init();
    }
    
    init() {
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });
        this.toggleDescriptionBtn.addEventListener('click', () => this.toggleDescription());
        this.saveDescriptionBtn.addEventListener('click', () => this.saveDescription());
        this.cancelEditBtn.addEventListener('click', () => this.closeEditModal());
        
        // Close modal when clicking outside
        this.editModal.addEventListener('click', (e) => {
            if (e.target === this.editModal) this.closeEditModal();
        });
        
        this.render();
    }
    
    addTodo() {
        const text = this.todoInput.value.trim();
        if (text === '') return;
        
        const description = this.descriptionInput.value.trim();
        
        const todo = {
            id: Date.now(),
            text: text,
            description: description,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.todos.unshift(todo);
        this.todoInput.value = '';
        this.descriptionInput.value = '';
        this.descriptionSection.style.display = 'none';
        this.toggleDescriptionBtn.textContent = 'Add Description';
        this.save();
        this.render();
    }
    
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.save();
            this.render();
        }
    }
    
    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.save();
        this.render();
    }
    
    toggleDescription() {
        const isVisible = this.descriptionSection.style.display !== 'none';
        if (isVisible) {
            this.descriptionSection.style.display = 'none';
            this.toggleDescriptionBtn.textContent = 'Add Description';
        } else {
            this.descriptionSection.style.display = 'block';
            this.toggleDescriptionBtn.textContent = 'Hide Description';
            this.descriptionInput.focus();
        }
    }
    
    editDescription(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            this.currentEditingId = id;
            this.editDescriptionInput.value = todo.description || '';
            this.editModal.style.display = 'flex';
            this.editDescriptionInput.focus();
        }
    }
    
    saveDescription() {
        if (this.currentEditingId !== null) {
            const todo = this.todos.find(t => t.id === this.currentEditingId);
            if (todo) {
                todo.description = this.editDescriptionInput.value.trim();
                this.save();
                this.render();
            }
            this.closeEditModal();
        }
    }
    
    closeEditModal() {
        this.editModal.style.display = 'none';
        this.currentEditingId = null;
        this.editDescriptionInput.value = '';
    }
    
    save() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }
    
    render() {
        if (this.todos.length === 0) {
            this.todoList.innerHTML = '<li class="empty-state">No tasks yet. Add one above!</li>';
            return;
        }
        
        this.todoList.innerHTML = this.todos.map(todo => `
            <li class="todo-item ${todo.completed ? 'completed' : ''}">
                <div class="todo-content">
                    <span class="todo-text" onclick="app.toggleTodo(${todo.id})">
                        ${this.escapeHtml(todo.text)}
                    </span>
                    <div class="todo-actions">
                        <button class="edit-description-btn" onclick="app.editDescription(${todo.id})">
                            ${todo.description ? 'Edit Desc' : 'Add Desc'}
                        </button>
                        <button class="delete-btn" onclick="app.deleteTodo(${todo.id})">
                            Delete
                        </button>
                    </div>
                </div>
                ${todo.description ? `<div class="todo-description">${this.escapeHtml(todo.description)}</div>` : ''}
            </li>
        `).join('');
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app when the page loads
const app = new TodoApp();
