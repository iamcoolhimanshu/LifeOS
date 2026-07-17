package com.lifeos.api.controller;

import com.lifeos.api.dto.JobApplicationDTO;
import com.lifeos.api.dto.MessageResponse;
import com.lifeos.api.model.JobApplication;
import com.lifeos.api.model.User;
import com.lifeos.api.security.UserDetailsImpl;
import com.lifeos.api.service.ActivityLogService;
import com.lifeos.api.service.JobApplicationService;
import com.lifeos.api.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/careers")
public class JobApplicationController {
    @Autowired
    private JobApplicationService jobApplicationService;

    @Autowired
    private UserService userService;

    @Autowired
    private ActivityLogService activityLogService;

    private User getAuthenticatedUser(UserDetailsImpl userDetails) {
        return userService.findById(userDetails.getId()).get();
    }

    @GetMapping
    public ResponseEntity<List<JobApplication>> getApplications(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = getAuthenticatedUser(userDetails);
        return ResponseEntity.ok(jobApplicationService.getApplicationsForUser(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobApplication> getApplicationById(@AuthenticationPrincipal UserDetailsImpl userDetails, @PathVariable Long id) {
        User user = getAuthenticatedUser(userDetails);
        return ResponseEntity.ok(jobApplicationService.getApplicationForUser(user, id));
    }

    @PostMapping
    public ResponseEntity<JobApplication> createApplication(@AuthenticationPrincipal UserDetailsImpl userDetails, @Valid @RequestBody JobApplicationDTO dto) {
        User user = getAuthenticatedUser(userDetails);
        JobApplication jobApplication = jobApplicationService.createApplication(
                user,
                dto.getCompany(),
                dto.getRole(),
                dto.getStatus(),
                dto.getSalary(),
                dto.getUrl(),
                dto.getNotes(),
                dto.getAppliedDate()
        );
        activityLogService.logActivity(user, "CAREER_CREATE", "Added job application: " + jobApplication.getRole() + " at " + jobApplication.getCompany());
        return ResponseEntity.ok(jobApplication);
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobApplication> updateApplication(@AuthenticationPrincipal UserDetailsImpl userDetails, @PathVariable Long id, @Valid @RequestBody JobApplicationDTO dto) {
        User user = getAuthenticatedUser(userDetails);
        JobApplication jobApplication = jobApplicationService.updateApplication(
                user,
                id,
                dto.getCompany(),
                dto.getRole(),
                dto.getStatus(),
                dto.getSalary(),
                dto.getUrl(),
                dto.getNotes(),
                dto.getAppliedDate()
        );
        activityLogService.logActivity(user, "CAREER_UPDATE", "Updated job application: " + jobApplication.getRole() + " at " + jobApplication.getCompany() + " (status: " + jobApplication.getStatus() + ")");
        return ResponseEntity.ok(jobApplication);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteApplication(@AuthenticationPrincipal UserDetailsImpl userDetails, @PathVariable Long id) {
        User user = getAuthenticatedUser(userDetails);
        JobApplication jobApplication = jobApplicationService.getApplicationForUser(user, id);
        jobApplicationService.deleteApplication(user, id);
        activityLogService.logActivity(user, "CAREER_DELETE", "Deleted job application: " + jobApplication.getRole() + " at " + jobApplication.getCompany());
        return ResponseEntity.ok(new MessageResponse("Job application deleted successfully."));
    }
}
