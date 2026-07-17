package com.lifeos.api.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

@Service
public class OAuthTokenEncryptionService {

    private static final Logger logger = LoggerFactory.getLogger(OAuthTokenEncryptionService.class);
    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 128; // in bits

    private final byte[] secretKeyBytes;

    public OAuthTokenEncryptionService(@Value("${lifeos.oauth.encryption-key:fallback-default-key-for-lifeos-tokens-32}") String keyConfig) {
        this.secretKeyBytes = deriveKey(keyConfig);
    }

    private byte[] deriveKey(String key) {
        try {
            MessageDigest sha = MessageDigest.getInstance("SHA-256");
            return sha.digest(key.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            logger.error("Failed to derive encryption key: {}", e.getMessage());
            return new byte[32]; // dummy
        }
    }

    public String encrypt(String plainText) {
        if (plainText == null) return null;
        try {
            byte[] iv = new byte[GCM_IV_LENGTH];
            new SecureRandom().nextBytes(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            SecretKeySpec keySpec = new SecretKeySpec(secretKeyBytes, "AES");
            cipher.init(Cipher.ENCRYPT_MODE, keySpec, parameterSpec);

            byte[] cipherText = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));

            ByteBuffer byteBuffer = ByteBuffer.allocate(iv.length + cipherText.length);
            byteBuffer.put(iv);
            byteBuffer.put(cipherText);

            return Base64.getEncoder().encodeToString(byteBuffer.array());
        } catch (Exception e) {
            logger.error("Encryption failure: {}", e.getMessage());
            throw new RuntimeException("Encryption failed", e);
        }
    }

    public String decrypt(String cipherTextBase64) {
        if (cipherTextBase64 == null) return null;
        try {
            byte[] decoded = Base64.getDecoder().decode(cipherTextBase64);
            if (decoded.length < GCM_IV_LENGTH) {
                throw new IllegalArgumentException("Invalid cipher text format");
            }

            ByteBuffer byteBuffer = ByteBuffer.wrap(decoded);
            byte[] iv = new byte[GCM_IV_LENGTH];
            byteBuffer.get(iv);

            byte[] cipherText = new byte[byteBuffer.remaining()];
            byteBuffer.get(cipherText);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            SecretKeySpec keySpec = new SecretKeySpec(secretKeyBytes, "AES");
            cipher.init(Cipher.DECRYPT_MODE, keySpec, parameterSpec);

            byte[] decryptedBytes = cipher.doFinal(cipherText);
            return new String(decryptedBytes, StandardCharsets.UTF_8);
        } catch (Exception e) {
            logger.error("Decryption failure: {}", e.getMessage());
            throw new RuntimeException("Decryption failed", e);
        }
    }
}
