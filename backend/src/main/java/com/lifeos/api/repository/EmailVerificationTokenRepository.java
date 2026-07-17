package com.lifeos.api.repository;

import com.lifeos.api.model.EmailVerificationToken;
import com.lifeos.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {
    Optional<EmailVerificationToken> findByTokenHash(String tokenHash);
    Optional<EmailVerificationToken> findTopByUserAndUsedAtIsNullOrderByCreatedAtDesc(User user);
}
