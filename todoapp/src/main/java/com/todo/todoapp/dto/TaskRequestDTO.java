package com.todo.todoapp.dto;

import lombok.Data;
import java.time.LocalDate;
@Data
public class TaskRequestDTO {
    private String title;
    private String description;
    private String status;
    private String priority;   // ✅ NEW
    private LocalDate dueDate;   // ✅ NEW: LocalDate
    private Long userId;
}