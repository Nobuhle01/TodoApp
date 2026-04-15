import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import id from '@angular/common/locales/extra/id';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  userId: number;
}

export interface CreateTask {
  title: string;
  description: string;
  status: string;
  userId: number;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private apiUrl = 'http://localhost:8080/api/tasks'; // ✅ IMPORTANT

  constructor(private http: HttpClient) {}

  getTasks(): Observable<Task[]> {
  return this.http.get<Task[]>(this.apiUrl);
}

createTask(task: CreateTask) {
  return this.http.post<Task>(this.apiUrl, task);
}

deleteTask(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

    // UPDATE
  updateTask(id: number, task: CreateTask) {
    return this.http.put<Task>(`${this.apiUrl}/${id}`, task);
  }
}