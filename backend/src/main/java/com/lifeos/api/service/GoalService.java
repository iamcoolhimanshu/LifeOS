package com.lifeos.api.service;

import com.lifeos.api.model.Goal;
import com.lifeos.api.model.User;
import com.lifeos.api.repository.GoalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class GoalService {
    @Autowired
    private GoalRepository goalRepository;

    public List<Goal> getGoalsForUser(User user) {
        return goalRepository.findByUserOrderByTargetDateAsc(user);
    }

    public Goal getGoalForUser(User user, Long id) {
        return goalRepository.findById(id)
                .filter(g -> g.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Goal not found or access denied"));
    }

    public Goal createGoal(User user, String title, String description, LocalDate targetDate, int progress, String status, String category) {
        Goal goal = new Goal(user, title, description, targetDate, progress, status, category);
        return goalRepository.save(goal);
    }

    public Goal updateGoal(User user, Long id, String title, String description, LocalDate targetDate, int progress, String status, String category) {
        Goal goal = getGoalForUser(user, id);
        goal.setTitle(title);
        goal.setDescription(description);
        goal.setTargetDate(targetDate);
        goal.setProgress(progress);
        goal.setStatus(status);
        goal.setCategory(category);
        return goalRepository.save(goal);
    }

    public void deleteGoal(User user, Long id) {
        Goal goal = getGoalForUser(user, id);
        goalRepository.delete(goal);
    }
}
