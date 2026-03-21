package com.foodtour.api.controller;

import com.foodtour.api.dto.Session.CreateSessionRequest;
import com.foodtour.api.dto.Session.SessionResponse;
import com.foodtour.api.dto.Session.UpdateSessionRequest;
import com.foodtour.api.service.SessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {
    private final SessionService sessionService;

    @PostMapping
    public ResponseEntity<SessionResponse> createSession(@Valid @RequestBody CreateSessionRequest request) {
        return new ResponseEntity<>(sessionService.createSession(request), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SessionResponse> getSessionById(@PathVariable String id) {
        return ResponseEntity.ok(sessionService.getSessionById(id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<SessionResponse> updateSession(
            @PathVariable String id,
            @RequestBody UpdateSessionRequest request
            ) {
        return ResponseEntity.ok(sessionService.updateLanguageSession(id, request));
    }
}