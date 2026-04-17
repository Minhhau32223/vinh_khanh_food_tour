package com.foodtour.api.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Languages Translation: public 
                        .requestMatchers("/api/translate").permitAll()
                        .requestMatchers("/api/translate/**").permitAll()
                        // Auth routes: public
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/audio/**", "/img/**").permitAll()
                        // Session: public (khách vãng lai không cần đăng nhập)
                        .requestMatchers("/api/sessions/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/analytics/dashboard").hasRole("ADMIN")
                        // Analytics: public (guest log play events + top POI)
                        .requestMatchers("/api/analytics/**").permitAll()
                        // POI read: PUBLIC (guest web + mobile không cần đăng nhập)
                        .requestMatchers(HttpMethod.GET, "/api/pois/**").permitAll()
                        // Tour read: PUBLIC (guest web xem tour list)
                        .requestMatchers(HttpMethod.GET, "/api/tours/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/qr/admin/**").hasAnyRole("ADMIN", "OWNER")
                        // QR lookup: PUBLIC (guest scan QR không cần đăng nhập)
                        .requestMatchers(HttpMethod.GET, "/api/qr/**").permitAll()
                        // User management: ADMIN only
                        .requestMatchers(HttpMethod.GET, "/api/users/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/users/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/users/**").hasRole("ADMIN")
                        // POI write: ADMIN only
                        .requestMatchers(HttpMethod.POST, "/api/pois/**").hasAnyRole("ADMIN", "OWNER")
                        .requestMatchers(HttpMethod.PUT, "/api/pois/**").hasAnyRole("ADMIN", "OWNER")
                        .requestMatchers(HttpMethod.PATCH, "/api/pois/**").hasRole("ADMIN")
                        // Tour write: ADMIN only
                        .requestMatchers(HttpMethod.POST, "/api/tours/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/tours/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/tours/**").hasRole("ADMIN")
                        // QR create: ADMIN only
                        .requestMatchers(HttpMethod.POST, "/api/qr/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/uploads/images").hasAnyRole("ADMIN", "OWNER")
                        // All other requests: authenticated
                        .anyRequest().authenticated());

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
