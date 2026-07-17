package com.lifeos.api.repository;

import com.lifeos.api.model.Goal;
import com.lifeos.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByUserOrderByTargetDateAsc(User user);

    @Query("SELECT g FROM Goal g WHERE g.user = :user AND " +
           "(g.title LIKE CONCAT('%', :query, '%') OR " +
           "g.description LIKE CONCAT('%', :query, '%') OR " +
           "g.category LIKE CONCAT('%', :query, '%'))")
    List<Goal> searchGoals(@Param("user") User user, @Param("query") String query);
}
