package com.lifeos.api.repository;

import com.lifeos.api.model.Event;
import com.lifeos.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByUserOrderByStartTimeAsc(User user);
    
    List<Event> findByUserAndStartTimeBetweenOrderByStartTimeAsc(User user, LocalDateTime start, LocalDateTime end);

    @Query("SELECT e FROM Event e WHERE e.user = :user AND " +
           "(e.title LIKE CONCAT('%', :query, '%') OR " +
           "e.description LIKE CONCAT('%', :query, '%') OR " +
           "e.category LIKE CONCAT('%', :query, '%'))")
    List<Event> searchEvents(@Param("user") User user, @Param("query") String query);
}
