package com.lifeos.api.controller;

import com.lifeos.api.dto.MessageResponse;
import com.lifeos.api.dto.TaskDTO;
import com.lifeos.api.model.Task;
import com.lifeos.api.model.User;
import com.lifeos.api.security.UserDetailsImpl;
import com.lifeos.api.service.ActivityLogService;
import com.lifeos.api.service.TaskService;
import com.lifeos.api.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    @Autowired
    private TaskService taskService;

    @Autowired
    private UserService userService;

    @Autowired
    private ActivityLogService activityLogService;

    private User getAuthenticatedUser(UserDetailsImpl userDetails) {
        return userService.findById(userDetails.getId()).get();
    }

    @GetMapping
    public ResponseEntity<List<Task>> getTasks(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = getAuthenticatedUser(userDetails);
        return ResponseEntity.ok(taskService.getTasksForUser(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@AuthenticationPrincipal UserDetailsImpl userDetails, @PathVariable Long id) {
        User user = getAuthenticatedUser(userDetails);
        return ResponseEntity.ok(taskService.getTaskForUser(user, id));
    }

    @PostMapping
    public ResponseEntity<Task> createTask(@AuthenticationPrincipal UserDetailsImpl userDetails, @Valid @RequestBody TaskDTO taskDTO) {
        User user = getAuthenticatedUser(userDetails);
        Task task = taskService.createTask(
                user,
                taskDTO.getTitle(),
                taskDTO.getDescription(),
                taskDTO.getDueDate(),
                taskDTO.getPriority(),
                taskDTO.getStatus(),
                taskDTO.getCategory()
        );
        activityLogService.logActivity(user, "TASK_CREATE", "Added task: " + task.getTitle());
        return ResponseEntity.ok(task);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@AuthenticationPrincipal UserDetailsImpl userDetails, @PathVariable Long id, @Valid @RequestBody TaskDTO taskDTO) {
        User user = getAuthenticatedUser(userDetails);
        Task task = taskService.updateTask(
                user,
                id,
                taskDTO.getTitle(),
                taskDTO.getDescription(),
                taskDTO.getDueDate(),
                taskDTO.getPriority(),
                taskDTO.getStatus(),
                taskDTO.getCategory()
        );
        activityLogService.logActivity(user, "TASK_UPDATE", "Updated task: " + task.getTitle());
        return ResponseEntity.ok(task);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@AuthenticationPrincipal UserDetailsImpl userDetails, @PathVariable Long id) {
        User user = getAuthenticatedUser(userDetails);
        Task task = taskService.getTaskForUser(user, id);
        taskService.deleteTask(user, id);
        activityLogService.logActivity(user, "TASK_DELETE", "Deleted task: " + task.getTitle());
        return ResponseEntity.ok(new MessageResponse("Task deleted successfully."));
    }
}
