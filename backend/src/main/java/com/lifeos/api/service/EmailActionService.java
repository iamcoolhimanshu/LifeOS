package com.lifeos.api.service;

import com.lifeos.api.model.*;
import com.lifeos.api.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class EmailActionService {

    private static final Logger logger = LoggerFactory.getLogger(EmailActionService.class);

    @Autowired
    private EmailActionRepository emailActionRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    @Transactional
    public void approveAction(Long actionId, User user) {
        EmailAction action = emailActionRepository.findById(actionId)
                .orElseThrow(() -> new IllegalArgumentException("Action not found"));

        // Resource ownership check
        if (!action.getEmailMessage().getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized action approval");
        }

        if (!"SUGGESTED".equalsIgnoreCase(action.getStatus())) {
            throw new IllegalStateException("Action has already been processed: " + action.getStatus());
        }

        try {
            executeAction(action, user);
            action.setStatus("EXECUTED");
            action.setApprovedAt(LocalDateTime.now());
            action.setExecutedAt(LocalDateTime.now());
            emailActionRepository.save(action);
        } catch (Exception e) {
            logger.error("Failed to execute email action id {}: {}", actionId, e.getMessage(), e);
            action.setStatus("FAILED");
            emailActionRepository.save(action);
            throw new RuntimeException("Action execution failed: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void rejectAction(Long actionId, User user) {
        EmailAction action = emailActionRepository.findById(actionId)
                .orElseThrow(() -> new IllegalArgumentException("Action not found"));

        if (!action.getEmailMessage().getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized action rejection");
        }

        if (!"SUGGESTED".equalsIgnoreCase(action.getStatus())) {
            throw new IllegalStateException("Action has already been processed");
        }

        action.setStatus("REJECTED");
        emailActionRepository.save(action);
    }

    private void executeAction(EmailAction action, User user) throws Exception {
        Map<String, String> payload = parsePayload(action.getActionPayload());
        String type = action.getActionType();

        if ("CREATE_TASK".equalsIgnoreCase(type)) {
            String title = payload.getOrDefault("title", action.getActionTitle());
            String desc = payload.getOrDefault("description", action.getActionDescription());
            String dueStr = payload.get("dueDate");
            LocalDateTime dueDate = dueStr != null ? LocalDateTime.parse(dueStr + "T00:00:00") : LocalDateTime.now().plusDays(1);

            Task task = new Task(user, title, desc, dueDate, "HIGH", "TODO", "Email Action");
            taskRepository.save(task);
            logger.info("Executed CREATE_TASK for user: {}", user.getUsername());

        } else if ("CREATE_CALENDAR_EVENT".equalsIgnoreCase(type) || "CREATE_CAREER_INTERVIEW".equalsIgnoreCase(type)) {
            if ("CREATE_CAREER_INTERVIEW".equalsIgnoreCase(type)) {
                String company = payload.getOrDefault("company", "Unknown Company");
                String role = payload.getOrDefault("role", "Software Engineer");
                String dateStr = payload.getOrDefault("date", LocalDate.now().toString());
                LocalDate date = LocalDate.parse(dateStr);

                JobApplication app = new JobApplication(user, company, role, "INTERVIEWING", null, null, action.getActionDescription(), date);
                jobApplicationRepository.save(app);
                logger.info("Executed CREATE_CAREER_INTERVIEW for company: {}", company);
            }

            // Also create a Calendar Event to reflect the interview slot on the calendar!
            String title = payload.getOrDefault("title", action.getActionTitle());
            String dateStr = payload.getOrDefault("date", LocalDate.now().toString());
            String timeStr = payload.getOrDefault("time", "14:00");
            
            LocalDateTime start = LocalDateTime.parse(dateStr + "T" + timeStr + ":00");
            LocalDateTime end = start.plusHours(1);

            Event event = new Event(user, title, action.getActionDescription(), start, end, false, "#a855f7", "Interview");
            eventRepository.save(event);
            logger.info("Executed CREATE_CALENDAR_EVENT: {}", title);
        } else {
            throw new UnsupportedOperationException("Action type not supported yet: " + type);
        }
    }

    private Map<String, String> parsePayload(String json) {
        Map<String, String> map = new HashMap<>();
        if (json == null || json.trim().isEmpty() || "{}".equals(json)) return map;
        
        String clean = json.trim().replace("{", "").replace("}", "");
        String[] pairs = clean.split(",");
        for (String pair : pairs) {
            String[] parts = pair.split(":");
            if (parts.length >= 2) {
                String k = parts[0].trim().replace("\"", "");
                String v = parts[1].trim().replace("\"", "");
                map.put(k, v);
            }
        }
        return map;
    }
}
