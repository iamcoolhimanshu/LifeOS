package com.lifeos.api.repository;

import com.lifeos.api.model.Document;
import com.lifeos.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    
    List<Document> findByUserOrderByCreatedAtDesc(User user);
    
    List<Document> findTop5ByUserOrderByCreatedAtDesc(User user);

    @Query("SELECT d FROM Document d WHERE d.user = :user AND " +
           "(d.fileName LIKE CONCAT('%', :query, '%') OR " +
           "d.extractedText LIKE CONCAT('%', :query, '%') OR " +
           "d.aiSummary LIKE CONCAT('%', :query, '%') OR " +
           "d.aiCategory LIKE CONCAT('%', :query, '%') OR " +
           "d.aiTags LIKE CONCAT('%', :query, '%'))")
    List<Document> searchDocuments(@Param("user") User user, @Param("query") String query);
}
