package com.lifeos.api.repository;

import com.lifeos.api.model.EmailSyncHistory;
import com.lifeos.api.model.ConnectedEmailAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EmailSyncHistoryRepository extends JpaRepository<EmailSyncHistory, Long> {
    List<EmailSyncHistory> findByConnectedEmailAccountOrderByStartedAtDesc(ConnectedEmailAccount account);
}
