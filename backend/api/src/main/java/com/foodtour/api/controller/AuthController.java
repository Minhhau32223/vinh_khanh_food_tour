package com.foodtour.api.controller;

import com.foodtour.api.dto.LoginRequest;
import com.foodtour.api.dto.LoginResponse;
import com.foodtour.api.dto.RegisterRequest;
import com.foodtour.api.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(userService.login(loginRequest));
    }

    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@Valid @RequestBody RegisterRequest registerRequest) {
        return new ResponseEntity<>(userService.register(registerRequest), HttpStatus.CREATED);
    }
}
