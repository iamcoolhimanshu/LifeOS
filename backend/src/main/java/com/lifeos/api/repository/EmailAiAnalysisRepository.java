package com.lifeos.api.repository;

import com.lifeos.api.model.EmailAiAnalysis;
import com.lifeos.api.model.EmailMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface EmailAiAnalysisRepository extends JpaRepository<EmailAiAnalysis, Long> {
    Optional<EmailAiAnalysis> findByEmailMessage(EmailMessage emailMessage);
}
