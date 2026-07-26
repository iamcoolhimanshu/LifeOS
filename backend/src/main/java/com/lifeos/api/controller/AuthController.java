package com.lifeos.api.controller;

import com.lifeos.api.dto.*;
import com.lifeos.api.model.User;
import com.lifeos.api.model.RefreshToken;
import com.lifeos.api.security.JwtUtils;
import com.lifeos.api.service.ActivityLogService;
import com.lifeos.api.service.RefreshTokenService;
import com.lifeos.api.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private ActivityLogService activityLogService;

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        try {
            User user = userService.registerUser(signUpRequest);
            activityLogService.logActivity(user, "ACCOUNT_CREATED", "Registered account under email: " + user.getEmail());
            return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            JwtResponse jwtResponse = userService.authenticateUser(loginRequest);
            
            // Log authentication success
            User user = userService.findByUsername(loginRequest.getUsername()).get();
            activityLogService.logActivity(user, "USER_LOGIN", "Successfully logged in via credentials.");
            
            return ResponseEntity.ok(jwtResponse);
        } catch (Exception e) {
            String errorMsg = (e.getMessage() != null && !e.getMessage().isBlank()) ? e.getMessage() : "Error: Unauthorized. Invalid username or password.";
            return ResponseEntity.status(401).body(new MessageResponse(errorMsg));
        }
    }

    @PostMapping("/refreshtoken")
    public ResponseEntity<?> refreshtoken(@Valid @RequestBody TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String token = jwtUtils.generateTokenFromUsername(user.getUsername());
                    activityLogService.logActivity(user, "TOKEN_REFRESH", "Refreshed access JWT token.");
                    return ResponseEntity.ok(new TokenRefreshResponse(token, requestRefreshToken));
                })
                .orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));
    }

    @PostMapping("/signout")
    public ResponseEntity<?> logoutUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof com.lifeos.api.security.UserDetailsImpl) {
            Long userId = ((com.lifeos.api.security.UserDetailsImpl) principal).getId();
            User user = userService.findById(userId).get();
            refreshTokenService.deleteByUserId(userId);
            activityLogService.logActivity(user, "USER_LOGOUT", "Logged out of current device session.");
        }
        return ResponseEntity.ok(new MessageResponse("Log out successful!"));
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verifyUserEmail(@RequestParam("token") String token) {
        try {
            userService.verifyEmail(token);
            return ResponseEntity.ok(new MessageResponse("Email verified successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@RequestParam("email") String email) {
        try {
            userService.resendVerificationEmail(email);
            return ResponseEntity.ok(new MessageResponse("Verification email sent successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam("email") String email, jakarta.servlet.http.HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        String device = request.getHeader("User-Agent");
        userService.requestPasswordReset(email, ip, device);
        // Always return generic response
        return ResponseEntity.ok(new MessageResponse("If an account exists for this email, password reset instructions have been sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody PasswordResetRequest resetRequest, jakarta.servlet.http.HttpServletRequest request) {
        try {
            String ip = request.getRemoteAddr();
            String device = request.getHeader("User-Agent");
            userService.resetPassword(resetRequest.getToken(), resetRequest.getPassword(), ip, device);
            return ResponseEntity.ok(new MessageResponse("Password reset successful! You can now sign in with your new password."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
