package com.lifeos.api.repository;

import com.lifeos.api.model.Learning;
import com.lifeos.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LearningRepository extends JpaRepository<Learning, Long> {
    List<Learning> findByUserOrderByCreatedAtDesc(User user);

    @Query("SELECT l FROM Learning l WHERE l.user = :user AND " +
           "(l.topic LIKE CONCAT('%', :query, '%') OR " +
           "l.source LIKE CONCAT('%', :query, '%') OR " +
           "l.notes LIKE CONCAT('%', :query, '%'))")
    List<Learning> searchLearnings(@Param("user") User user, @Param("query") String query);
}
