package com.lifeos.api.repository;

import com.lifeos.api.model.Transaction;
import com.lifeos.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserOrderByDateDesc(User user);

    @Query("SELECT t FROM Transaction t WHERE t.user = :user AND " +
           "(t.description LIKE CONCAT('%', :query, '%') OR " +
           "t.category LIKE CONCAT('%', :query, '%'))")
    List<Transaction> searchTransactions(@Param("user") User user, @Param("query") String query);
}
