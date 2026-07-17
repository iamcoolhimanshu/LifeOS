package com.lifeos.api.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public class JobApplicationDTO {
    @NotBlank
    private String company;

    @NotBlank
    private String role;

    private String status;
    private String salary;
    private String url;
    private String notes;
    private LocalDate appliedDate;

    // Getters and Setters
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getSalary() { return salary; }
    public void setSalary(String salary) { this.salary = salary; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDate getAppliedDate() { return appliedDate; }
    public void setAppliedDate(LocalDate appliedDate) { this.appliedDate = appliedDate; }
}
