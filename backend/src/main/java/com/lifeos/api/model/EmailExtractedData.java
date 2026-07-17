package com.lifeos.api.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "email_extracted_data")
public class EmailExtractedData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "email_message_id", nullable = false)
    private EmailMessage emailMessage;

    @Column(name = "field_name", nullable = false)
    private String fieldName; // e.g. companyName, interviewDate, amount, dueDate

    @Column(name = "field_type")
    private String fieldType; // e.g. TEXT, DATE, NUMBER, CURRENCY

    @Column(name = "field_value", length = 1000)
    private String fieldValue;

    @Column(name = "confidence_score")
    private Double confidenceScore;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public EmailExtractedData() {}

    public EmailExtractedData(EmailMessage emailMessage, String fieldName, String fieldType, String fieldValue, Double confidenceScore) {
        this.emailMessage = emailMessage;
        this.fieldName = fieldName;
        this.fieldType = fieldType;
        this.fieldValue = fieldValue;
        this.confidenceScore = confidenceScore;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public EmailMessage getEmailMessage() { return emailMessage; }
    public void setEmailMessage(EmailMessage emailMessage) { this.emailMessage = emailMessage; }

    public String getFieldName() { return fieldName; }
    public void setFieldName(String fieldName) { this.fieldName = fieldName; }

    public String getFieldType() { return fieldType; }
    public void setFieldType(String fieldType) { this.fieldType = fieldType; }

    public String getFieldValue() { return fieldValue; }
    public void setFieldValue(String fieldValue) { this.fieldValue = fieldValue; }

    public Double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
