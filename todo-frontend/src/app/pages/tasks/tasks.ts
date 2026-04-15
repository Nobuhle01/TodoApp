import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService, Task, CreateTask } from '../../services/task';

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

  newTask: CreateTask = {
    title: '',
    description: '',
    status: 'PENDING',
    userId: 1
  };

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks() {
    this.taskService.getTasks().subscribe(data => {
      this.tasks = data;
    });
  }

  // CREATE OR UPDATE
  submitTask() {

    if (this.isEditMode && this.editTaskId !== null) {

      this.taskService.updateTask(this.editTaskId, this.newTask)
        .subscribe(() => {
          this.resetForm();
          this.loadTasks();
        });

    } else {

      this.taskService.createTask(this.newTask)
        .subscribe(() => {
          this.resetForm();
          this.loadTasks();
        });

    }
  }

  // EDIT BUTTON CLICK
  editTask(task: Task) {
    this.isEditMode = true;
    this.editTaskId = task.id;

    this.newTask = {
      title: task.title,
      description: task.description,
      status: task.status,
      userId: task.userId
    };
  }

  // DELETE
  deleteTask(id: number) {
    this.taskService.deleteTask(id).subscribe(() => {
      this.loadTasks();
    });
  }

  // RESET FORM
  resetForm() {
    this.isEditMode = false;
    this.editTaskId = null;

    this.newTask = {
      title: '',
      description: '',
      status: 'PENDING',
      userId: 1
    };
  }
}