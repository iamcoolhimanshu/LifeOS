package com.lifeos.api.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "email_messages", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"connected_account_id", "provider_message_id"})
})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class EmailMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "connected_account_id", nullable = false)
    private ConnectedEmailAccount connectedEmailAccount;

    @Column(name = "provider_message_id", nullable = false)
    private String providerMessageId;

    @Column(name = "thread_id")
    private String threadId;

    @Column(name = "sender_name")
    private String senderName;

    @Column(name = "sender_email")
    private String senderEmail;

    @Column(name = "recipient_emails", length = 2000)
    private String recipientEmails;

    @Column(name = "cc_emails", length = 2000)
    private String ccEmails;

    @Column(length = 500)
    private String subject;

    @Column(length = 1000)
    private String snippet;

    @Lob
    @Column(name = "plain_text_body", columnDefinition = "LONGTEXT")
    private String plainTextBody;

    @Lob
    @Column(name = "html_body", columnDefinition = "LONGTEXT")
    private String htmlBody;

    @Column(name = "received_at")
    private LocalDateTime receivedAt;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "has_attachments", nullable = false)
    private Boolean hasAttachments = false;

    @Column(nullable = false)
    private Boolean important = false;

    @Column(name = "read_status", nullable = false)
    private Boolean readStatus = false;

    @Column(length = 50)
    private String category; // e.g. PERSONAL, FINANCE, CAREER, etc.

    @Column(name = "ai_processed", nullable = false)
    private Boolean aiProcessed = false;

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

    public EmailMessage() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public ConnectedEmailAccount getConnectedEmailAccount() { return connectedEmailAccount; }
    public void setConnectedEmailAccount(ConnectedEmailAccount connectedEmailAccount) { this.connectedEmailAccount = connectedEmailAccount; }

    public String getProviderMessageId() { return providerMessageId; }
    public void setProviderMessageId(String providerMessageId) { this.providerMessageId = providerMessageId; }

    public String getThreadId() { return threadId; }
    public void setThreadId(String threadId) { this.threadId = threadId; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public String getSenderEmail() { return senderEmail; }
    public void setSenderEmail(String senderEmail) { this.senderEmail = senderEmail; }

    public String getRecipientEmails() { return recipientEmails; }
    public void setRecipientEmails(String recipientEmails) { this.recipientEmails = recipientEmails; }

    public String getCcEmails() { return ccEmails; }
    public void setCcEmails(String ccEmails) { this.ccEmails = ccEmails; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getSnippet() { return snippet; }
    public void setSnippet(String snippet) { this.snippet = snippet; }

    public String getPlainTextBody() { return plainTextBody; }
    public void setPlainTextBody(String plainTextBody) { this.plainTextBody = plainTextBody; }

    public String getHtmlBody() { return htmlBody; }
    public void setHtmlBody(String htmlBody) { this.htmlBody = htmlBody; }

    public LocalDateTime getReceivedAt() { return receivedAt; }
    public void setReceivedAt(LocalDateTime receivedAt) { this.receivedAt = receivedAt; }

    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }

    public Boolean getHasAttachments() { return hasAttachments; }
    public void setHasAttachments(Boolean hasAttachments) { this.hasAttachments = hasAttachments; }

    public Boolean getImportant() { return important; }
    public void setImportant(Boolean important) { this.important = important; }

    public Boolean getReadStatus() { return readStatus; }
    public void setReadStatus(Boolean readStatus) { this.readStatus = readStatus; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Boolean getAiProcessed() { return aiProcessed; }
    public void setAiProcessed(Boolean aiProcessed) { this.aiProcessed = aiProcessed; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
