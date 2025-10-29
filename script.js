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
        this.generateSummaryBtn = document.getElementById('generateSummaryBtn');
        this.summarySection = document.getElementById('summarySection');
        this.summaryContent = document.getElementById('summaryContent');
        this.closeSummaryBtn = document.getElementById('closeSummaryBtn');
        
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
        
        this.generateSummaryBtn.addEventListener('click', () => this.generateSummary());
        this.closeSummaryBtn.addEventListener('click', () => this.closeSummary());
        
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
    
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.save();
            this.render();
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
    
    async generateSummary() {
        if (this.todos.length === 0) {
            alert('Add some tasks first to generate a summary!');
            return;
        }
        
        this.summarySection.style.display = 'block';
        this.summaryContent.innerHTML = '<div class="loading">Generating your personalized summary...</div>';
        
        try {
            const summary = await this.callGeminiAPI();
            this.summaryContent.innerHTML = summary;
        } catch (error) {
            console.error('Error generating summary:', error);
            this.summaryContent.innerHTML = `
                <div style="color: #ff6b6b;">
                    <strong>Error:</strong> Could not generate summary. Please check your API key and try again.
                    <br><br>
                    <small>Make sure you've added your Gemini API key to the code.</small>
                </div>
            `;
        }
    }
    
    closeSummary() {
        this.summarySection.style.display = 'none';
    }
    
    async callGeminiAPI() {
        // TODO: Replace with your actual Gemini API key
        const API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
        
        if (API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
            throw new Error('Please add your Gemini API key to the code');
        }
        
        const todos = this.todos.map(todo => {
            const status = todo.completed ? '✅ Completed' : '⏳ Pending';
            const description = todo.description ? ` (${todo.description})` : '';
            return `${status}: ${todo.text}${description}`;
        }).join('\n');
        
        const prompt = `Please create a motivational daily summary for these tasks. Make it encouraging and help prioritize what to focus on today. Keep it concise but inspiring:

${todos}

Format the response as a friendly daily plan with:
1. A brief motivational opening
2. Priority tasks to focus on
3. A positive closing note

Keep it under 200 words and make it feel personal and encouraging.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
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
                    <span class="todo-text" onclick="app.editDescription(${todo.id})">
                        ${this.escapeHtml(todo.text)}
                    </span>
                    <button class="delete-btn" onclick="app.deleteTodo(${todo.id})">
                        Delete
                    </button>
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
