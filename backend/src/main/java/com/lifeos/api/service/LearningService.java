package com.lifeos.api.service;

import com.lifeos.api.model.Learning;
import com.lifeos.api.model.User;
import com.lifeos.api.repository.LearningRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class LearningService {
    @Autowired
    private LearningRepository learningRepository;

    public List<Learning> getLearningsForUser(User user) {
        return learningRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public Learning getLearningForUser(User user, Long id) {
        return learningRepository.findById(id)
                .filter(l -> l.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Learning item not found or access denied"));
    }

    public Learning createLearning(User user, String topic, String source, String status, int progress, String notes) {
        Learning learning = new Learning(user, topic, source, status, progress, notes);
        return learningRepository.save(learning);
    }

    public Learning updateLearning(User user, Long id, String topic, String source, String status, int progress, String notes) {
        Learning learning = getLearningForUser(user, id);
        learning.setTopic(topic);
        learning.setSource(source);
        learning.setStatus(status);
        learning.setProgress(progress);
        learning.setNotes(notes);
        return learningRepository.save(learning);
    }

    public void deleteLearning(User user, Long id) {
        Learning learning = getLearningForUser(user, id);
        learningRepository.delete(learning);
    }
}
