package com.todo.todoapp.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import com.todo.todoapp.entity.Task;
import com.todo.todoapp.entity.User;
import com.todo.todoapp.repository.TaskRepository;
import com.todo.todoapp.repository.UserRepository;
import com.todo.todoapp.dto.TaskRequestDTO;
import com.todo.todoapp.dto.TaskResponseDTO;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskResponseDTO createTask(TaskRequestDTO dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Task task = new Task();
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setStatus(dto.getStatus());
        task.setPriority(dto.getPriority());
        task.setDueDate(dto.getDueDate()); // ✅
        task.setUser(user);

        return mapToDTO(taskRepository.save(task));
    }

    public List<TaskResponseDTO> getTasksByUser(Long userId) {
        return taskRepository.findByUserId(userId)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<TaskResponseDTO> getAllTasks() {
        return taskRepository.findAll()
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public TaskResponseDTO getTaskById(Long id) {
        return mapToDTO(taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found")));
    }

    public TaskResponseDTO updateTask(Long id, TaskRequestDTO dto) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setStatus(dto.getStatus());
        task.setPriority(dto.getPriority());
        task.setDueDate(dto.getDueDate()); // ✅

        if (dto.getUserId() != null) {
            User user = userRepository.findById(dto.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            task.setUser(user);
        }

        return mapToDTO(taskRepository.save(task));
    }

    public void deleteTask(Long id) {
        taskRepository.delete(taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found")));
    }

    private TaskResponseDTO mapToDTO(Task task) {
        TaskResponseDTO dto = new TaskResponseDTO();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setStatus(task.getStatus());
        dto.setPriority(task.getPriority());
        dto.setDueDate(task.getDueDate()); // ✅
        if (task.getUser() != null) dto.setUserId(task.getUser().getId());
        return dto;
    }
}