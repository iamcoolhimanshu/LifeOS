package com.lifeos.api.repository;

import com.lifeos.api.model.EmailMessage;
import com.lifeos.api.model.User;
import com.lifeos.api.model.ConnectedEmailAccount;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmailMessageRepository extends JpaRepository<EmailMessage, Long> {
    
    Optional<EmailMessage> findByUserAndConnectedEmailAccountAndProviderMessageId(User user, ConnectedEmailAccount account, String providerMessageId);

    Page<EmailMessage> findByUser(User user, Pageable pageable);

    Page<EmailMessage> findByUserAndCategory(User user, String category, Pageable pageable);

    Page<EmailMessage> findByUserAndImportantIsTrue(User user, Pageable pageable);

    Page<EmailMessage> findByUserAndSubjectContainingIgnoreCaseOrSenderNameContainingIgnoreCaseOrSnippetContainingIgnoreCase(
            User user, String subject, String senderName, String snippet, Pageable pageable);

    List<EmailMessage> findByUserAndAiProcessedIsFalse(User user);
}
