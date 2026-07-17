package com.lifeos.api.controller;

import com.lifeos.api.model.User;
import com.lifeos.api.security.UserDetailsImpl;
import com.lifeos.api.service.UserService;
import com.lifeos.api.service.ActivityLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    @Autowired
    private UserService userService;

    @Autowired
    private ActivityLogService activityLogService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // In-memory mock store for AI Memories: key = userId, value = list of memory strings
    private static final Map<Long, List<String>> aiMemoriesStore = new HashMap<>();

    // In-memory mock store for active devices: key = userId, value = list of device maps
    private static final Map<Long, List<Map<String, String>>> activeDevicesStore = new HashMap<>();

    private User getAuthenticatedUser(UserDetailsImpl userDetails) {
        return userService.findById(userDetails.getId()).get();
    }

    private void initializeMockDataIfAbsent(Long userId) {
        if (!aiMemoriesStore.containsKey(userId)) {
            List<String> memories = new ArrayList<>(Arrays.asList(
                "Himanshu prefers a curated Light Mode theme interface",
                "Himanshu works as a Software Engineer utilizing Java and React stacks",
                "Himanshu tracks AWS compute monthly subscription bills in Finance logs",
                "Himanshu schedules team standups on Wednesday mornings"
            ));
            aiMemoriesStore.put(userId, memories);
        }

        if (!activeDevicesStore.containsKey(userId)) {
            List<Map<String, String>> devices = new ArrayList<>();
            
            Map<String, String> dev1 = new HashMap<>();
            dev1.put("id", "dev_1");
            dev1.put("name", "Windows Desktop Client (Current)");
            dev1.put("ip", "192.168.1.45");
            dev1.put("lastActive", "Active now");
            devices.add(dev1);

            Map<String, String> dev2 = new HashMap<>();
            dev2.put("id", "dev_2");
            dev2.put("name", "iPhone 15 Pro Max Mobile");
            dev2.put("ip", "10.0.0.8");
            dev2.put("lastActive", "12 hours ago");
            devices.add(dev2);

            Map<String, String> dev3 = new HashMap<>();
            dev3.put("id", "dev_3");
            dev3.put("name", "Chrome Browser Clipper Extension");
            dev3.put("ip", "192.168.1.45");
            dev3.put("lastActive", "3 days ago");
            devices.add(dev3);

            activeDevicesStore.put(userId, devices);
        }
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getSettings(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = getAuthenticatedUser(userDetails);
        Long userId = user.getId();
        initializeMockDataIfAbsent(userId);

        Map<String, Object> data = new HashMap<>();
        
        // Profile
        Map<String, String> profile = new HashMap<>();
        profile.put("username", user.getUsername());
        profile.put("email", user.getEmail());
        profile.put("bio", "LifeOS user organizing tasks, goals and notes.");
        data.put("profile", profile);

        // AI Personalization
        Map<String, Object> aiConfig = new HashMap<>();
        aiConfig.put("aiTone", "Professional & Insightful");
        aiConfig.put("autoExtractTasks", true);
        aiConfig.put("aiFocusArea", "Software Development");
        data.put("aiPersonalization", aiConfig);

        // AI Memories list
        data.put("aiMemories", aiMemoriesStore.get(userId));

        // Active Devices list
        data.put("activeDevices", activeDevicesStore.get(userId));

        // Notification preferences
        Map<String, Object> notifications = new HashMap<>();
        notifications.put("emailSummaries", true);
        notifications.put("pushAlerts", false);
        notifications.put("smsReminders", true);
        data.put("notifications", notifications);

        // Privacy toggles
        Map<String, Object> privacy = new HashMap<>();
        privacy.put("allowNoteAnalysis", true);
        privacy.put("allowSearchIndexing", true);
        privacy.put("telemetryLevel", "Basic");
        data.put("privacy", privacy);

        return ResponseEntity.ok(data);
    }

    @PostMapping("/profile")
    public ResponseEntity<Map<String, String>> updateProfile(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Map<String, String> body) {
        User user = getAuthenticatedUser(userDetails);
        
        activityLogService.logActivity(user, "SETTINGS_UPDATE", "Updated profile settings configuration.");
        return ResponseEntity.ok(Map.of("message", "Profile updated successfully!"));
    }

    @DeleteMapping("/memory")
    public ResponseEntity<Map<String, Object>> deleteMemory(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam("index") int index) {
        User user = getAuthenticatedUser(userDetails);
        Long userId = user.getId();
        initializeMockDataIfAbsent(userId);

        List<String> memories = aiMemoriesStore.get(userId);
        if (index >= 0 && index < memories.size()) {
            String removed = memories.remove(index);
            activityLogService.logActivity(user, "AI_MEMORY_DELETE", "AI forgot learned fact: " + removed);
            return ResponseEntity.ok(Map.of("message", "AI successfully forgot this fact.", "aiMemories", memories));
        }

        return ResponseEntity.badRequest().body(Map.of("message", "Invalid memory index"));
    }

    @DeleteMapping("/device")
    public ResponseEntity<Map<String, Object>> revokeDevice(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam("deviceId") String deviceId) {
        User user = getAuthenticatedUser(userDetails);
        Long userId = user.getId();
        initializeMockDataIfAbsent(userId);

        List<Map<String, String>> devices = activeDevicesStore.get(userId);
        devices.removeIf(d -> deviceId.equals(d.get("id")));

        activityLogService.logActivity(user, "DEVICE_REVOKE", "Revoked session access for device id: " + deviceId);
        return ResponseEntity.ok(Map.of("message", "Device session revoked successfully.", "activeDevices", devices));
    }
}
