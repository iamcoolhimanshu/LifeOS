package com.lifeos.api.repository;

import com.lifeos.api.model.EmailAction;
import com.lifeos.api.model.EmailMessage;
import com.lifeos.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EmailActionRepository extends JpaRepository<EmailAction, Long> {
    List<EmailAction> findByEmailMessage(EmailMessage emailMessage);

    @Query("SELECT ea FROM EmailAction ea JOIN ea.emailMessage em WHERE em.user = :user AND ea.status = 'SUGGESTED' ORDER BY ea.createdAt DESC")
    List<EmailAction> findSuggestedActionsByUser(@Param("user") User user);
}
