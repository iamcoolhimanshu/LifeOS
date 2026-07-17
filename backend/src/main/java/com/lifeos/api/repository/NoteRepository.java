package com.lifeos.api.repository;

import com.lifeos.api.model.Note;
import com.lifeos.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    
    List<Note> findByUserAndArchivedFalseOrderByPinnedDescUpdatedAtDesc(User user);
    
    List<Note> findByUserAndArchivedTrueOrderByUpdatedAtDesc(User user);
    
    List<Note> findByUserAndFavoriteTrueAndArchivedFalseOrderByUpdatedAtDesc(User user);
    
    List<Note> findTop5ByUserAndArchivedFalseOrderByUpdatedAtDesc(User user);

    @Query("SELECT n FROM Note n WHERE n.user = :user AND n.archived = false AND " +
           "(n.title LIKE CONCAT('%', :query, '%') OR " +
           "n.content LIKE CONCAT('%', :query, '%') OR " +
           "n.category LIKE CONCAT('%', :query, '%') OR " +
           "n.tags LIKE CONCAT('%', :query, '%'))")
    List<Note> searchNotes(@Param("user") User user, @Param("query") String query);
}
