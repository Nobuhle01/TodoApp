package com.todo.todoapp.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private String status;
    private String priority;   // ✅ NEW: minor, normal, critical

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}