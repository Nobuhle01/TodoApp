package com.todo.todoapp.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import com.todo.todoapp.entity.User;
import com.todo.todoapp.repository.UserRepository;
import com.todo.todoapp.dto.UserRequestDTO;
import com.todo.todoapp.dto.UserResponseDTO;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    // REGISTER USER (DTO)
    public UserResponseDTO registerUser(UserRequestDTO dto) {

        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword());

        User saved = userRepository.save(user);

        return mapToDTO(saved);
    }

    // GET ALL USERS
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // GET USER BY ID
    public UserResponseDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return mapToDTO(user);
    }

    // DELETE USER
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    // MAPPER METHOD
    private UserResponseDTO mapToDTO(User user) {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        return dto;
    }
}