package com.todo.todoapp.controller;

import java.util.List;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import com.todo.todoapp.dto.UserRequestDTO;
import com.todo.todoapp.dto.UserResponseDTO;
import com.todo.todoapp.service.UserService;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor

public class UserController {

    private final UserService userService;

    // REGISTER USER
    @PostMapping("/register")
    public UserResponseDTO registerUser(@RequestBody UserRequestDTO dto) {
        return userService.registerUser(dto);
    }

    // GET ALL USERS (DTO)
    @GetMapping
    public List<UserResponseDTO> getUsers() {
        return userService.getAllUsers();
    }

    // GET USER BY ID (DTO)
    @GetMapping("/{id}")
    public UserResponseDTO getUser(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    // DELETE USER
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }
}