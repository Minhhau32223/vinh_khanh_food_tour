package com.foodtour.api.component;

import com.foodtour.api.entity.User;
import com.foodtour.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .username("admin")
                    .passwordHash(passwordEncoder.encode("password123"))
                    .role("ADMIN")
                    .isActive(true)
                    .build();
            userRepository.save(admin);
            System.out.println("Admin user created.");
        }
    }
}
