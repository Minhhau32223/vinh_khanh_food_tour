package com.foodtour.api.dto.Session;

import lombok.Data;

@Data
public class CreateSessionRequest {
    private String deviceId;
    private String preferredLanguage;
}
