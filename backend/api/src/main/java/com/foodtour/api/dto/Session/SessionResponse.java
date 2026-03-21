package com.foodtour.api.dto.Session;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SessionResponse {
    private String id;
    private String deviceId;
    private String preferredLanguage;
    private Long currentTourId;
    private LocalDateTime createdAt;
    private LocalDateTime expiredAt;
}