package com.lifeos.api.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "connected_email_accounts")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ConnectedEmailAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EmailProvider provider;

    @Column(name = "provider_account_id", nullable = false)
    private String providerAccountId;

    @Column(name = "email_address", nullable = false)
    private String emailAddress;

    @Column(name = "display_name")
    private String displayName;

    @Column(name = "encrypted_access_token", length = 2000, nullable = false)
    private String encryptedAccessToken;

    @Column(name = "encrypted_refresh_token", length = 2000)
    private String encryptedRefreshToken;

    @Column(name = "token_expires_at")
    private LocalDateTime tokenExpiresAt;

    @Column(length = 2000)
    private String scopes;

    @Column(nullable = false)
    private Boolean connected = true;

    @Column(name = "last_sync_at")
    private LocalDateTime lastSyncAt;

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

    public ConnectedEmailAccount() {}

    public ConnectedEmailAccount(User user, EmailProvider provider, String providerAccountId, String emailAddress, String displayName) {
        this.user = user;
        this.provider = provider;
        this.providerAccountId = providerAccountId;
        this.emailAddress = emailAddress;
        this.displayName = displayName;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public EmailProvider getProvider() { return provider; }
    public void setProvider(EmailProvider provider) { this.provider = provider; }

    public String getProviderAccountId() { return providerAccountId; }
    public void setProviderAccountId(String providerAccountId) { this.providerAccountId = providerAccountId; }

    public String getEmailAddress() { return emailAddress; }
    public void setEmailAddress(String emailAddress) { this.emailAddress = emailAddress; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getEncryptedAccessToken() { return encryptedAccessToken; }
    public void setEncryptedAccessToken(String encryptedAccessToken) { this.encryptedAccessToken = encryptedAccessToken; }

    public String getEncryptedRefreshToken() { return encryptedRefreshToken; }
    public void setEncryptedRefreshToken(String encryptedRefreshToken) { this.encryptedRefreshToken = encryptedRefreshToken; }

    public LocalDateTime getTokenExpiresAt() { return tokenExpiresAt; }
    public void setTokenExpiresAt(LocalDateTime tokenExpiresAt) { this.tokenExpiresAt = tokenExpiresAt; }

    public String getScopes() { return scopes; }
    public void setScopes(String scopes) { this.scopes = scopes; }

    public Boolean getConnected() { return connected; }
    public void setConnected(Boolean connected) { this.connected = connected; }

    public LocalDateTime getLastSyncAt() { return lastSyncAt; }
    public void setLastSyncAt(LocalDateTime lastSyncAt) { this.lastSyncAt = lastSyncAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
