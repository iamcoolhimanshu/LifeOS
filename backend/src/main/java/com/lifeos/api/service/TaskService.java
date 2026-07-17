package com.lifeos.api.service;

import com.lifeos.api.model.Task;
import com.lifeos.api.model.User;
import com.lifeos.api.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TaskService {
    @Autowired
    private TaskRepository taskRepository;

    public List<Task> getTasksForUser(User user) {
        return taskRepository.findByUserOrderByDueDateAsc(user);
    }

    public Task getTaskForUser(User user, Long id) {
        return taskRepository.findById(id)
                .filter(t -> t.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Task not found or access denied"));
    }

    public Task createTask(User user, String title, String description, LocalDateTime dueDate, String priority, String status, String category) {
        Task task = new Task(user, title, description, dueDate, priority, status, category);
        return taskRepository.save(task);
    }

    public Task updateTask(User user, Long id, String title, String description, LocalDateTime dueDate, String priority, String status, String category) {
        Task task = getTaskForUser(user, id);
        task.setTitle(title);
        task.setDescription(description);
        task.setDueDate(dueDate);
        task.setPriority(priority);
        task.setStatus(status);
        task.setCategory(category);
        return taskRepository.save(task);
    }

    public void deleteTask(User user, Long id) {
        Task task = getTaskForUser(user, id);
        taskRepository.delete(task);
    }
}
