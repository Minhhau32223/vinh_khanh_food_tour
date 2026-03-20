package com.foodtour.api.service;

import com.foodtour.api.dto.Session.CreateSessionRequest;
import com.foodtour.api.dto.Session.SessionResponse;
import com.foodtour.api.dto.Session.UpdateSessionRequest;

public interface SessionService {
    SessionResponse createSession (CreateSessionRequest request);
    SessionResponse getSessionById(String id);
    SessionResponse updateLanguageSession(String id, UpdateSessionRequest request);
}