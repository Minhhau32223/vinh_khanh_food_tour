package com.foodtour.api.dto.analytics;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class LogLocationRequest {
    private String sessionId;
    @NotNull
    private BigDecimal latitude;
    @NotNull
    private BigDecimal longitude;
}
