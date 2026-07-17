package com.lifeos.api.repository;

import com.lifeos.api.model.JobApplication;
import com.lifeos.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findByUserOrderByAppliedDateDesc(User user);

    @Query("SELECT j FROM JobApplication j WHERE j.user = :user AND " +
           "(j.company LIKE CONCAT('%', :query, '%') OR " +
           "j.role LIKE CONCAT('%', :query, '%') OR " +
           "j.notes LIKE CONCAT('%', :query, '%'))")
    List<JobApplication> searchCareers(@Param("user") User user, @Param("query") String query);
}
