package com.lifeos.api.controller;

import com.lifeos.api.dto.MessageResponse;
import com.lifeos.api.dto.UserConfigurationDTO;
import com.lifeos.api.model.User;
import com.lifeos.api.model.UserConfiguration;
import com.lifeos.api.repository.UserConfigurationRepository;
import com.lifeos.api.repository.UserRepository;
import com.lifeos.api.security.UserDetailsImpl;
import com.lifeos.api.service.OAuthTokenEncryptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/config-vault")
public class ConfigurationVaultController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserConfigurationRepository userConfigurationRepository;

    @Autowired
    private OAuthTokenEncryptionService encryptionService;

    @GetMapping
    public ResponseEntity<?> getConfiguration(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = userRepository.findById(userDetails.getId()).get();
        UserConfiguration config = userConfigurationRepository.findByUser(user)
                .orElse(new UserConfiguration(user));

        UserConfigurationDTO dto = new UserConfigurationDTO();
        dto.setSmtpHost(config.getSmtpHost());
        dto.setSmtpPort(config.getSmtpPort());
        dto.setSmtpUsername(config.getSmtpUsername());
        dto.setSmtpFromAddress(config.getSmtpFromAddress());
        dto.setSmtpFromName(config.getSmtpFromName());
        dto.setGoogleRedirectUri(config.getGoogleRedirectUri());
        dto.setAiProvider(config.getAiProvider());

        // Mask encrypted secrets
        dto.setSmtpPassword(config.getEncryptedSmtpPassword() != null ? "••••••••" : null);
        dto.setGoogleClientId(config.getEncryptedGoogleClientId() != null ? "••••••••" : null);
        dto.setGoogleClientSecret(config.getEncryptedGoogleClientSecret() != null ? "••••••••" : null);
        dto.setAiApiKey(config.getEncryptedAiApiKey() != null ? "••••••••" : null);

        return ResponseEntity.ok(dto);
    }

    @PostMapping
    public ResponseEntity<?> saveConfiguration(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody UserConfigurationDTO dto) {

        User user = userRepository.findById(userDetails.getId()).get();
        UserConfiguration config = userConfigurationRepository.findByUser(user)
                .orElse(new UserConfiguration(user));

        config.setSmtpHost(dto.getSmtpHost());
        config.setSmtpPort(dto.getSmtpPort());
        config.setSmtpUsername(dto.getSmtpUsername());
        config.setSmtpFromAddress(dto.getSmtpFromAddress());
        config.setSmtpFromName(dto.getSmtpFromName());
        config.setGoogleRedirectUri(dto.getGoogleRedirectUri());
        config.setAiProvider(dto.getAiProvider());

        // Update password if changed and not masked placeholder
        if (dto.getSmtpPassword() != null && !dto.getSmtpPassword().isEmpty() && !"••••••••".equals(dto.getSmtpPassword())) {
            config.setEncryptedSmtpPassword(encryptionService.encrypt(dto.getSmtpPassword()));
        }
        
        // Update client id if changed
        if (dto.getGoogleClientId() != null && !dto.getGoogleClientId().isEmpty() && !"••••••••".equals(dto.getGoogleClientId())) {
            config.setEncryptedGoogleClientId(encryptionService.encrypt(dto.getGoogleClientId()));
        }

        // Update client secret if changed
        if (dto.getGoogleClientSecret() != null && !dto.getGoogleClientSecret().isEmpty() && !"••••••••".equals(dto.getGoogleClientSecret())) {
            config.setEncryptedGoogleClientSecret(encryptionService.encrypt(dto.getGoogleClientSecret()));
        }

        // Update AI key if changed
        if (dto.getAiApiKey() != null && !dto.getAiApiKey().isEmpty() && !"••••••••".equals(dto.getAiApiKey())) {
            config.setEncryptedAiApiKey(encryptionService.encrypt(dto.getAiApiKey()));
        }

        userConfigurationRepository.save(config);
        return ResponseEntity.ok(new MessageResponse("Configuration Vault preferences updated successfully."));
    }
}
