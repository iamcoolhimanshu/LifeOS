package com.lifeos.api.dto;

public class UserConfigurationDTO {

    private String smtpHost;
    private Integer smtpPort;
    private String smtpUsername;
    private String smtpPassword; // raw input on save, masked/null on get
    private String smtpFromAddress;
    private String smtpFromName;

    private String googleClientId; // raw input on save, masked/null on get
    private String googleClientSecret; // raw input on save, masked/null on get
    private String googleRedirectUri;

    private String aiProvider;
    private String aiApiKey; // raw input on save, masked/null on get

    public UserConfigurationDTO() {}

    // Getters and Setters
    public String getSmtpHost() { return smtpHost; }
    public void setSmtpHost(String smtpHost) { this.smtpHost = smtpHost; }

    public Integer getSmtpPort() { return smtpPort; }
    public void setSmtpPort(Integer smtpPort) { this.smtpPort = smtpPort; }

    public String getSmtpUsername() { return smtpUsername; }
    public void setSmtpUsername(String smtpUsername) { this.smtpUsername = smtpUsername; }

    public String getSmtpPassword() { return smtpPassword; }
    public void setSmtpPassword(String smtpPassword) { this.smtpPassword = smtpPassword; }

    public String getSmtpFromAddress() { return smtpFromAddress; }
    public void setSmtpFromAddress(String smtpFromAddress) { this.smtpFromAddress = smtpFromAddress; }

    public String getSmtpFromName() { return smtpFromName; }
    public void setSmtpFromName(String smtpFromName) { this.smtpFromName = smtpFromName; }

    public String getGoogleClientId() { return googleClientId; }
    public void setGoogleClientId(String googleClientId) { this.googleClientId = googleClientId; }

    public String getGoogleClientSecret() { return googleClientSecret; }
    public void setGoogleClientSecret(String googleClientSecret) { this.googleClientSecret = googleClientSecret; }

    public String getGoogleRedirectUri() { return googleRedirectUri; }
    public void setGoogleRedirectUri(String googleRedirectUri) { this.googleRedirectUri = googleRedirectUri; }

    public String getAiProvider() { return aiProvider; }
    public void setAiProvider(String aiProvider) { this.aiProvider = aiProvider; }

    public String getAiApiKey() { return aiApiKey; }
    public void setAiApiKey(String aiApiKey) { this.aiApiKey = aiApiKey; }
}
