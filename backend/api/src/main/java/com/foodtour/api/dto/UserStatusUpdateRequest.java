package com.foodtour.api.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserStatusUpdateRequest {
    @NotNull(message = "is_active status must be provided")
    private Boolean isActive;
}
