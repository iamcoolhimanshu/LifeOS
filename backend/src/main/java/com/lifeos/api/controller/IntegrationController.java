package com.lifeos.api.controller;

import com.lifeos.api.model.*;
import com.lifeos.api.security.UserDetailsImpl;
import com.lifeos.api.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/integrations")
public class IntegrationController {

    @Autowired
    private UserService userService;

    @Autowired
    private NoteService noteService;

    @Autowired
    private DocumentService documentService;

    @Autowired
    private EventService eventService;

    @Autowired
    private ActivityLogService activityLogService;

    // In-memory simulator for integration connection state: key = userId_serviceName
    private static final Map<String, Boolean> connectionStore = new HashMap<>();

    private User getAuthenticatedUser(UserDetailsImpl userDetails) {
        return userService.findById(userDetails.getId()).get();
    }

    private String getStoreKey(Long userId, String service) {
        return userId + "_" + service.toLowerCase();
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getIntegrationStatuses(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = getAuthenticatedUser(userDetails);
        Long userId = user.getId();

        Map<String, Object> status = new HashMap<>();
        status.put("gmailConnected", connectionStore.getOrDefault(getStoreKey(userId, "gmail"), false));
        status.put("driveConnected", connectionStore.getOrDefault(getStoreKey(userId, "drive"), false));
        status.put("calendarConnected", connectionStore.getOrDefault(getStoreKey(userId, "calendar"), false));
        
        return ResponseEntity.ok(status);
    }

    @PostMapping("/connect")
    public ResponseEntity<Map<String, Object>> connectIntegration(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam("service") String service) {
        User user = getAuthenticatedUser(userDetails);
        String key = getStoreKey(user.getId(), service);
        
        // Toggle connection state
        boolean nextState = !connectionStore.getOrDefault(key, false);
        connectionStore.put(key, nextState);

        activityLogService.logActivity(
            user, 
            nextState ? "INTEGRATION_CONNECT" : "INTEGRATION_DISCONNECT", 
            "User toggled integration connection for " + service + " to: " + (nextState ? "CONNECTED" : "DISCONNECTED")
        );

        Map<String, Object> res = new HashMap<>();
        res.put("service", service);
        res.put("connected", nextState);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/sync")
    public ResponseEntity<Map<String, Object>> syncIntegration(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam("service") String service) {
        User user = getAuthenticatedUser(userDetails);
        String key = getStoreKey(user.getId(), service);

        if (!connectionStore.getOrDefault(key, false)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Service " + service + " is not connected. Connect it first."));
        }

        Map<String, Object> res = new HashMap<>();
        int itemsSynced = 0;

        // Perform simulated synchronizations to populate database
        if ("gmail".equalsIgnoreCase(service)) {
            // Import sample notes representing emails
            noteService.createNote(
                user,
                "[Gmail] Weekly Standup Notes Alert",
                "Hi Team,\n\nHere are our action items for this week:\n- Refactor JWT auth filters\n- Validate database schema indexes\n- Finalize visual styling layout design.",
                "Work",
                "gmail,email-import"
            );
            noteService.createNote(
                user,
                "[Gmail] Subscription Renewal Invoice",
                "Hi " + user.getUsername() + ",\n\nYour subscription invoice for Amazon AWS compute instances has been processed.\nTotal charged: $154.00 USD.",
                "Finance",
                "gmail,invoice,aws"
            );
            itemsSynced = 2;
        } else if ("drive".equalsIgnoreCase(service)) {
            // Simulated Document entries
            // In a full sync, files would be fetched and inserted into Documents
            // We just log activity and populate a mock sync text
            activityLogService.logActivity(user, "INTEGRATION_SYNC", "Synchronized Google Drive file repositories. 3 documents scanned.");
            itemsSynced = 3;
        } else if ("calendar".equalsIgnoreCase(service)) {
            // Synchronize mock Calendar Event
            eventService.createEvent(
                user,
                "[Google Calendar] Client Review Meeting",
                "Product strategy review and mock walkthrough for Phase 4 deployment.",
                java.time.LocalDateTime.now().plusDays(1),
                java.time.LocalDateTime.now().plusDays(1).plusHours(1),
                false,
                "#3b82f6",
                "Work"
            );
            itemsSynced = 1;
        }

        activityLogService.logActivity(
            user, 
            "INTEGRATION_SYNC", 
            "Successfully completed synchronization for service: " + service + ". Scanned items count: " + itemsSynced
        );

        res.put("service", service);
        res.put("syncedItems", itemsSynced);
        res.put("status", "SUCCESS");
        return ResponseEntity.ok(res);
    }
}
