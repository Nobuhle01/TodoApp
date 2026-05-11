package com.todo.todoapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminUserSummaryDTO {
    private Long userId;
    private String name;
    private String email;
    private String role;
    private Long totalTasks;
    private Long completedTasks;
    private Long pendingTasks;
}