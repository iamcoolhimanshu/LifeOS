package com.lifeos.api.service;

import com.lifeos.api.model.JobApplication;
import com.lifeos.api.model.User;
import com.lifeos.api.repository.JobApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class JobApplicationService {
    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    public List<JobApplication> getApplicationsForUser(User user) {
        return jobApplicationRepository.findByUserOrderByAppliedDateDesc(user);
    }

    public JobApplication getApplicationForUser(User user, Long id) {
        return jobApplicationRepository.findById(id)
                .filter(j -> j.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Job application not found or access denied"));
    }

    public JobApplication createApplication(User user, String company, String role, String status, String salary, String url, String notes, LocalDate appliedDate) {
        JobApplication jobApplication = new JobApplication(user, company, role, status, salary, url, notes, appliedDate);
        return jobApplicationRepository.save(jobApplication);
    }

    public JobApplication updateApplication(User user, Long id, String company, String role, String status, String salary, String url, String notes, LocalDate appliedDate) {
        JobApplication jobApplication = getApplicationForUser(user, id);
        jobApplication.setCompany(company);
        jobApplication.setRole(role);
        jobApplication.setStatus(status);
        jobApplication.setSalary(salary);
        jobApplication.setUrl(url);
        jobApplication.setNotes(notes);
        jobApplication.setAppliedDate(appliedDate);
        return jobApplicationRepository.save(jobApplication);
    }

    public void deleteApplication(User user, Long id) {
        JobApplication jobApplication = getApplicationForUser(user, id);
        jobApplicationRepository.delete(jobApplication);
    }
}
