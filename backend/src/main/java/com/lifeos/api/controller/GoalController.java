package com.lifeos.api.controller;

import com.lifeos.api.dto.GoalDTO;
import com.lifeos.api.dto.MessageResponse;
import com.lifeos.api.model.Goal;
import com.lifeos.api.model.User;
import com.lifeos.api.security.UserDetailsImpl;
import com.lifeos.api.service.ActivityLogService;
import com.lifeos.api.service.GoalService;
import com.lifeos.api.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/goals")
public class GoalController {
    @Autowired
    private GoalService goalService;

    @Autowired
    private UserService userService;

    @Autowired
    private ActivityLogService activityLogService;

    private User getAuthenticatedUser(UserDetailsImpl userDetails) {
        return userService.findById(userDetails.getId()).get();
    }

    @GetMapping
    public ResponseEntity<List<Goal>> getGoals(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = getAuthenticatedUser(userDetails);
        return ResponseEntity.ok(goalService.getGoalsForUser(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Goal> getGoalById(@AuthenticationPrincipal UserDetailsImpl userDetails, @PathVariable Long id) {
        User user = getAuthenticatedUser(userDetails);
        return ResponseEntity.ok(goalService.getGoalForUser(user, id));
    }

    @PostMapping
    public ResponseEntity<Goal> createGoal(@AuthenticationPrincipal UserDetailsImpl userDetails, @Valid @RequestBody GoalDTO goalDTO) {
        User user = getAuthenticatedUser(userDetails);
        Goal goal = goalService.createGoal(
                user,
                goalDTO.getTitle(),
                goalDTO.getDescription(),
                goalDTO.getTargetDate(),
                goalDTO.getProgress(),
                goalDTO.getStatus(),
                goalDTO.getCategory()
        );
        activityLogService.logActivity(user, "GOAL_CREATE", "Set new goal: " + goal.getTitle());
        return ResponseEntity.ok(goal);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Goal> updateGoal(@AuthenticationPrincipal UserDetailsImpl userDetails, @PathVariable Long id, @Valid @RequestBody GoalDTO goalDTO) {
        User user = getAuthenticatedUser(userDetails);
        Goal goal = goalService.updateGoal(
                user,
                id,
                goalDTO.getTitle(),
                goalDTO.getDescription(),
                goalDTO.getTargetDate(),
                goalDTO.getProgress(),
                goalDTO.getStatus(),
                goalDTO.getCategory()
        );
        activityLogService.logActivity(user, "GOAL_UPDATE", "Updated goal: " + goal.getTitle() + " (" + goal.getProgress() + "%)");
        return ResponseEntity.ok(goal);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGoal(@AuthenticationPrincipal UserDetailsImpl userDetails, @PathVariable Long id) {
        User user = getAuthenticatedUser(userDetails);
        Goal goal = goalService.getGoalForUser(user, id);
        goalService.deleteGoal(user, id);
        activityLogService.logActivity(user, "GOAL_DELETE", "Deleted goal: " + goal.getTitle());
        return ResponseEntity.ok(new MessageResponse("Goal deleted successfully."));
    }
}
