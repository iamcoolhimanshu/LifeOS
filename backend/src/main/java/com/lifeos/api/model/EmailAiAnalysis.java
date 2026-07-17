package com.lifeos.api.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "email_ai_analyses")
public class EmailAiAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "email_message_id", nullable = false)
    private EmailMessage emailMessage;

    @Column(length = 50)
    private String category; // e.g. IMPORTANT, CAREER, FINANCE, BILL, INTERVIEW, TRAVEL, LEARNING, PERSONAL

    @Column(name = "importance_score")
    private Double importanceScore;

    @Column(name = "confidence_score")
    private Double confidenceScore;

    @Column(length = 2000)
    private String summary;

    @Column(name = "requires_action", nullable = false)
    private Boolean requiresAction = false;

    @Column(name = "suggested_action")
    private String suggestedAction;

    @Column(name = "detected_intent")
    private String detectedIntent;

    @Column(name = "processed_at", nullable = false)
    private LocalDateTime processedAt;

    @PrePersist
    protected void onCreate() {
        processedAt = LocalDateTime.now();
    }

    public EmailAiAnalysis() {}

    public EmailAiAnalysis(EmailMessage emailMessage, String category, Double importanceScore, Double confidenceScore, String summary) {
        this.emailMessage = emailMessage;
        this.category = category;
        this.importanceScore = importanceScore;
        this.confidenceScore = confidenceScore;
        this.summary = summary;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public EmailMessage getEmailMessage() { return emailMessage; }
    public void setEmailMessage(EmailMessage emailMessage) { this.emailMessage = emailMessage; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Double getImportanceScore() { return importanceScore; }
    public void setImportanceScore(Double importanceScore) { this.importanceScore = importanceScore; }

    public Double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public Boolean getRequiresAction() { return requiresAction; }
    public void setRequiresAction(Boolean requiresAction) { this.requiresAction = requiresAction; }

    public String getSuggestedAction() { return suggestedAction; }
    public void setSuggestedAction(String suggestedAction) { this.suggestedAction = suggestedAction; }

    public String getDetectedIntent() { return detectedIntent; }
    public void setDetectedIntent(String detectedIntent) { this.detectedIntent = detectedIntent; }

    public LocalDateTime getProcessedAt() { return processedAt; }
    public void setProcessedAt(LocalDateTime processedAt) { this.processedAt = processedAt; }
}
