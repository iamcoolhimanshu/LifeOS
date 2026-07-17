package com.lifeos.api.repository;

import com.lifeos.api.model.UserConfiguration;
import com.lifeos.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserConfigurationRepository extends JpaRepository<UserConfiguration, Long> {
    Optional<UserConfiguration> findByUser(User user);
}
