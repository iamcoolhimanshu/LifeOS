package com.lifeos.api.service;

import com.lifeos.api.model.ActivityLog;
import com.lifeos.api.model.User;
import com.lifeos.api.repository.ActivityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class ActivityLogService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Transactional
    public void logActivity(User user, String action, String details) {
        ActivityLog log = new ActivityLog(user, action, details);
        activityLogRepository.save(log);
    }

    public List<ActivityLog> getRecentLogs(User user) {
        return activityLogRepository.findTop20ByUserOrderByCreatedAtDesc(user);
    }
}
