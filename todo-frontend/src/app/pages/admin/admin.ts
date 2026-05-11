import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService, AdminUser } from '../../services/admin';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})
export class AdminComponent implements OnInit {

  users: AdminUser[] = [];
  isLoading = false;
  searchQuery = '';
  isDarkMode = false;

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router
  ) {
    this.isDarkMode = localStorage.getItem('darkMode') === 'true';
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    this.adminService.getAllUsers().subscribe({
      next: (data) => {
        this.users = [...data];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load users', err);
        this.isLoading = false;
      }
    });
  }

  get filteredUsers(): AdminUser[] {
    return this.users.filter(u =>
      u.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  get totalTasks(): number {
    return this.users.reduce((sum, u) => sum + u.totalTasks, 0);
  }

  get totalCompleted(): number {
    return this.users.reduce((sum, u) => sum + u.completedTasks, 0);
  }

  get totalPending(): number {
    return this.users.reduce((sum, u) => sum + u.pendingTasks, 0);
  }

  get overallRate(): number {
    if (this.totalTasks === 0) return 0;
    return Math.round((this.totalCompleted / this.totalTasks) * 100);
  }

  deleteUser(user: AdminUser) {
    if (user.role === 'ADMIN') {
      alert('Cannot delete the admin account!');
      return;
    }
    if (confirm(`Delete user "${user.name}" and all their tasks?`)) {
      this.users = this.users.filter(u => u.userId !== user.userId);
      this.adminService.deleteUser(user.userId).subscribe({
        error: () => this.loadUsers()
      });
    }
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', String(this.isDarkMode));
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}