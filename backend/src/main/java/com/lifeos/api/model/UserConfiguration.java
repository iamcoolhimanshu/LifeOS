package com.lifeos.api.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_configurations")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class UserConfiguration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // SMTP Config
    @Column(name = "smtp_host")
    private String smtpHost;

    @Column(name = "smtp_port")
    private Integer smtpPort;

    @Column(name = "smtp_username")
    private String smtpUsername;

    @Column(name = "encrypted_smtp_password", length = 1000)
    private String encryptedSmtpPassword;

    @Column(name = "smtp_from_address")
    private String smtpFromAddress;

    @Column(name = "smtp_from_name")
    private String smtpFromName;

    // Google OAuth Config
    @Column(name = "encrypted_google_client_id", length = 1000)
    private String encryptedGoogleClientId;

    @Column(name = "encrypted_google_client_secret", length = 1000)
    private String encryptedGoogleClientSecret;

    @Column(name = "google_redirect_uri")
    private String googleRedirectUri;

    // AI Provider Config
    @Column(name = "ai_provider")
    private String aiProvider; // e.g. groq, mock

    @Column(name = "encrypted_ai_api_key", length = 1000)
    private String encryptedAiApiKey;

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

    public UserConfiguration() {}

    public UserConfiguration(User user) {
        this.user = user;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getSmtpHost() { return smtpHost; }
    public void setSmtpHost(String smtpHost) { this.smtpHost = smtpHost; }

    public Integer getSmtpPort() { return smtpPort; }
    public void setSmtpPort(Integer smtpPort) { this.smtpPort = smtpPort; }

    public String getSmtpUsername() { return smtpUsername; }
    public void setSmtpUsername(String smtpUsername) { this.smtpUsername = smtpUsername; }

    public String getEncryptedSmtpPassword() { return encryptedSmtpPassword; }
    public void setEncryptedSmtpPassword(String encryptedSmtpPassword) { this.encryptedSmtpPassword = encryptedSmtpPassword; }

    public String getSmtpFromAddress() { return smtpFromAddress; }
    public void setSmtpFromAddress(String smtpFromAddress) { this.smtpFromAddress = smtpFromAddress; }

    public String getSmtpFromName() { return smtpFromName; }
    public void setSmtpFromName(String smtpFromName) { this.smtpFromName = smtpFromName; }

    public String getEncryptedGoogleClientId() { return encryptedGoogleClientId; }
    public void setEncryptedGoogleClientId(String encryptedGoogleClientId) { this.encryptedGoogleClientId = encryptedGoogleClientId; }

    public String getEncryptedGoogleClientSecret() { return encryptedGoogleClientSecret; }
    public void setEncryptedGoogleClientSecret(String encryptedGoogleClientSecret) { this.encryptedGoogleClientSecret = encryptedGoogleClientSecret; }

    public String getGoogleRedirectUri() { return googleRedirectUri; }
    public void setGoogleRedirectUri(String googleRedirectUri) { this.googleRedirectUri = googleRedirectUri; }

    public String getAiProvider() { return aiProvider; }
    public void setAiProvider(String aiProvider) { this.aiProvider = aiProvider; }

    public String getEncryptedAiApiKey() { return encryptedAiApiKey; }
    public void setEncryptedAiApiKey(String encryptedAiApiKey) { this.encryptedAiApiKey = encryptedAiApiKey; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
