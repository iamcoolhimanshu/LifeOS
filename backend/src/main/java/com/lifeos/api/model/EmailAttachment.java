package com.lifeos.api.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "email_attachments")
public class EmailAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "email_message_id", nullable = false)
    private EmailMessage emailMessage;

    @Column(name = "provider_attachment_id")
    private String providerAttachmentId;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "mime_type")
    private String mimeType;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "storage_path")
    private String storagePath;

    @Lob
    @Column(name = "extracted_text", columnDefinition = "LONGTEXT")
    private String extractedText;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public EmailAttachment() {}

    public EmailAttachment(EmailMessage emailMessage, String providerAttachmentId, String fileName, String mimeType, Long fileSize) {
        this.emailMessage = emailMessage;
        this.providerAttachmentId = providerAttachmentId;
        this.fileName = fileName;
        this.mimeType = mimeType;
        this.fileSize = fileSize;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public EmailMessage getEmailMessage() { return emailMessage; }
    public void setEmailMessage(EmailMessage emailMessage) { this.emailMessage = emailMessage; }

    public String getProviderAttachmentId() { return providerAttachmentId; }
    public void setProviderAttachmentId(String providerAttachmentId) { this.providerAttachmentId = providerAttachmentId; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getMimeType() { return mimeType; }
    public void setMimeType(String mimeType) { this.mimeType = mimeType; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public String getStoragePath() { return storagePath; }
    public void setStoragePath(String storagePath) { this.storagePath = storagePath; }

    public String getExtractedText() { return extractedText; }
    public void setExtractedText(String extractedText) { this.extractedText = extractedText; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
