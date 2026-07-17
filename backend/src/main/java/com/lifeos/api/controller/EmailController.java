package com.lifeos.api.controller;

import com.lifeos.api.dto.MessageResponse;
import com.lifeos.api.model.*;
import com.lifeos.api.repository.EmailActionRepository;
import com.lifeos.api.repository.EmailMessageRepository;
import com.lifeos.api.repository.UserRepository;
import com.lifeos.api.security.UserDetailsImpl;
import com.lifeos.api.service.EmailActionService;
import com.lifeos.api.service.EmailAiService;
import com.lifeos.api.service.GmailSyncService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/email")
public class EmailController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailMessageRepository emailMessageRepository;

    @Autowired
    private EmailActionRepository emailActionRepository;

    @Autowired
    private GmailSyncService gmailSyncService;

    @Autowired
    private EmailAiService emailAiService;

    @Autowired
    private EmailActionService emailActionService;

    @GetMapping("/messages")
    public ResponseEntity<?> getMessages(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "15") int size,
            @RequestParam(name = "category", required = false) String category,
            @RequestParam(name = "important", required = false) Boolean important,
            @RequestParam(name = "query", required = false) String query) {

        User user = userRepository.findById(userDetails.getId()).get();
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("receivedAt").descending());

        Page<EmailMessage> messagePage;
        if (query != null && !query.trim().isEmpty()) {
            messagePage = emailMessageRepository
                    .findByUserAndSubjectContainingIgnoreCaseOrSenderNameContainingIgnoreCaseOrSnippetContainingIgnoreCase(
                            user, query, query, query, pageRequest);
        } else if (category != null && !category.trim().isEmpty() && !"ALL".equalsIgnoreCase(category)) {
            messagePage = emailMessageRepository.findByUserAndCategory(user, category, pageRequest);
        } else if (Boolean.TRUE.equals(important)) {
            messagePage = emailMessageRepository.findByUserAndImportantIsTrue(user, pageRequest);
        } else {
            messagePage = emailMessageRepository.findByUser(user, pageRequest);
        }

        return ResponseEntity.ok(messagePage);
    }

    @PostMapping("/sync")
    public ResponseEntity<?> syncEmails(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = userRepository.findById(userDetails.getId()).get();
        
        // Trigger synchronization
        gmailSyncService.syncEmailsForUser(user);

        // Run AI classification on new emails
        emailAiService.analyzeEmailsForUser(user);

        return ResponseEntity.ok(new MessageResponse("Emails synchronized and analyzed successfully."));
    }

    @GetMapping("/actions")
    public ResponseEntity<?> getActions(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = userRepository.findById(userDetails.getId()).get();
        List<EmailAction> actions = emailActionRepository.findSuggestedActionsByUser(user);
        return ResponseEntity.ok(actions);
    }

    @PostMapping("/actions/{id}/approve")
    public ResponseEntity<?> approveSuggestedAction(@AuthenticationPrincipal UserDetailsImpl userDetails, @PathVariable("id") Long id) {
        User user = userRepository.findById(userDetails.getId()).get();
        try {
            emailActionService.approveAction(id, user);
            return ResponseEntity.ok(new MessageResponse("Suggested action approved and executed successfully."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/actions/{id}/reject")
    public ResponseEntity<?> rejectSuggestedAction(@AuthenticationPrincipal UserDetailsImpl userDetails, @PathVariable("id") Long id) {
        User user = userRepository.findById(userDetails.getId()).get();
        try {
            emailActionService.rejectAction(id, user);
            return ResponseEntity.ok(new MessageResponse("Suggested action rejected successfully."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/draft/generate")
    public ResponseEntity<?> generateReply(@AuthenticationPrincipal UserDetailsImpl userDetails, @RequestParam("emailId") Long emailId) {
        User user = userRepository.findById(userDetails.getId()).get();
        EmailMessage message = emailMessageRepository.findById(emailId)
                .orElseThrow(() -> new IllegalArgumentException("Email message not found"));

        if (!message.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized draft generation access");
        }

        try {
            EmailDraft draft = emailAiService.generateDraftReply(message, user);
            return ResponseEntity.ok(draft);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Draft generation failed: " + e.getMessage()));
        }
    }
}
