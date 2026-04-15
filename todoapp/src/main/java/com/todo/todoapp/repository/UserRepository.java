package com.todo.todoapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.todo.todoapp.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
}