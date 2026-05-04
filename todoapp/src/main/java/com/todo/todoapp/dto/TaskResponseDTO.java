package com.todo.todoapp.dto;

import lombok.Data;

@Data
public class TaskResponseDTO {
    private Long id;
    private String title;
    private String description;
    private String status;
    private String priority;   // ✅ NEW
    private Long userId;
}