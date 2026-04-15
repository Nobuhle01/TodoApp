package com.todo.todoapp.dto;

import lombok.Data;

@Data
public class TaskRequestDTO {
    private String title;
    private String description;
    private String status;
    private Long userId;
}