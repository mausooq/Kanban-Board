class Kanban {
    constructor() {
      this.tasks = JSON.parse(localStorage.getItem('kanbanTasks')) || [];
      this.loadTasks();
      this.bindEvents();
    }
  
    loadTasks() {
      document.querySelectorAll('.dropzone, .dropzone--active').forEach(zone => {
        zone.innerHTML = '';
      });
  
     
      this.tasks.forEach(task => {
        this.createTaskCard(task);
      });
    }
  

    createTaskCard(task) {
      const taskCard = document.createElement('div');
      taskCard.classList.add('task-card', 'mb-2', 'p-2', 'bg-light', 'rounded', 'shadow-sm');
      taskCard.setAttribute('draggable', 'true');
      taskCard.dataset.id = task.id;
      
      const statusColors = {
        'to-do': 'border-primary',
        'in-progress': 'border-success',
        'completed': 'border-danger'
      };
      
      taskCard.classList.add('border-start', statusColors[task.status], 'border-4');
      
      taskCard.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h6 class="card-subtitle mb-0 fw-bold text-muted">${task.title}</h6>
          <div>
            <i class="fa-solid fa-pen-to-square edit-task text-secondary me-2" style="cursor: pointer;"></i>
            <i class="fa-solid fa-trash delete-task text-danger" style="cursor: pointer;"></i>
          </div>
        </div>
        <p class="card-text small mb-2 text-muted">${task.description || ''}</p>
        ${task.date ? `<small class="text-muted"><i class="fa-solid fa-calendar-day me-1"></i>${task.date}</small>` : ''}
      `;
  
      const column = task.status === 'to-do' ? 0 : 
                    task.status === 'in-progress' ? 1 : 2;
      
      const dropzones = document.querySelectorAll('.dropzone, .dropzone--active');
      dropzones[column].appendChild(taskCard);
      
      this.addDragEvents(taskCard);
      
    
      taskCard.querySelector('.edit-task').addEventListener('click', () => this.editTask(task.id));
      taskCard.querySelector('.delete-task').addEventListener('click', () => this.deleteTask(task.id));
    }
  
    bindEvents() {
      // Add new task buttons
      const addButtons = document.querySelectorAll('.btn-outline-primary, .btn-outline-success, .btn-outline-danger');
      addButtons.forEach((button, index) => {
        button.addEventListener('click', () => this.showAddTaskModal(index));
      });
  
      // Set up drag and drop zones
      document.querySelectorAll('.dropzone, .dropzone--active').forEach(dropzone => {
        dropzone.addEventListener('dragover', e => {
          e.preventDefault();
          const afterElement = this.getDragAfterElement(dropzone, e.clientY);
          const draggable = document.querySelector('.dragging');
          
          if (afterElement == null) {
            dropzone.appendChild(draggable);
          } else {
            dropzone.insertBefore(draggable, afterElement);
          }
        });
  
        dropzone.addEventListener('dragend', () => this.saveTasks());
      });
    }
  
    // Add drag and drop event listeners to a task card
    addDragEvents(taskCard) {
      taskCard.addEventListener('dragstart', () => {
        taskCard.classList.add('dragging');
      });
  
      taskCard.addEventListener('dragend', () => {
        taskCard.classList.remove('dragging');
        this.updateTaskStatus(taskCard);
      });
    }
  
    getDragAfterElement(container, y) {
      const draggableElements = [...container.querySelectorAll('.task-card:not(.dragging)')];
  
      return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
  
    showAddTaskModal(columnIndex) {
      const statuses = ['to-do', 'in-progress', 'completed'];
      const modalHTML = `
        <div class="modal fade" id="addTaskModal" tabindex="-1" aria-labelledby="addTaskModalLabel" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title text-muted" id="addTaskModalLabel">Add New Event</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <form id="taskForm">
                  <div class="mb-3">
                    <label for="taskTitle" class="form-label">Event Title</label>
                    <input type="text" class="form-control" id="taskTitle" placeholder="Add Task" required>
                  </div>
                  <div class="mb-3">
                    <label for="taskDescription" class="form-label">Description</label>
                    <textarea class="form-control" id="taskDescription" rows="3" placeholder="Add Description" ></textarea>
                  </div>
                  <div class="mb-3">
                    <label for="taskDate" class="form-label">Date</label>
                    <input type="date" class="form-control" id="taskDate">
                  </div>
                  <input type="hidden" id="taskStatus" value="${statuses[columnIndex]}">
                </form>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" id="saveTaskBtn">Save Task</button>
              </div>
            </div>
          </div>
        </div>
      `;
  
      if (!document.getElementById('addTaskModal')) {
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);
      }
  
      const modal = new bootstrap.Modal(document.getElementById('addTaskModal'));
      modal.show();
  
      document.getElementById('saveTaskBtn').addEventListener('click', () => {
        const title = document.getElementById('taskTitle').value;
        if (!title) return;
        
        const task = {
          id: Date.now().toString(),
          title: title,
          description: document.getElementById('taskDescription').value,
          date: document.getElementById('taskDate').value,
          status: document.getElementById('taskStatus').value
        };
  
        this.tasks.push(task);
        this.createTaskCard(task);
        this.saveTasks();
        modal.hide();
      });
    }
  
  
    editTask(taskId) {
      const task = this.tasks.find(t => t.id === taskId);
      if (!task) return;
  
      const modalHTML = `
        <div class="modal fade" id="editTaskModal" tabindex="-1" aria-labelledby="editTaskModalLabel" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title text-muted" id="editTaskModalLabel">Edit Event</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <form id="editTaskForm">
                  <div class="mb-3">
                    <label for="editTaskTitle" class="form-label">Event Title</label>
                    <input type="text" class="form-control" id="editTaskTitle" placeholder="Edit Title" value="${task.title}" required>
                  </div>
                  <div class="mb-3">
                    <label for="editTaskDescription" class="form-label">Description</label>
                    <textarea class="form-control" id="editTaskDescription" placeholder="Edit Description" rows="3">${task.description || ''}</textarea>
                  </div>
                  <div class="mb-3">
                    <label for="editTaskDate" class="form-label">Date</label>
                    <input type="date" class="form-control" id="editTaskDate" value="${task.date || ''}">
                  </div>
                  <input type="hidden" id="editTaskId" value="${task.id}">
                </form>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" id="updateTaskBtn">Update Task</button>
              </div>
            </div>
          </div>
        </div>
      `;
  
      if (!document.getElementById('editTaskModal')) {
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);
      } else {
        document.getElementById('editTaskModal').outerHTML = modalHTML;
      }
  

      const modal = new bootstrap.Modal(document.getElementById('editTaskModal'));
      modal.show();

      document.getElementById('updateTaskBtn').addEventListener('click', () => {
        const taskIndex = this.tasks.findIndex(t => t.id === task.id);
        if (taskIndex === -1) return;
        
        const title = document.getElementById('editTaskTitle').value;
        if (!title) return; 
        
        this.tasks[taskIndex] = {
          ...task,
          title: title,
          description: document.getElementById('editTaskDescription').value,
          date: document.getElementById('editTaskDate').value
        };
  
        this.saveTasks();
        this.loadTasks(); 
        modal.hide();
      });
    }

    deleteTask(taskId) {
      if (confirm('Are you sure you want to delete this task?')) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.saveTasks();
        this.loadTasks(); 
      }
    }
  
  
    updateTaskStatus(taskCard) {
      const taskId = taskCard.dataset.id;
      const task = this.tasks.find(t => t.id === taskId);
      if (!task) return;
  
   
      const dropzones = document.querySelectorAll('.dropzone, .dropzone--active');
      let newStatus = 'to-do';
      
      dropzones.forEach((zone, index) => {
        if (zone.contains(taskCard)) {
          newStatus = index === 0 ? 'to-do' : index === 1 ? 'in-progress' : 'completed';
        }
      });
  

      task.status = newStatus;
      this.saveTasks();
      

      taskCard.classList.remove('border-primary', 'border-success', 'border-danger');
      const statusColors = {
        'to-do': 'border-primary',
        'in-progress': 'border-success',
        'completed': 'border-danger'
      };
      taskCard.classList.add(statusColors[newStatus]);
    }
  

    saveTasks() {
      localStorage.setItem('kanbanTasks', JSON.stringify(this.tasks));
    }
  }
  

  document.addEventListener('DOMContentLoaded', () => {
    new Kanban();
  });