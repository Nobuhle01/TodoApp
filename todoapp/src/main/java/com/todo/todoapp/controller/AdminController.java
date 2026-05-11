package com.todo.todoapp.controller;

import com.todo.todoapp.dto.AdminUserSummaryDTO;
import com.todo.todoapp.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // GET all users with task counts
    @GetMapping("/users")
    public List<AdminUserSummaryDTO> getAllUsersWithTaskCount() {
        return adminService.getAllUsersWithTaskCount();
    }

    // DELETE a user and their tasks
    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
    }
}