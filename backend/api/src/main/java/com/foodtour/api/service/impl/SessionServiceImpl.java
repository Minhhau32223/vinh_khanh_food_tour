package com.foodtour.api.service.impl;

import com.foodtour.api.dto.PoiResponse;
import com.foodtour.api.dto.Session.CreateSessionRequest;
import com.foodtour.api.dto.Session.SessionResponse;
import com.foodtour.api.dto.Session.UpdateSessionRequest;
import com.foodtour.api.entity.Poi;
import com.foodtour.api.entity.Session;
import com.foodtour.api.repository.SessionRepository;
import com.foodtour.api.service.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SessionServiceImpl implements SessionService {
    private final SessionRepository sessionRepository;

    @Override
    public SessionResponse createSession (CreateSessionRequest request) {
        Session session = Session.builder()
                .deviceId(request.getDeviceId())
                .preferredLanguage(
                        request.getPreferredLanguage() != null
                                ? request.getPreferredLanguage()
                                : "vi"
                )
                .currentTourId(null)
                .expiredAt(LocalDateTime.now().plusDays(30))
                .build();
        sessionRepository.save(session);
        return mapToResponse(session);
    }

    @Override
    public SessionResponse getSessionById(String id) {
        Session session = sessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Session not found with id: " + id));
        return mapToResponse(session);
    }

    @Override
    public SessionResponse updateLanguageSession(String id, UpdateSessionRequest request) {
        Session session = sessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Session not found with id: " + id));
        if (request.getPreferredLanguage() != null) {
            session.setPreferredLanguage(request.getPreferredLanguage());
        }
        sessionRepository.save(session);
        return mapToResponse(session);
    }

    // mapper session entity -> sessionresponse dto
    private SessionResponse mapToResponse(Session session) {
        return SessionResponse.builder()
                .id(session.getId() != null ? session.getId().toString() : null)
                .deviceId(session.getDeviceId())
                .preferredLanguage(session.getPreferredLanguage())
                .currentTourId(session.getCurrentTourId())
                .createdAt(session.getCreatedAt())
                .expiredAt(session.getExpiredAt())
                .build();
    }
}
