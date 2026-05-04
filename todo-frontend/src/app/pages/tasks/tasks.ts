import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TaskService, Task, CreateTask } from '../../services/task';  // ✅ fixed
import { AuthService } from '../../services/auth';                    // ✅ fixed

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
  searchQuery = '';

  newTask: CreateTask = {
    title: '',
    description: '',
    status: 'PENDING',
    priority: 'NORMAL',
    userId: 0
  };

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private router: Router
  ) {
    this.newTask.userId = this.authService.getUserId();
    this.userName = this.authService.getUserName();
  }

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (!userId || userId === 0) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadTasks();
  }

  // Only called once on page load
  loadTasks() {
    const userId = this.authService.getUserId();
    this.taskService.getTasksByUser(userId).subscribe({
      next: (data) => { this.tasks = [...data]; },
      error: (err) => console.error('Failed to load tasks', err)
    });
  }

  get pendingTasks(): Task[] {
    return this.tasks.filter(t =>
      t.status !== 'COMPLETED' &&
      t.title.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  get completedTasks(): Task[] {
    return this.tasks.filter(t =>
      t.status === 'COMPLETED' &&
      t.title.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  get completionRate(): number {
    if (this.tasks.length === 0) return 0;
    return Math.round((this.completedTasks.length / this.tasks.length) * 100);
  }

  openModal() { this.showModal = true; }

  closeModal() {
    this.showModal = false;
    this.resetForm();
  }

  submitTask() {
    if (this.isEditMode && this.editTaskId !== null) {

      this.taskService.updateTask(this.editTaskId, this.newTask)
        .subscribe({
          next: (updatedTask) => {
            // ✅ INSTANT: swap updated task in array, no reload
            this.tasks = this.tasks.map(t =>
              t.id === this.editTaskId ? updatedTask : t
            );
            this.closeModal();
          },
          error: (err) => console.error('Update failed', err)
        });

    } else {

      this.taskService.createTask(this.newTask)
        .subscribe({
          next: (createdTask) => {
            // ✅ INSTANT: append new task to array, no reload
            this.tasks = [...this.tasks, createdTask];
            this.closeModal();
          },
          error: (err) => console.error('Create failed', err)
        });
    }
  }

  editTask(task: Task) {
    this.isEditMode = true;
    this.editTaskId = task.id;
    this.newTask = {
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority || 'NORMAL',
      userId: task.userId
    };
    this.showModal = true;
  }

  toggleComplete(task: Task) {
    const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';

    // ✅ INSTANT: flip status in array immediately
    this.tasks = this.tasks.map(t =>
      t.id === task.id ? { ...t, status: newStatus } : t
    );

    const updated: CreateTask = {
      title: task.title,
      description: task.description,
      status: newStatus,
      priority: task.priority,
      userId: task.userId
    };

    this.taskService.updateTask(task.id, updated).subscribe({
      error: (err) => {
        // ✅ ROLLBACK if backend fails
        console.error('Toggle failed, rolling back', err);
        this.tasks = this.tasks.map(t =>
          t.id === task.id ? { ...t, status: task.status } : t
        );
      }
    });
  }

  deleteTask(id: number) {
    if (confirm('Are you sure you want to delete this task?')) {
      // ✅ INSTANT: remove from array immediately, no reload
      this.tasks = this.tasks.filter(t => t.id !== id);

      this.taskService.deleteTask(id).subscribe({
        error: (err) => {
          // ✅ ROLLBACK if backend fails
          console.error('Delete failed, rolling back', err);
          this.loadTasks();
        }
      });
    }
  }

  resetForm() {
    this.isEditMode = false;
    this.editTaskId = null;
    this.newTask = {
      title: '',
      description: '',
      status: 'PENDING',
      priority: 'NORMAL',
      userId: this.authService.getUserId()
    };
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}