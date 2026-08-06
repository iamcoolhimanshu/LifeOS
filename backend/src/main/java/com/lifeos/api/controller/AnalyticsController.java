package com.lifeos.api.controller;

import com.lifeos.api.model.*;
import com.lifeos.api.security.UserDetailsImpl;
import com.lifeos.api.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.*;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    private UserService userService;

    @Autowired
    private NoteService noteService;

    @Autowired
    private DocumentService documentService;

    @Autowired
    private TaskService taskService;

    @Autowired
    private ActivityLogService activityLogService;

    private User getAuthenticatedUser(UserDetailsImpl userDetails) {
        return userService.findById(userDetails.getId()).get();
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAnalytics(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = getAuthenticatedUser(userDetails);
        Map<String, Object> data = new HashMap<>();

        // 1. Fetch data
        List<Note> notes = noteService.getActiveNotes(user);
        List<Document> documents = documentService.getUserDocuments(user);
        List<Task> tasks = taskService.getTasksForUser(user);
        List<ActivityLog> logs = activityLogService.getRecentLogs(user);

        // 2. Category Distribution (Notes & Docs combined)
        Map<String, Integer> categoryDistribution = new HashMap<>();
        for (Note note : notes) {
            String cat = note.getCategory() != null ? note.getCategory() : "Personal";
            categoryDistribution.put(cat, categoryDistribution.getOrDefault(cat, 0) + 1);
        }
        for (Document doc : documents) {
            String cat = doc.getAiCategory() != null ? doc.getAiCategory() : "Files";
            categoryDistribution.put(cat, categoryDistribution.getOrDefault(cat, 0) + 1);
        }

        // 3. Task Status/Priority Breakdown
        Map<String, Integer> taskPriorities = new HashMap<>();
        Map<String, Integer> taskStatuses = new HashMap<>();
        for (Task task : tasks) {
            String priority = task.getPriority() != null ? task.getPriority() : "MEDIUM";
            taskPriorities.put(priority, taskPriorities.getOrDefault(priority, 0) + 1);

            String status = task.getStatus() != null ? task.getStatus() : "TODO";
            taskStatuses.put(status, taskStatuses.getOrDefault(status, 0) + 1);
        }

        // 4. Note creation velocity (simulated counts over last 7 days)
        List<Map<String, Object>> noteVelocity = new ArrayList<>();
        java.time.LocalDate today = java.time.LocalDate.now();
        for (int i = 6; i >= 0; i--) {
            java.time.LocalDate date = today.minusDays(i);
            String label = date.getDayOfWeek().toString().substring(0, 3);
            
            // Count matching logs on this date
            long count = 0;
            for (ActivityLog log : logs) {
                if (log.getCreatedAt() != null) {
                    java.time.LocalDate logDate = log.getCreatedAt().toLocalDate();
                    if (logDate.equals(date) && "NOTE_CREATE".equals(log.getAction())) {
                        count++;
                    }
                }
            }
            Map<String, Object> point = new HashMap<>();
            point.put("day", label);
            point.put("count", count);
            noteVelocity.add(point);
        }

        // 5. Weekly Productivity Score trend (calculated from user's daily activity logs)
        List<Integer> productivityTrend = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            java.time.LocalDate date = today.minusDays(i);
            long dayActions = logs.stream()
                    .filter(l -> l.getCreatedAt() != null && l.getCreatedAt().toLocalDate().equals(date))
                    .count();
            int scoreOnDate = dayActions > 0 ? Math.min(100, (int) (40 + dayActions * 15)) : 0;
            productivityTrend.add(scoreOnDate);
        }

        // Aggregate statistics
        data.put("totalNotes", notes.size());
        data.put("totalDocuments", documents.size());
        data.put("totalTasks", tasks.size());
        data.put("categoryDistribution", categoryDistribution);
        data.put("taskPriorities", taskPriorities);
        data.put("taskStatuses", taskStatuses);
        data.put("noteVelocity", noteVelocity);
        data.put("productivityTrend", productivityTrend);

        return ResponseEntity.ok(data);
    }
}
