package com.lifeos.api.service;

import com.lifeos.api.model.*;
import com.lifeos.api.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

@Service
public class GmailSyncService {

    private static final Logger logger = LoggerFactory.getLogger(GmailSyncService.class);

    @Value("${lifeos.google.client-id:}")
    private String clientId;

    @Value("${lifeos.google.client-secret:}")
    private String clientSecret;

    @Autowired
    private ConnectedEmailAccountRepository connectedEmailAccountRepository;

    @Autowired
    private EmailMessageRepository emailMessageRepository;

    @Autowired
    private EmailAttachmentRepository emailAttachmentRepository;

    @Autowired
    private EmailSyncHistoryRepository emailSyncHistoryRepository;

    @Autowired
    private OAuthTokenEncryptionService encryptionService;

    @Autowired
    private com.lifeos.api.repository.UserConfigurationRepository userConfigurationRepository;

    /**
     * Triggers full incremental sync for a given user account.
     */
    @Transactional
    public void syncEmailsForUser(User user) {
        List<ConnectedEmailAccount> accounts = connectedEmailAccountRepository.findByUserAndConnectedIsTrue(user);
        if (accounts.isEmpty()) {
            logger.info("No connected email accounts found for user: {}. Injecting mock emails.", user.getUsername());
            injectMockEmails(user);
            return;
        }

        for (ConnectedEmailAccount account : accounts) {
            syncAccount(account);
        }
    }

    private void syncAccount(ConnectedEmailAccount account) {
        LocalDateTime startedAt = LocalDateTime.now();
        EmailSyncHistory log = new EmailSyncHistory(account, "INCREMENTAL", startedAt, "STARTED");
        emailSyncHistoryRepository.save(log);

        try {
            String accessToken = getOrRefreshAccessToken(account);
            HttpClient client = HttpClient.newHttpClient();
            
            // List messages
            String listUrl = "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=20";
            HttpRequest listReq = HttpRequest.newBuilder()
                    .uri(URI.create(listUrl))
                    .header("Authorization", "Bearer " + accessToken)
                    .GET()
                    .build();

            HttpResponse<String> listRes = client.send(listReq, HttpResponse.BodyHandlers.ofString());
            if (listRes.statusCode() != 200) {
                throw new RuntimeException("Google API error: Status code " + listRes.statusCode());
            }

            Map<String, Object> listMap = parseJson(listRes.body());
            List<Map<String, Object>> messagesList = (List<Map<String, Object>>) listMap.get("messages");

            int processed = 0, created = 0, updated = 0;
            if (messagesList != null) {
                for (Map<String, Object> msgMeta : messagesList) {
                    String msgId = (String) msgMeta.get("id");
                    processed++;

                    // Check if already synced
                    Optional<EmailMessage> existingMsg = emailMessageRepository
                            .findByUserAndConnectedEmailAccountAndProviderMessageId(account.getUser(), account, msgId);

                    if (existingMsg.isPresent()) {
                        continue;
                    }

                    // Fetch detailed message content
                    HttpRequest detailsReq = HttpRequest.newBuilder()
                            .uri(URI.create("https://gmail.googleapis.com/gmail/v1/users/me/messages/" + msgId))
                            .header("Authorization", "Bearer " + accessToken)
                            .GET()
                            .build();

                    HttpResponse<String> detailsRes = client.send(detailsReq, HttpResponse.BodyHandlers.ofString());
                    if (detailsRes.statusCode() == 200) {
                        Map<String, Object> detailMap = parseJson(detailsRes.body());
                        saveGoogleMessage(account, detailMap);
                        created++;
                    }
                }
            }

            account.setLastSyncAt(LocalDateTime.now());
            connectedEmailAccountRepository.save(account);

            log.setStatus("COMPLETED");
            log.setCompletedAt(LocalDateTime.now());
            log.setMessagesProcessed(processed);
            log.setMessagesCreated(created);
            log.setMessagesUpdated(updated);
            emailSyncHistoryRepository.save(log);

            logger.info("Sync finished for {}: Processed {}, Created {}", account.getEmailAddress(), processed, created);
        } catch (Exception e) {
            logger.error("Gmail sync failed for account: {}", account.getEmailAddress(), e);
            log.setStatus("FAILED");
            log.setCompletedAt(LocalDateTime.now());
            log.setErrorMessage(e.getMessage());
            emailSyncHistoryRepository.save(log);
        }
    }

    private void saveGoogleMessage(ConnectedEmailAccount account, Map<String, Object> detailMap) {
        String id = (String) detailMap.get("id");
        String threadId = (String) detailMap.get("threadId");
        String snippet = (String) detailMap.get("snippet");
        
        // Parse payload headers for Subject, From, To, CC, Date
        Map<String, Object> payload = (Map<String, Object>) detailMap.get("payload");
        List<Map<String, Object>> headers = (List<Map<String, Object>>) payload.get("headers");
        
        String subject = "No Subject";
        String sender = "Unknown";
        String recipients = "";
        String cc = "";
        long internalDateMs = Long.parseLong(detailMap.getOrDefault("internalDate", "0").toString());
        LocalDateTime receivedAt = LocalDateTime.ofInstant(Instant.ofEpochMilli(internalDateMs), ZoneId.systemDefault());

        if (headers != null) {
            for (Map<String, Object> header : headers) {
                String name = (String) header.get("name");
                String value = (String) header.get("value");
                if ("Subject".equalsIgnoreCase(name)) {
                    subject = value;
                } else if ("From".equalsIgnoreCase(name)) {
                    sender = value;
                } else if ("To".equalsIgnoreCase(name)) {
                    recipients = value;
                } else if ("Cc".equalsIgnoreCase(name)) {
                    cc = value;
                }
            }
        }

        // Extract Sender Name and Email
        String senderName = sender;
        String senderEmail = sender;
        if (sender.contains("<")) {
            senderName = sender.substring(0, sender.indexOf("<")).trim();
            senderEmail = sender.substring(sender.indexOf("<") + 1, sender.indexOf(">")).trim();
        }

        EmailMessage message = new EmailMessage();
        message.setUser(account.getUser());
        message.setConnectedEmailAccount(account);
        message.setProviderMessageId(id);
        message.setThreadId(threadId);
        message.setSenderName(senderName);
        message.setSenderEmail(senderEmail);
        message.setRecipientEmails(recipients);
        message.setCcEmails(cc);
        message.setSubject(subject);
        message.setSnippet(snippet);
        message.setReceivedAt(receivedAt);
        message.setSentAt(receivedAt);
        message.setReadStatus(false);
        message.setImportant(subject.toLowerCase().contains("urgent") || subject.toLowerCase().contains("action required"));

        // Extract body parts recursively
        StringBuilder bodyBuilder = new StringBuilder();
        extractBodyText(payload, bodyBuilder);
        String body = bodyBuilder.toString();
        message.setPlainTextBody(body);
        message.setHtmlBody(body); // Simple fallback

        emailMessageRepository.save(message);

        // Process attachments if parts list them
        List<Map<String, Object>> parts = (List<Map<String, Object>>) payload.get("parts");
        if (parts != null) {
            for (Map<String, Object> part : parts) {
                String filename = (String) part.get("filename");
                if (filename != null && !filename.isEmpty()) {
                    Map<String, Object> bodyMeta = (Map<String, Object>) part.get("body");
                    String attachmentId = (String) bodyMeta.get("attachmentId");
                    Long size = Long.parseLong(bodyMeta.getOrDefault("size", "0").toString());
                    String mime = (String) part.get("mimeType");

                    EmailAttachment attachment = new EmailAttachment(message, attachmentId, filename, mime, size);
                    emailAttachmentRepository.save(attachment);
                    message.setHasAttachments(true);
                }
            }
            emailMessageRepository.save(message);
        }
    }

    private void extractBodyText(Map<String, Object> part, StringBuilder bodyBuilder) {
        Map<String, Object> bodyMeta = (Map<String, Object>) part.get("body");
        if (bodyMeta != null) {
            String data = (String) bodyMeta.get("data");
            if (data != null && !data.isEmpty()) {
                byte[] decoded = Base64.getUrlDecoder().decode(data);
                bodyBuilder.append(new String(decoded, StandardCharsets.UTF_8));
            }
        }
        
        List<Map<String, Object>> parts = (List<Map<String, Object>>) part.get("parts");
        if (parts != null) {
            for (Map<String, Object> childPart : parts) {
                extractBodyText(childPart, bodyBuilder);
            }
        }
    }

    public synchronized String getOrRefreshAccessToken(ConnectedEmailAccount account) {
        if (account.getTokenExpiresAt().isAfter(LocalDateTime.now().plusMinutes(5))) {
            return encryptionService.decrypt(account.getEncryptedAccessToken());
        }

        String refreshToken = encryptionService.decrypt(account.getEncryptedRefreshToken());
        if (refreshToken == null || refreshToken.isEmpty()) {
            throw new RuntimeException("Refresh token is missing. Please reconnect your account.");
        }

        try {
            String activeClientId = this.clientId;
            String activeClientSecret = this.clientSecret;

            java.util.Optional<com.lifeos.api.model.UserConfiguration> configOpt = userConfigurationRepository.findByUser(account.getUser());
            if (configOpt.isPresent()) {
                com.lifeos.api.model.UserConfiguration config = configOpt.get();
                if (config.getEncryptedGoogleClientId() != null && !config.getEncryptedGoogleClientId().isEmpty()) {
                    activeClientId = encryptionService.decrypt(config.getEncryptedGoogleClientId());
                    activeClientSecret = encryptionService.decrypt(config.getEncryptedGoogleClientSecret());
                }
            }

            HttpClient client = HttpClient.newHttpClient();
            String formPayload = "client_id=" + java.net.URLEncoder.encode(activeClientId, StandardCharsets.UTF_8.name()) +
                    "&client_secret=" + java.net.URLEncoder.encode(activeClientSecret, StandardCharsets.UTF_8.name()) +
                    "&refresh_token=" + java.net.URLEncoder.encode(refreshToken, StandardCharsets.UTF_8.name()) +
                    "&grant_type=refresh_token";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://oauth2.googleapis.com/token"))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(formPayload))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                throw new RuntimeException("Failed to refresh Google token: HTTP " + response.statusCode());
            }

            Map<String, Object> tokensMap = parseJson(response.body());
            String newAccessToken = (String) tokensMap.get("access_token");
            Integer expiresInSeconds = ((Number) tokensMap.getOrDefault("expires_in", 3600)).intValue();

            account.setEncryptedAccessToken(encryptionService.encrypt(newAccessToken));
            account.setTokenExpiresAt(LocalDateTime.now().plusSeconds(expiresInSeconds));
            connectedEmailAccountRepository.save(account);

            return newAccessToken;
        } catch (Exception e) {
            logger.error("Token refresh failed for account {}", account.getEmailAddress(), e);
            throw new RuntimeException("Failed to refresh access token: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void injectMockEmails(User user) {
        // Look up if user has messages already, if so skip duplicate injection
        Page<EmailMessage> list = emailMessageRepository.findByUser(user, org.springframework.data.domain.PageRequest.of(0, 5));
        if (list.getTotalElements() > 0) {
            return;
        }

        // Mock Account Connection
        ConnectedEmailAccount mockAcc = new ConnectedEmailAccount(user, EmailProvider.GOOGLE, "mock-google-id", user.getEmail(), user.getUsername());
        mockAcc.setEncryptedAccessToken("MOCK");
        mockAcc.setEncryptedRefreshToken("MOCK");
        mockAcc.setTokenExpiresAt(LocalDateTime.now().plusYears(10));
        mockAcc.setConnected(true);
        connectedEmailAccountRepository.save(mockAcc);

        // 1. ABC Technologies - Interview Schedule
        EmailMessage m1 = new EmailMessage();
        m1.setUser(user);
        m1.setConnectedEmailAccount(mockAcc);
        m1.setProviderMessageId("mock-msg-1");
        m1.setThreadId("mock-th-1");
        m1.setSenderName("ABC Technologies Recruiting");
        m1.setSenderEmail("hr@abctechnologies.com");
        m1.setRecipientEmails(user.getEmail());
        m1.setSubject("Java Developer Interview Scheduled — ABC Technologies");
        m1.setSnippet("Hi " + user.getUsername() + ", we have scheduled your technical coding interview for Monday at 2:00 PM. Please join using the Google Meet link inside...");
        m1.setPlainTextBody("Dear candidate, we are pleased to invite you for the Java Developer role technical interview. Details: Monday, July 13th at 2:00 PM (IST). Meet Link: https://meet.google.com/abc-xyz-123. Please have a stable internet connection and webcam ready.");
        m1.setReceivedAt(LocalDateTime.now().minusHours(2));
        m1.setSentAt(LocalDateTime.now().minusHours(2));
        m1.setImportant(true);
        m1.setReadStatus(false);
        emailMessageRepository.save(m1);

        // 2. Cloud Billing Alert - Finance
        EmailMessage m2 = new EmailMessage();
        m2.setUser(user);
        m2.setConnectedEmailAccount(mockAcc);
        m2.setProviderMessageId("mock-msg-2");
        m2.setThreadId("mock-th-2");
        m2.setSenderName("GCP Billing Console");
        m2.setSenderEmail("billing-noreply@google.com");
        m2.setRecipientEmails(user.getEmail());
        m2.setSubject("Urgent: Google Cloud Platform invoice due for $142.50");
        m2.setSnippet("Your monthly billing invoice is ready. An amount of $142.50 will be charged on your ending card July 15th, 2026. Please review details.");
        m2.setPlainTextBody("This is your monthly invoice summary for cloud project 'lifeos-digital-brain'. Billing period: June 2026. Total Amount Due: $142.50. Due Date: July 15th, 2026. Invoice Number: INV-8874621.");
        m2.setReceivedAt(LocalDateTime.now().minusHours(5));
        m2.setSentAt(LocalDateTime.now().minusHours(5));
        m2.setImportant(true);
        m2.setReadStatus(false);
        emailMessageRepository.save(m2);

        // 3. GitHub PR notification - Work
        EmailMessage m3 = new EmailMessage();
        m3.setUser(user);
        m3.setConnectedEmailAccount(mockAcc);
        m3.setProviderMessageId("mock-msg-3");
        m3.setThreadId("mock-th-3");
        m3.setSenderName("GitHub Notification");
        m3.setSenderEmail("notifications@github.com");
        m3.setRecipientEmails(user.getEmail());
        m3.setSubject("[GitHub] PR approved: #124 Refactor security context filters");
        m3.setSnippet("User dev-code-pro approved your pull request to master. Merging is unblocked. Run tests and execute master sync.");
        m3.setPlainTextBody("PR #124 'Refactor security context filters' has been approved by reviewer dev-code-pro. All status checks passed. You can squash and merge.");
        m3.setReceivedAt(LocalDateTime.now().minusDays(1));
        m3.setSentAt(LocalDateTime.now().minusDays(1));
        m3.setImportant(false);
        m3.setReadStatus(true);
        emailMessageRepository.save(m3);
        
        logger.info("Successfully populated 3 mock emails for demo validation.");
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseJson(String json) {
        Map<String, Object> map = new HashMap<>();
        String clean = json.trim();
        if (clean.startsWith("{") && clean.endsWith("}")) {
            clean = clean.substring(1, clean.length() - 1);
            
            // Standard simple splitter
            int i = 0;
            while (i < clean.length()) {
                int colonIdx = clean.indexOf(":", i);
                if (colonIdx == -1) break;
                
                String key = clean.substring(i, colonIdx).trim().replace("\"", "").replace("{", "").replace("}", "");
                
                // Find end of value
                int commaIdx = clean.indexOf(",", colonIdx);
                if (commaIdx == -1) commaIdx = clean.length();
                
                String val = clean.substring(colonIdx + 1, commaIdx).trim();
                if (val.startsWith("\"") && val.endsWith("\"")) {
                    map.put(key, val.substring(1, val.length() - 1));
                } else if (val.equalsIgnoreCase("true") || val.equalsIgnoreCase("false")) {
                    map.put(key, Boolean.parseBoolean(val));
                } else {
                    try {
                        if (val.contains(".")) {
                            map.put(key, Double.parseDouble(val));
                        } else {
                            map.put(key, Long.parseLong(val));
                        }
                    } catch (NumberFormatException e) {
                        map.put(key, val);
                    }
                }
                i = commaIdx + 1;
            }
        }
        return map;
    }
}
