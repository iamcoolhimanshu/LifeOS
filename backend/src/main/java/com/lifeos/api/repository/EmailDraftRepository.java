package com.lifeos.api.repository;

import com.lifeos.api.model.EmailDraft;
import com.lifeos.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EmailDraftRepository extends JpaRepository<EmailDraft, Long> {
    List<EmailDraft> findByUserOrderByUpdatedAtDesc(User user);
}
