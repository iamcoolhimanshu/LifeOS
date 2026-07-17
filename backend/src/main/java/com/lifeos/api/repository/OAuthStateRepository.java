package com.lifeos.api.repository;

import com.lifeos.api.model.OAuthState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface OAuthStateRepository extends JpaRepository<OAuthState, Long> {
    Optional<OAuthState> findByState(String state);
    void deleteByState(String state);
}
