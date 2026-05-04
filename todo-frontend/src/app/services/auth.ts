import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface LoginResponse {
  token: string;
  userId: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // REGISTER
  register(data: { name: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/register`, data);
  }

  // LOGIN — saves token + userId to localStorage
  login(data: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, data).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('userId', response.userId.toString());
        localStorage.setItem('name', response.name);
      })
    );
  }

  // LOGOUT
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('name');
  }

  // HELPERS
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserId(): number {
    return Number(localStorage.getItem('userId'));
  }

  getUserName(): string {
    return localStorage.getItem('name') || '';
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}