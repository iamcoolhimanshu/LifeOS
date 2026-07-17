package com.lifeos.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableCaching
@EnableScheduling
public class LifeOSApplication {
    public static void main(String[] args) {
        SpringApplication.run(LifeOSApplication.class, args);
    }

    @org.springframework.context.annotation.Bean
    public org.springframework.boot.CommandLineRunner initEmailVerification(
            com.lifeos.api.repository.UserRepository userRepository,
            com.lifeos.api.service.DatabaseSeedingService databaseSeedingService) {
        return args -> {
            userRepository.findAll().forEach(user -> {
                if (user.getEmailVerified() == null || !user.getEmailVerified()) {
                    user.setEmailVerified(true);
                    user.setEmailVerifiedAt(java.time.LocalDateTime.now());
                    userRepository.save(user);
                }
                databaseSeedingService.seedUserData(user);
            });
        };
    }
}
