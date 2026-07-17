package com.lifeos.api.repository;

import com.lifeos.api.model.EmailAttachment;
import com.lifeos.api.model.EmailMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EmailAttachmentRepository extends JpaRepository<EmailAttachment, Long> {
    List<EmailAttachment> findByEmailMessage(EmailMessage emailMessage);
}
