package com.todo.todoapp.service;

import com.todo.todoapp.dto.AdminUserSummaryDTO;
import com.todo.todoapp.repository.TaskRepository;
import com.todo.todoapp.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    // GET ALL USERS WITH TASK COUNTS
    public List<AdminUserSummaryDTO> getAllUsersWithTaskCount() {
        return userRepository.findAll().stream().map(user -> {

            Long total     = taskRepository.countByUserId(user.getId());
            Long completed = taskRepository.countByUserIdAndStatus(user.getId(), "COMPLETED");
            Long pending   = taskRepository.countByUserIdAndStatus(user.getId(), "PENDING");

            return new AdminUserSummaryDTO(
                    user.getId(),
                    user.getName(),
                    user.getEmail(),
                    user.getRole(),
                    total,
                    completed,
                    pending
            );

        }).collect(Collectors.toList());
    }

    // DELETE USER AND THEIR TASKS
    @Transactional // ✅ required — deleteByUserId is a derived delete query
    public void deleteUser(Long id) {
        taskRepository.deleteByUserId(id); // delete tasks first
        userRepository.deleteById(id);     // then delete user
    }
}