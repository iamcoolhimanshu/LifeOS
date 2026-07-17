package com.lifeos.api.controller;

import com.lifeos.api.dto.MessageResponse;
import com.lifeos.api.dto.TransactionDTO;
import com.lifeos.api.model.Transaction;
import com.lifeos.api.model.User;
import com.lifeos.api.security.UserDetailsImpl;
import com.lifeos.api.service.ActivityLogService;
import com.lifeos.api.service.TransactionService;
import com.lifeos.api.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/finances")
public class TransactionController {
    @Autowired
    private TransactionService transactionService;

    @Autowired
    private UserService userService;

    @Autowired
    private ActivityLogService activityLogService;

    private User getAuthenticatedUser(UserDetailsImpl userDetails) {
        return userService.findById(userDetails.getId()).get();
    }

    @GetMapping
    public ResponseEntity<List<Transaction>> getTransactions(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = getAuthenticatedUser(userDetails);
        return ResponseEntity.ok(transactionService.getTransactionsForUser(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Transaction> getTransactionById(@AuthenticationPrincipal UserDetailsImpl userDetails, @PathVariable Long id) {
        User user = getAuthenticatedUser(userDetails);
        return ResponseEntity.ok(transactionService.getTransactionForUser(user, id));
    }

    @PostMapping
    public ResponseEntity<Transaction> createTransaction(@AuthenticationPrincipal UserDetailsImpl userDetails, @Valid @RequestBody TransactionDTO dto) {
        User user = getAuthenticatedUser(userDetails);
        Transaction transaction = transactionService.createTransaction(
                user,
                dto.getDescription(),
                dto.getAmount(),
                dto.getType(),
                dto.getCategory(),
                dto.getDate()
        );
        activityLogService.logActivity(user, "FINANCE_CREATE", "Logged " + transaction.getType().toLowerCase() + " of $" + transaction.getAmount() + " for " + transaction.getDescription());
        return ResponseEntity.ok(transaction);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Transaction> updateTransaction(@AuthenticationPrincipal UserDetailsImpl userDetails, @PathVariable Long id, @Valid @RequestBody TransactionDTO dto) {
        User user = getAuthenticatedUser(userDetails);
        Transaction transaction = transactionService.updateTransaction(
                user,
                id,
                dto.getDescription(),
                dto.getAmount(),
                dto.getType(),
                dto.getCategory(),
                dto.getDate()
        );
        activityLogService.logActivity(user, "FINANCE_UPDATE", "Updated " + transaction.getType().toLowerCase() + " log: " + transaction.getDescription());
        return ResponseEntity.ok(transaction);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTransaction(@AuthenticationPrincipal UserDetailsImpl userDetails, @PathVariable Long id) {
        User user = getAuthenticatedUser(userDetails);
        Transaction transaction = transactionService.getTransactionForUser(user, id);
        transactionService.deleteTransaction(user, id);
        activityLogService.logActivity(user, "FINANCE_DELETE", "Deleted transaction: " + transaction.getDescription());
        return ResponseEntity.ok(new MessageResponse("Transaction deleted successfully."));
    }
}
