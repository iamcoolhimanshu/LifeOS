package com.lifeos.api.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "email_drafts")
public class EmailDraft {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "email_message_id")
    private EmailMessage emailMessage; // optional reference to source email

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(length = 500)
    private String subject;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String body;

    @Column(name = "ai_generated", nullable = false)
    private Boolean aiGenerated = false;

    @Column(nullable = false, length = 20)
    private String status = "DRAFT"; // DRAFT, APPROVED, SENT, DISCARDED

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
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

    public EmailDraft() {}

    public EmailDraft(EmailMessage emailMessage, User user, String subject, String body, Boolean aiGenerated) {
        this.emailMessage = emailMessage;
        this.user = user;
        this.subject = subject;
        this.body = body;
        this.aiGenerated = aiGenerated;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public EmailMessage getEmailMessage() { return emailMessage; }
    public void setEmailMessage(EmailMessage emailMessage) { this.emailMessage = emailMessage; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }

    public Boolean getAiGenerated() { return aiGenerated; }
    public void setAiGenerated(Boolean aiGenerated) { this.aiGenerated = aiGenerated; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
