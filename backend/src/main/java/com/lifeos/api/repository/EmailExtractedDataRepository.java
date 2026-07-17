package com.lifeos.api.repository;

import com.lifeos.api.model.EmailExtractedData;
import com.lifeos.api.model.EmailMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EmailExtractedDataRepository extends JpaRepository<EmailExtractedData, Long> {
    List<EmailExtractedData> findByEmailMessage(EmailMessage emailMessage);
}
