package com.todo.todoapp.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class TaskResponseDTO {
    private Long id;
    private String title;
    private String description;
    private String status;
    private String priority;   // ✅ NEW
    private LocalDate dueDate;   // ✅ NEW
    private Long userId;
}