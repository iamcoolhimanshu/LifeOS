package com.lifeos.api.controller;

import com.lifeos.api.dto.LearningDTO;
import com.lifeos.api.dto.MessageResponse;
import com.lifeos.api.model.Learning;
import com.lifeos.api.model.User;
import com.lifeos.api.security.UserDetailsImpl;
import com.lifeos.api.service.ActivityLogService;
import com.lifeos.api.service.LearningService;
import com.lifeos.api.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/learnings")
public class LearningController {
    @Autowired
    private LearningService learningService;

    @Autowired
    private UserService userService;

    @Autowired
    private ActivityLogService activityLogService;

    private User getAuthenticatedUser(UserDetailsImpl userDetails) {
        return userService.findById(userDetails.getId()).get();
    }

    @GetMapping
    public ResponseEntity<List<Learning>> getLearnings(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = getAuthenticatedUser(userDetails);
        return ResponseEntity.ok(learningService.getLearningsForUser(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Learning> getLearningById(@AuthenticationPrincipal UserDetailsImpl userDetails, @PathVariable Long id) {
        User user = getAuthenticatedUser(userDetails);
        return ResponseEntity.ok(learningService.getLearningForUser(user, id));
    }

    @PostMapping
    public ResponseEntity<Learning> createLearning(@AuthenticationPrincipal UserDetailsImpl userDetails, @Valid @RequestBody LearningDTO learningDTO) {
        User user = getAuthenticatedUser(userDetails);
        Learning learning = learningService.createLearning(
                user,
                learningDTO.getTopic(),
                learningDTO.getSource(),
                learningDTO.getStatus(),
                learningDTO.getProgress(),
                learningDTO.getNotes()
        );
        activityLogService.logActivity(user, "LEARNING_CREATE", "Added study topic: " + learning.getTopic());
        return ResponseEntity.ok(learning);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Learning> updateLearning(@AuthenticationPrincipal UserDetailsImpl userDetails, @PathVariable Long id, @Valid @RequestBody LearningDTO learningDTO) {
        User user = getAuthenticatedUser(userDetails);
        Learning learning = learningService.updateLearning(
                user,
                id,
                learningDTO.getTopic(),
                learningDTO.getSource(),
                learningDTO.getStatus(),
                learningDTO.getProgress(),
                learningDTO.getNotes()
        );
        activityLogService.logActivity(user, "LEARNING_UPDATE", "Updated study topic: " + learning.getTopic() + " (" + learning.getProgress() + "%)");
        return ResponseEntity.ok(learning);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLearning(@AuthenticationPrincipal UserDetailsImpl userDetails, @PathVariable Long id) {
        User user = getAuthenticatedUser(userDetails);
        Learning learning = learningService.getLearningForUser(user, id);
        learningService.deleteLearning(user, id);
        activityLogService.logActivity(user, "LEARNING_DELETE", "Deleted study topic: " + learning.getTopic());
        return ResponseEntity.ok(new MessageResponse("Learning item deleted successfully."));
    }
}
