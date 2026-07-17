package com.lifeos.api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(min = 3, max = 50)
    @Column(unique = true, nullable = false)
    private String username;

    @NotBlank
    @Email
    @Size(max = 100)
    @Column(unique = true, nullable = false)
    private String email;

    @NotBlank
    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role = Role.USER;

    @Column(name = "email_verified", nullable = false)
    private Boolean emailVerified = false;

    @Column(name = "email_verified_at")
    private LocalDateTime emailVerifiedAt;

    @Column(name = "bio", length = 255)
    private String bio = "LifeOS user organizing tasks, goals and notes.";

    @Column(name = "ai_tone", length = 100)
    private String aiTone = "Professional & Insightful";

    @Column(name = "auto_extract_tasks")
    private Boolean autoExtractTasks = true;

    @Column(name = "ai_focus_area", length = 255)
    private String aiFocusArea = "Software Development";

    @Column(name = "email_summaries")
    private Boolean emailSummaries = true;

    @Column(name = "push_alerts")
    private Boolean pushAlerts = false;

    @Column(name = "sms_reminders")
    private Boolean smsReminders = true;

    @Column(name = "allow_note_analysis")
    private Boolean allowNoteAnalysis = true;

    @Column(name = "allow_search_indexing")
    private Boolean allowSearchIndexing = true;

    @Column(name = "telemetry_level", length = 50)
    private String telemetryLevel = "Basic";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public User() {}

    public User(String username, String email, String passwordHash, Role role) {
        this.username = username;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public Boolean getEmailVerified() { return emailVerified; }
    public void setEmailVerified(Boolean emailVerified) { this.emailVerified = emailVerified; }

    public LocalDateTime getEmailVerifiedAt() { return emailVerifiedAt; }
    public void setEmailVerifiedAt(LocalDateTime emailVerifiedAt) { this.emailVerifiedAt = emailVerifiedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getAiTone() { return aiTone; }
    public void setAiTone(String aiTone) { this.aiTone = aiTone; }

    public Boolean getAutoExtractTasks() { return autoExtractTasks; }
    public void setAutoExtractTasks(Boolean autoExtractTasks) { this.autoExtractTasks = autoExtractTasks; }

    public String getAiFocusArea() { return aiFocusArea; }
    public void setAiFocusArea(String aiFocusArea) { this.aiFocusArea = aiFocusArea; }

    public Boolean getEmailSummaries() { return emailSummaries; }
    public void setEmailSummaries(Boolean emailSummaries) { this.emailSummaries = emailSummaries; }

    public Boolean getPushAlerts() { return pushAlerts; }
    public void setPushAlerts(Boolean pushAlerts) { this.pushAlerts = pushAlerts; }

    public Boolean getSmsReminders() { return smsReminders; }
    public void setSmsReminders(Boolean smsReminders) { this.smsReminders = smsReminders; }

    public Boolean getAllowNoteAnalysis() { return allowNoteAnalysis; }
    public void setAllowNoteAnalysis(Boolean allowNoteAnalysis) { this.allowNoteAnalysis = allowNoteAnalysis; }

    public Boolean getAllowSearchIndexing() { return allowSearchIndexing; }
    public void setAllowSearchIndexing(Boolean allowSearchIndexing) { this.allowSearchIndexing = allowSearchIndexing; }

    public String getTelemetryLevel() { return telemetryLevel; }
    public void setTelemetryLevel(String telemetryLevel) { this.telemetryLevel = telemetryLevel; }
}
