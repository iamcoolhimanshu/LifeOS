package com.lifeos.api.repository;

import com.lifeos.api.model.EmailDeliveryLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmailDeliveryLogRepository extends JpaRepository<EmailDeliveryLog, Long> {
}
