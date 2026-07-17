package com.lifeos.api.repository;

import com.lifeos.api.model.Task;
import com.lifeos.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUserOrderByDueDateAsc(User user);
    
    List<Task> findByUserAndStatusOrderByDueDateAsc(User user, String status);

    @Query("SELECT t FROM Task t WHERE t.user = :user AND " +
           "(t.title LIKE CONCAT('%', :query, '%') OR " +
           "t.description LIKE CONCAT('%', :query, '%') OR " +
           "t.category LIKE CONCAT('%', :query, '%'))")
    List<Task> searchTasks(@Param("user") User user, @Param("query") String query);
}
