package com.lifeos.api.controller;

import com.lifeos.api.dto.MessageResponse;
import com.lifeos.api.model.*;
import com.lifeos.api.repository.ConnectedEmailAccountRepository;
import com.lifeos.api.repository.OAuthStateRepository;
import com.lifeos.api.repository.UserRepository;
import com.lifeos.api.security.UserDetailsImpl;
import com.lifeos.api.service.OAuthTokenEncryptionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/integrations/google")
public class GoogleOAuthController {

    private static final Logger logger = LoggerFactory.getLogger(GoogleOAuthController.class);

    @Value("${lifeos.google.client-id}")
    private String clientId;

    @Value("${lifeos.google.client-secret}")
    private String clientSecret;

    @Value("${lifeos.google.redirect-uri}")
    private String redirectUri;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OAuthStateRepository oauthStateRepository;

    @Autowired
    private ConnectedEmailAccountRepository connectedEmailAccountRepository;

    @Autowired
    private OAuthTokenEncryptionService encryptionService;

    @Autowired
    private com.lifeos.api.repository.UserConfigurationRepository userConfigurationRepository;

    @GetMapping("/connect")
    public ResponseEntity<?> connectGoogle(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            User user = userRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("Error: User not found."));

            String activeClientId = this.clientId;
            String activeRedirectUri = this.redirectUri;

            Optional<UserConfiguration> configOpt = userConfigurationRepository.findByUser(user);
            if (configOpt.isPresent()) {
                UserConfiguration config = configOpt.get();
                if (config.getEncryptedGoogleClientId() != null && !config.getEncryptedGoogleClientId().isEmpty()) {
                    activeClientId = encryptionService.decrypt(config.getEncryptedGoogleClientId());
                    activeRedirectUri = config.getGoogleRedirectUri() != null ? config.getGoogleRedirectUri() : activeRedirectUri;
                }
            }

            if (activeClientId == null || activeClientId.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Google Client ID is not configured. Please set it in Settings > Connected Apps."));
            }

            // Generate secure unique state token
            String stateToken = UUID.randomUUID().toString();
            OAuthState state = new OAuthState(stateToken, user, LocalDateTime.now().plusMinutes(10));
            oauthStateRepository.save(state);

            // Construct Google consent auth URI with offline access type to get refresh tokens
            String scope = URLEncoder.encode("https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.metadata", StandardCharsets.UTF_8.name());
            String authUrl = "https://accounts.google.com/o/oauth2/v2/auth?" +
                    "client_id=" + URLEncoder.encode(activeClientId, StandardCharsets.UTF_8.name()) +
                    "&redirect_uri=" + URLEncoder.encode(activeRedirectUri, StandardCharsets.UTF_8.name()) +
                    "&response_type=code" +
                    "&scope=" + scope +
                    "&state=" + URLEncoder.encode(stateToken, StandardCharsets.UTF_8.name()) +
                    "&access_type=offline" +
                    "&prompt=consent";

            Map<String, String> response = new HashMap<>();
            response.put("url", authUrl);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Failed to generate Google connect URL", e);
            return ResponseEntity.status(500).body(new MessageResponse("Failed to initiate Google connection: " + e.getMessage()));
        }
    }

    @GetMapping("/callback")
    public ResponseEntity<?> handleCallback(@RequestParam("code") String code, @RequestParam("state") String stateVal) {
        try {
            // Find and validate OAuth state
            OAuthState state = oauthStateRepository.findByState(stateVal)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid state token (possible CSRF attack)."));

            if (state.getExpiresAt().isBefore(LocalDateTime.now())) {
                oauthStateRepository.delete(state);
                throw new IllegalStateException("State token has expired. Please try connecting again.");
            }

            User user = state.getUser();
            oauthStateRepository.delete(state); // Single use token deletion

            // Retrieve dynamic oauth configurations
            String activeClientId = this.clientId;
            String activeClientSecret = this.clientSecret;
            String activeRedirectUri = this.redirectUri;

            Optional<UserConfiguration> configOpt = userConfigurationRepository.findByUser(user);
            if (configOpt.isPresent()) {
                UserConfiguration config = configOpt.get();
                if (config.getEncryptedGoogleClientId() != null && !config.getEncryptedGoogleClientId().isEmpty()) {
                    activeClientId = encryptionService.decrypt(config.getEncryptedGoogleClientId());
                    activeClientSecret = encryptionService.decrypt(config.getEncryptedGoogleClientSecret());
                    activeRedirectUri = config.getGoogleRedirectUri() != null ? config.getGoogleRedirectUri() : activeRedirectUri;
                }
            }

            // Exchange Authorization Code
            HttpClient client = HttpClient.newHttpClient();
            String formPayload = "code=" + URLEncoder.encode(code, StandardCharsets.UTF_8.name()) +
                    "&client_id=" + URLEncoder.encode(activeClientId, StandardCharsets.UTF_8.name()) +
                    "&client_secret=" + URLEncoder.encode(activeClientSecret, StandardCharsets.UTF_8.name()) +
                    "&redirect_uri=" + URLEncoder.encode(activeRedirectUri, StandardCharsets.UTF_8.name()) +
                    "&grant_type=authorization_code";

            HttpRequest tokenRequest = HttpRequest.newBuilder()
                    .uri(URI.create("https://oauth2.googleapis.com/token"))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(formPayload))
                    .build();

            HttpResponse<String> tokenResponse = client.send(tokenRequest, HttpResponse.BodyHandlers.ofString());
            if (tokenResponse.statusCode() != 200) {
                logger.error("Token exchange failed: status={}, response={}", tokenResponse.statusCode(), tokenResponse.body());
                return ResponseEntity.status(HttpStatus.FOUND)
                        .location(URI.create("http://localhost:5173/settings?tab=integrations&status=error&error=token_exchange_failed"))
                        .build();
            }

            // Parse token JSON payload
            Map<String, Object> tokensMap = parseJson(tokenResponse.body());
            String accessToken = (String) tokensMap.get("access_token");
            String refreshToken = (String) tokensMap.get("refresh_token");
            Integer expiresInSeconds = ((Number) tokensMap.getOrDefault("expires_in", 3600)).intValue();
            String scopesReceived = (String) tokensMap.get("scope");

            // Query UserInfo (email & name)
            HttpRequest infoRequest = HttpRequest.newBuilder()
                    .uri(URI.create("https://www.googleapis.com/oauth2/v3/userinfo"))
                    .header("Authorization", "Bearer " + accessToken)
                    .GET()
                    .build();

            HttpResponse<String> infoResponse = client.send(infoRequest, HttpResponse.BodyHandlers.ofString());
            if (infoResponse.statusCode() != 200) {
                logger.error("Failed to retrieve google user info: status={}, response={}", infoResponse.statusCode(), infoResponse.body());
                return ResponseEntity.status(HttpStatus.FOUND)
                        .location(URI.create("http://localhost:5173/settings?tab=integrations&status=error&error=userinfo_failed"))
                        .build();
            }

            Map<String, Object> infoMap = parseJson(infoResponse.body());
            String googleAccountId = (String) infoMap.get("sub");
            String emailAddress = (String) infoMap.get("email");
            String displayName = (String) infoMap.get("name");

            // Encrypt tokens
            String encAccessToken = encryptionService.encrypt(accessToken);
            String encRefreshToken = refreshToken != null ? encryptionService.encrypt(refreshToken) : null;
            LocalDateTime tokenExpiresAt = LocalDateTime.now().plusSeconds(expiresInSeconds);

            // Fetch or create ConnectedEmailAccount
            ConnectedEmailAccount account = connectedEmailAccountRepository
                    .findByUserAndProviderAndEmailAddress(user, EmailProvider.GOOGLE, emailAddress)
                    .orElse(new ConnectedEmailAccount(user, EmailProvider.GOOGLE, googleAccountId, emailAddress, displayName));

            account.setEncryptedAccessToken(encAccessToken);
            if (encRefreshToken != null) {
                account.setEncryptedRefreshToken(encRefreshToken);
            }
            account.setTokenExpiresAt(tokenExpiresAt);
            account.setScopes(scopesReceived);
            account.setConnected(true);
            connectedEmailAccountRepository.save(account);

            logger.info("Successfully connected Google email account for user {}: {}", user.getUsername(), emailAddress);

            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create("http://localhost:5173/settings?tab=integrations&status=success"))
                    .build();

        } catch (Exception e) {
            logger.error("Callback error", e);
            String errMsg = URLEncoder.encode(e.getMessage(), StandardCharsets.UTF_8);
            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create("http://localhost:5173/settings?tab=integrations&status=error&error=" + errMsg))
                    .build();
        }
    }

    @GetMapping("/status")
    public ResponseEntity<?> getStatus(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            User user = userRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("Error: User not found."));

            List<ConnectedEmailAccount> accounts = connectedEmailAccountRepository.findByUserAndConnectedIsTrue(user);
            List<Map<String, Object>> list = new ArrayList<>();
            for (ConnectedEmailAccount account : accounts) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", account.getId());
                map.put("provider", account.getProvider());
                map.put("emailAddress", account.getEmailAddress());
                map.put("displayName", account.getDisplayName());
                map.put("lastSyncAt", account.getLastSyncAt());
                list.add(map);
            }

            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new MessageResponse("Error retrieving connection status: " + e.getMessage()));
        }
    }

    @DeleteMapping("/disconnect")
    public ResponseEntity<?> disconnectGoogle(@AuthenticationPrincipal UserDetailsImpl userDetails, @RequestParam("email") String email) {
        try {
            User user = userRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("Error: User not found."));

            Optional<ConnectedEmailAccount> accountOpt = connectedEmailAccountRepository.findByUserAndProviderAndEmailAddress(user, EmailProvider.GOOGLE, email);
            if (accountOpt.isPresent()) {
                ConnectedEmailAccount account = accountOpt.get();
                account.setConnected(false);
                account.setEncryptedAccessToken("DISCONNECTED");
                account.setEncryptedRefreshToken("DISCONNECTED");
                connectedEmailAccountRepository.save(account);
                logger.info("Successfully disconnected email account: {}", email);
                return ResponseEntity.ok(new MessageResponse("Google Gmail account disconnected successfully."));
            } else {
                return ResponseEntity.status(404).body(new MessageResponse("Connected account not found."));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new MessageResponse("Error disconnecting account: " + e.getMessage()));
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseJson(String json) {
        // Minimal JSON parser helper to avoid custom object mapper configurations
        Map<String, Object> map = new HashMap<>();
        String clean = json.trim();
        if (clean.startsWith("{") && clean.endsWith("}")) {
            clean = clean.substring(1, clean.length() - 1);
            String[] pairs = clean.split(",");
            for (String pair : pairs) {
                String[] parts = pair.split(":");
                if (parts.length >= 2) {
                    String key = parts[0].trim().replace("\"", "");
                    StringBuilder valSb = new StringBuilder();
                    for (int i = 1; i < parts.length; i++) {
                        valSb.append(parts[i]);
                        if (i < parts.length - 1) valSb.append(":");
                    }
                    String val = valSb.toString().trim();
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
                }
            }
        }
        return map;
    }
}
