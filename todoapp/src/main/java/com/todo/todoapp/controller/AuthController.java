package com.todo.todoapp.controller;

import com.todo.todoapp.dto.LoginRequestDTO;
import com.todo.todoapp.entity.User;
import com.todo.todoapp.repository.UserRepository;
import com.todo.todoapp.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor

public class AuthController {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO dto) {

        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // ⚠️ Plain text password check for now (we'll hash later with BCrypt)
        if (!user.getPassword().equals(dto.getPassword())) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getEmail());

        // Return token AND userId so Angular can use both
        return ResponseEntity.ok(Map.of(
                "token", token,
                "userId", user.getId(),
                "name", user.getName()
        ));
    }
}