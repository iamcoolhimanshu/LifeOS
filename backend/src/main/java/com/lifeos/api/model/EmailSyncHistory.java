package com.lifeos.api.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "email_sync_histories")
public class EmailSyncHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "connected_account_id", nullable = false)
    private ConnectedEmailAccount connectedEmailAccount;

    @Column(name = "sync_type")
    private String syncType; // e.g. INITIAL, INCREMENTAL

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(nullable = false, length = 20)
    private String status; // STARTED, COMPLETED, FAILED, PARTIAL

    @Column(name = "messages_processed")
    private Integer messagesProcessed = 0;

    @Column(name = "messages_created")
    private Integer messagesCreated = 0;

    @Column(name = "messages_updated")
    private Integer messagesUpdated = 0;

    @Column(name = "error_message", length = 1000)
    private String errorMessage;

    public EmailSyncHistory() {}

    public EmailSyncHistory(ConnectedEmailAccount connectedEmailAccount, String syncType, LocalDateTime startedAt, String status) {
        this.connectedEmailAccount = connectedEmailAccount;
        this.syncType = syncType;
        this.startedAt = startedAt;
        this.status = status;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ConnectedEmailAccount getConnectedEmailAccount() { return connectedEmailAccount; }
    public void setConnectedEmailAccount(ConnectedEmailAccount connectedEmailAccount) { this.connectedEmailAccount = connectedEmailAccount; }

    public String getSyncType() { return syncType; }
    public void setSyncType(String syncType) { this.syncType = syncType; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getMessagesProcessed() { return messagesProcessed; }
    public void setMessagesProcessed(Integer messagesProcessed) { this.messagesProcessed = messagesProcessed; }

    public Integer getMessagesCreated() { return messagesCreated; }
    public void setMessagesCreated(Integer messagesCreated) { this.messagesCreated = messagesCreated; }

    public Integer getMessagesUpdated() { return messagesUpdated; }
    public void setMessagesUpdated(Integer messagesUpdated) { this.messagesUpdated = messagesUpdated; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
}
