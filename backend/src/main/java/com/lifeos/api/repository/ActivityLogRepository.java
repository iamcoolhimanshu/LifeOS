package com.lifeos.api.repository;

import com.lifeos.api.model.ActivityLog;
import com.lifeos.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findTop20ByUserOrderByCreatedAtDesc(User user);
}
