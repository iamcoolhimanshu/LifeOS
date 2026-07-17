package com.lifeos.api.repository;

import com.lifeos.api.model.ConnectedEmailAccount;
import com.lifeos.api.model.User;
import com.lifeos.api.model.EmailProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ConnectedEmailAccountRepository extends JpaRepository<ConnectedEmailAccount, Long> {
    List<ConnectedEmailAccount> findByUserAndConnectedIsTrue(User user);
    Optional<ConnectedEmailAccount> findByUserAndProviderAndEmailAddress(User user, EmailProvider provider, String emailAddress);
}
