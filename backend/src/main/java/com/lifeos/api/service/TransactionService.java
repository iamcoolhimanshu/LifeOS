package com.lifeos.api.service;

import com.lifeos.api.model.Transaction;
import com.lifeos.api.model.User;
import com.lifeos.api.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class TransactionService {
    @Autowired
    private TransactionRepository transactionRepository;

    public List<Transaction> getTransactionsForUser(User user) {
        return transactionRepository.findByUserOrderByDateDesc(user);
    }

    public Transaction getTransactionForUser(User user, Long id) {
        return transactionRepository.findById(id)
                .filter(t -> t.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found or access denied"));
    }

    public Transaction createTransaction(User user, String description, BigDecimal amount, String type, String category, LocalDate date) {
        Transaction transaction = new Transaction(user, description, amount, type, category, date);
        return transactionRepository.save(transaction);
    }

    public Transaction updateTransaction(User user, Long id, String description, BigDecimal amount, String type, String category, LocalDate date) {
        Transaction transaction = getTransactionForUser(user, id);
        transaction.setDescription(description);
        transaction.setAmount(amount);
        transaction.setType(type);
        transaction.setCategory(category);
        transaction.setDate(date);
        return transactionRepository.save(transaction);
    }

    public void deleteTransaction(User user, Long id) {
        Transaction transaction = getTransactionForUser(user, id);
        transactionRepository.delete(transaction);
    }
}
