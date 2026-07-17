package com.lifeos.api;

import com.lifeos.api.service.OAuthTokenEncryptionService;
import com.lifeos.api.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class EmailIntelligenceTests {

    @Autowired
    private OAuthTokenEncryptionService encryptionService;

    @Autowired
    private UserService userService;

    @Test
    void testTokenEncryptionAndDecryption() {
        String originalToken = "ya29.a0AfH6SMAa87352hdgfhjagsd1726487123472";
        
        // Encrypt
        String encrypted = encryptionService.encrypt(originalToken);
        assertNotNull(encrypted);
        assertNotEquals(originalToken, encrypted);
        
        // Decrypt
        String decrypted = encryptionService.decrypt(encrypted);
        assertEquals(originalToken, decrypted);
    }

    @Test
    void testTokenHashing() {
        String token = "secure-random-token-value-123456";
        
        String hash1 = userService.hashToken(token);
        String hash2 = userService.hashToken(token);
        
        assertNotNull(hash1);
        assertEquals(hash1, hash2); // Deterministic hash check
        
        String hash3 = userService.hashToken("different-token");
        assertNotEquals(hash1, hash3); // Collision resistance
    }

    @Test
    void testSecureTokenUniqueness() {
        String token1 = userService.generateSecureToken();
        String token2 = userService.generateSecureToken();
        
        assertNotNull(token1);
        assertNotNull(token2);
        assertNotEquals(token1, token2);
        assertTrue(token1.length() >= 40); // Hex/Base64 length checks
    }

    @Autowired
    private com.lifeos.api.controller.AnalyticsController analyticsController;

    @Autowired
    private com.lifeos.api.repository.UserRepository userRepository;

    @Test
    void testGetAnalyticsEndpoint() {
        // Find or create a test user
        com.lifeos.api.model.User user = userRepository.findAll().stream().findFirst().orElse(null);
        if (user == null) {
            user = new com.lifeos.api.model.User("test_user_analytics", "test_analytics@lifeos.com", "password", com.lifeos.api.model.Role.USER);
            user = userRepository.save(user);
        }

        com.lifeos.api.security.UserDetailsImpl details = com.lifeos.api.security.UserDetailsImpl.build(user);
        
        try {
            org.springframework.http.ResponseEntity<?> response = analyticsController.getAnalytics(details);
            assertNotNull(response);
            assertEquals(200, response.getStatusCode().value());
            assertNotNull(response.getBody());
        } catch (Exception e) {
            e.printStackTrace();
            fail("Analytics endpoint threw exception: " + e.getMessage());
        }
    }
}
