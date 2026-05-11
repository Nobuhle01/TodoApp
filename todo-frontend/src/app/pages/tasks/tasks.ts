import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TaskService, Task, CreateTask } from '../../services/task';  
import { AuthService } from '../../services/auth';                   

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tasks.html',
  styleUrls: ['./tasks.css']
})
export class Tasks implements OnInit {

  tasks: Task[] = [];
  isEditMode = false;
  editTaskId: number | null = null;
  userName: string = '';
  showModal = false;
  isLoading = false;
  isDarkMode = false;
  searchQuery = '';
  statusFilter = 'ALL';
  priorityFilter = 'ALL';
  toasts: Toast[] = [];
  toastCounter = 0;
  formErrors = { title: '', dueDate: '' };

  newTask: CreateTask = {
    title: '',
    description: '',
    status: 'PENDING',
    priority: 'NORMAL',
    dueDate: '',
    userId: 0
  };

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private router: Router
  ) {
    this.newTask.userId = this.authService.getUserId();
    this.userName = this.authService.getUserName();
    this.isDarkMode = localStorage.getItem('darkMode') === 'true';
  }

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (!userId || userId === 0) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadTasks();
  }

  // ── LOAD ──────────────────────────────────────────────────────────────────
  loadTasks() {
    this.isLoading = true;
    const userId = this.authService.getUserId();
    this.taskService.getTasksByUser(userId).subscribe({
      next: (data) => {
        this.tasks = [...data];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load tasks', err);
        this.isLoading = false;
        this.showToast('Failed to load tasks', 'error');
      }
    });
  }

  // ── FILTERS ───────────────────────────────────────────────────────────────
  get filteredTasks(): Task[] {
    return this.tasks.filter(t => {
      const matchSearch = t.title.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchStatus = this.statusFilter === 'ALL' || t.status === this.statusFilter;
      const matchPriority = this.priorityFilter === 'ALL' || t.priority === this.priorityFilter;
      return matchSearch && matchStatus && matchPriority;
    });
  }

  get pendingTasks(): Task[] {
    return this.filteredTasks.filter(t => t.status !== 'COMPLETED');
  }

  get completedTasks(): Task[] {
    return this.filteredTasks.filter(t => t.status === 'COMPLETED');
  }

  get completionRate(): number {
    if (this.tasks.length === 0) return 0;
    const completed = this.tasks.filter(t => t.status === 'COMPLETED').length;
    return Math.round((completed / this.tasks.length) * 100);
  }

  get overdueCount(): number {
    return this.tasks.filter(t => this.isOverdue(t)).length;
  }

  isOverdue(task: Task): boolean {
    if (!task.dueDate || task.status === 'COMPLETED') return false;
    return new Date(task.dueDate) < new Date();
  }

  // ── MODAL ─────────────────────────────────────────────────────────────────
  openModal() {
    this.showModal = true;
    this.formErrors = { title: '', dueDate: '' };
  }

  closeModal() {
    this.showModal = false;
    this.resetForm();
  }

  // ── VALIDATION ────────────────────────────────────────────────────────────
  validateForm(): boolean {
    let valid = true;
    this.formErrors = { title: '', dueDate: '' };

    if (!this.newTask.title || this.newTask.title.trim() === '') {
      this.formErrors.title = 'Task title is required';
      valid = false;
    }

    if (this.newTask.dueDate) {
      const due = new Date(this.newTask.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (due < today && !this.isEditMode) {
        this.formErrors.dueDate = 'Due date cannot be in the past';
        valid = false;
      }
    }

    return valid;
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────
  submitTask() {
    if (!this.validateForm()) return;

    if (this.isEditMode && this.editTaskId !== null) {
      const taskId = this.editTaskId;

      // ✅ CRITICAL FIX: snapshot the edited data BEFORE closeModal() resets the form
      const taskSnapshot: CreateTask = {
        title: this.newTask.title,
        description: this.newTask.description,
        status: this.newTask.status,
        priority: this.newTask.priority,
        dueDate: this.newTask.dueDate,
        userId: this.newTask.userId
      };

      this.closeModal(); // ✅ close first — snapshot already saved above

      this.taskService.updateTask(taskId, taskSnapshot).subscribe({
        next: (updatedTask) => {
          // ✅ Replace task in array with server response
          this.tasks = this.tasks.map(t => t.id === taskId ? updatedTask : t);
          this.showToast('Task updated successfully', 'success');
        },
        error: (err) => {
          console.error('Update failed', err);
          this.loadTasks(); // rollback
          this.showToast('Failed to update task', 'error');
        }
      });

    } else {

      // ✅ Snapshot before closing
      const taskToSave: CreateTask = {
        title: this.newTask.title,
        description: this.newTask.description,
        status: this.newTask.status,
        priority: this.newTask.priority,
        dueDate: this.newTask.dueDate,
        userId: this.newTask.userId
      };

      this.closeModal();

      this.taskService.createTask(taskToSave).subscribe({
        next: (createdTask) => {
          this.tasks = [...this.tasks, createdTask];
          this.showToast('Task created successfully!', 'success');
        },
        error: (err) => {
          console.error('Create failed', err);
          this.showToast('Failed to create task', 'error');
        }
      });
    }
  }

  // ✅ FIXED: pre-fills form correctly from the task being edited
  editTask(task: Task) {
    this.isEditMode = true;
    this.editTaskId = task.id;
    this.formErrors = { title: '', dueDate: '' };

    // ✅ Copy all task values into the form
    this.newTask = {
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority || 'NORMAL',
      dueDate: task.dueDate || '',
      userId: task.userId
    };

    this.showModal = true; // ✅ open AFTER form is pre-filled
  }

  toggleComplete(task: Task) {
    const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';

    this.tasks = this.tasks.map(t =>
      t.id === task.id ? { ...t, status: newStatus } : t
    );

    const updated: CreateTask = {
      title: task.title,
      description: task.description,
      status: newStatus,
      priority: task.priority,
      dueDate: task.dueDate,
      userId: task.userId
    };

    this.taskService.updateTask(task.id, updated).subscribe({
      next: () => this.showToast(
        newStatus === 'COMPLETED' ? '✅ Task completed!' : 'Task moved back to pending',
        'success'
      ),
      error: (err) => {
        console.error('Toggle failed', err);
        this.tasks = this.tasks.map(t =>
          t.id === task.id ? { ...t, status: task.status } : t
        );
        this.showToast('Failed to update task', 'error');
      }
    });
  }

  deleteTask(id: number) {
    const taskTitle = this.tasks.find(t => t.id === id)?.title || 'this task';
    this.showConfirmToast(`Delete "${taskTitle}"?`, id);
  }

  confirmDelete(id: number) {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.showToast('Task deleted', 'info');

    this.taskService.deleteTask(id).subscribe({
      error: (err) => {
        console.error('Delete failed', err);
        this.loadTasks();
        this.showToast('Failed to delete task', 'error');
      }
    });
  }

  // ── TOAST ─────────────────────────────────────────────────────────────────
  showToast(message: string, type: 'success' | 'error' | 'info') {
    const id = ++this.toastCounter;
    this.toasts.push({ id, message, type });
    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t.id !== id);
    }, 3000);
  }

  showConfirmToast(message: string, taskId: number) {
    this.toasts = this.toasts.filter(t => t.id !== taskId);
    this.toasts.push({ id: taskId, message, type: 'error' });
  }

  dismissToast(id: number) {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }

  // ── DARK MODE ─────────────────────────────────────────────────────────────
  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', String(this.isDarkMode));
  }

  // ── RESET ─────────────────────────────────────────────────────────────────
  resetForm() {
    this.isEditMode = false;
    this.editTaskId = null;
    this.formErrors = { title: '', dueDate: '' };
    this.newTask = {
      title: '',
      description: '',
      status: 'PENDING',
      priority: 'NORMAL',
      dueDate: '',
      userId: this.authService.getUserId()
    };
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}