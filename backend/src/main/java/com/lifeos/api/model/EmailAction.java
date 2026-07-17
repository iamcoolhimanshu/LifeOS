package com.lifeos.api.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "email_actions")
public class EmailAction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "email_message_id", nullable = false)
    private EmailMessage emailMessage;

    @Column(name = "action_type", nullable = false, length = 50)
    private String actionType; // CREATE_TASK, CREATE_CALENDAR_EVENT, CREATE_CAREER_INTERVIEW, SAVE_DOCUMENT, etc.

    @Column(name = "action_title", nullable = false)
    private String actionTitle;

    @Column(name = "action_description", length = 1000)
    private String actionDescription;

    @Lob
    @Column(name = "action_payload", columnDefinition = "LONGTEXT")
    private String actionPayload; // JSON string payload representing data for action execution

    @Column(nullable = false, length = 20)
    private String status = "SUGGESTED"; // SUGGESTED, APPROVED, REJECTED, EXECUTED, FAILED

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "executed_at")
    private LocalDateTime executedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public EmailAction() {}

    public EmailAction(EmailMessage emailMessage, String actionType, String actionTitle, String actionDescription, String actionPayload) {
        this.emailMessage = emailMessage;
        this.actionType = actionType;
        this.actionTitle = actionTitle;
        this.actionDescription = actionDescription;
        this.actionPayload = actionPayload;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public EmailMessage getEmailMessage() { return emailMessage; }
    public void setEmailMessage(EmailMessage emailMessage) { this.emailMessage = emailMessage; }

    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }

    public String getActionTitle() { return actionTitle; }
    public void setActionTitle(String actionTitle) { this.actionTitle = actionTitle; }

    public String getActionDescription() { return actionDescription; }
    public void setActionDescription(String actionDescription) { this.actionDescription = actionDescription; }

    public String getActionPayload() { return actionPayload; }
    public void setActionPayload(String actionPayload) { this.actionPayload = actionPayload; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }

    public LocalDateTime getExecutedAt() { return executedAt; }
    public void setExecutedAt(LocalDateTime executedAt) { this.executedAt = executedAt; }
}
