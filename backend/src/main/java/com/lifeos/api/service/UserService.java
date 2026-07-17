package com.lifeos.api.service;

import com.lifeos.api.dto.LoginRequest;
import com.lifeos.api.dto.SignupRequest;
import com.lifeos.api.dto.JwtResponse;
import com.lifeos.api.model.Role;
import com.lifeos.api.model.User;
import com.lifeos.api.model.RefreshToken;
import com.lifeos.api.repository.UserRepository;
import com.lifeos.api.security.JwtUtils;
import com.lifeos.api.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Optional;
import java.time.LocalDateTime;
import java.security.SecureRandom;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.Map;
import java.util.HashMap;
import com.lifeos.api.model.EmailVerificationToken;
import com.lifeos.api.repository.EmailVerificationTokenRepository;
import com.lifeos.api.model.PasswordResetToken;
import com.lifeos.api.repository.PasswordResetTokenRepository;

@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Autowired
    private EmailVerificationTokenRepository emailVerificationTokenRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private SystemEmailService systemEmailService;

    @Autowired
    private DatabaseSeedingService databaseSeedingService;

    @Transactional
    public User registerUser(SignupRequest signupRequest) {
        if (userRepository.existsByUsername(signupRequest.getUsername())) {
            throw new RuntimeException("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        // Create new user's account
        User user = new User(
                signupRequest.getUsername(),
                signupRequest.getEmail(),
                encoder.encode(signupRequest.getPassword()),
                Role.USER
        );

        User savedUser = userRepository.save(user);

        // Generate verification token
        String rawToken = generateSecureToken();
        String tokenHash = hashToken(rawToken);

        EmailVerificationToken verificationToken = new EmailVerificationToken(
                savedUser,
                tokenHash,
                LocalDateTime.now().plusHours(24)
        );
        emailVerificationTokenRepository.save(verificationToken);

        // Send Welcome & Verification Email
        Map<String, String> variables = new HashMap<>();
        variables.put("title", "Verify Your LifeOS Account");
        variables.put("username", savedUser.getUsername());
        variables.put("content", "Welcome to LifeOS! To finalize your account setup, please verify your email address by clicking the button below. This link will expire in 24 hours.");
        variables.put("link", "http://localhost:5173/verify-email?token=" + rawToken);
        variables.put("linkText", "Verify Email Address");
        
        systemEmailService.sendEmail(savedUser, savedUser.getEmail(), "Verify your LifeOS Account", "email_verification", variables);

        return savedUser;
    }

    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
        );

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId()).get();

        if (Boolean.FALSE.equals(user.getEmailVerified())) {
            throw new RuntimeException("Error: Email address not verified. Please verify your email first.");
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        String role = userDetails.getAuthorities().iterator().next().getAuthority();

        // Remove old refresh token and generate a new one
        refreshTokenService.deleteByUserId(userDetails.getId());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(userDetails.getId());

        return new JwtResponse(
                jwt,
                refreshToken.getToken(),
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                role
        );
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public String generateSecureToken() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error hashing token", e);
        }
    }

    @Transactional
    public void verifyEmail(String token) {
        String hash = hashToken(token);
        EmailVerificationToken verificationToken = emailVerificationTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new IllegalArgumentException("Error: Invalid verification link."));

        if (verificationToken.getUsedAt() != null) {
            throw new IllegalArgumentException("Error: Verification link already used.");
        }

        if (verificationToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Error: Verification link has expired.");
        }

        User user = verificationToken.getUser();
        user.setEmailVerified(true);
        user.setEmailVerifiedAt(LocalDateTime.now());
        User savedUser = userRepository.save(user);

        verificationToken.setUsedAt(LocalDateTime.now());
        emailVerificationTokenRepository.save(verificationToken);

        // Seed default user workspace notes, goals, docs, and tasks
        databaseSeedingService.seedUserData(savedUser);

        // Send Welcome Alert Security Email
        Map<String, String> variables = new HashMap<>();
        variables.put("title", "Welcome to LifeOS!");
        variables.put("username", user.getUsername());
        variables.put("content", "Your email address has been successfully verified! You now have full access to your Personal Digital Brain, Smart Notes, Connected Integrations, and Analytics dashboards.");
        systemEmailService.sendEmail(user, user.getEmail(), "Welcome to LifeOS!", "welcome_to_lifeos", variables);
    }

    @Transactional
    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Error: Email address not found."));

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new IllegalArgumentException("Error: Email is already verified.");
        }

        Optional<EmailVerificationToken> lastTokenOpt = emailVerificationTokenRepository.findTopByUserAndUsedAtIsNullOrderByCreatedAtDesc(user);
        if (lastTokenOpt.isPresent()) {
            EmailVerificationToken lastToken = lastTokenOpt.get();
            if (lastToken.getCreatedAt().isAfter(LocalDateTime.now().minusSeconds(60))) {
                throw new IllegalStateException("Please wait 60 seconds before requesting another verification email.");
            }
        }

        String rawToken = generateSecureToken();
        String tokenHash = hashToken(rawToken);

        EmailVerificationToken verificationToken = new EmailVerificationToken(
                user,
                tokenHash,
                LocalDateTime.now().plusHours(24)
        );
        emailVerificationTokenRepository.save(verificationToken);

        Map<String, String> variables = new HashMap<>();
        variables.put("title", "Verify Your LifeOS Account");
        variables.put("username", user.getUsername());
        variables.put("content", "A new verification email request was triggered for your account. Please verify your email by clicking the link below. This link will expire in 24 hours.");
        variables.put("link", "http://localhost:5173/verify-email?token=" + rawToken);
        variables.put("linkText", "Verify Email Address");
        
        systemEmailService.sendEmail(user, user.getEmail(), "Verify your LifeOS Account", "email_verification", variables);
    }

    @Transactional
    public void requestPasswordReset(String email, String ip, String device) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            logger.info("Password reset request: Email {} not found. Responding with generic success.", email);
            return;
        }

        User user = userOpt.get();

        String rawToken = generateSecureToken();
        String tokenHash = hashToken(rawToken);

        PasswordResetToken resetToken = new PasswordResetToken(
                user,
                tokenHash,
                LocalDateTime.now().plusHours(1)
        );
        passwordResetTokenRepository.save(resetToken);

        Map<String, String> variables = new HashMap<>();
        variables.put("title", "Reset Your LifeOS Password");
        variables.put("username", user.getUsername());
        variables.put("content", "You requested to reset your password. Click the button below to choose a new password. This link will expire in 1 hour.");
        variables.put("link", "http://localhost:5173/reset-password?token=" + rawToken);
        variables.put("linkText", "Reset Password");
        variables.put("ip", ip);
        variables.put("device", device);
        
        systemEmailService.sendEmail(user, user.getEmail(), "Reset Your LifeOS Password", "password_reset", variables);
    }

    @Transactional
    public void resetPassword(String token, String newPassword, String ip, String device) {
        String hash = hashToken(token);
        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new IllegalArgumentException("Error: Invalid or expired password reset link."));

        if (resetToken.getUsedAt() != null) {
            throw new IllegalArgumentException("Error: Password reset link has already been used.");
        }

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Error: Password reset link has expired.");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(encoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsedAt(LocalDateTime.now());
        passwordResetTokenRepository.save(resetToken);

        refreshTokenService.deleteByUserId(user.getId());

        Map<String, String> variables = new HashMap<>();
        variables.put("title", "Security Alert: Password Changed");
        variables.put("username", user.getUsername());
        variables.put("content", "Your LifeOS account password was recently changed. If this was you, no action is needed. If you did not make this change, please contact us immediately.");
        variables.put("ip", ip);
        variables.put("device", device);
        
        systemEmailService.sendEmail(user, user.getEmail(), "Security Alert: Password Changed", "password_changed", variables);
    }

    public User save(User user) {
        return userRepository.save(user);
    }
}
