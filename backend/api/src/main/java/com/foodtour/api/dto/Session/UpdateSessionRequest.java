package com.foodtour.api.dto.Session;

import lombok.Data;

@Data
public class UpdateSessionRequest {
    private String preferredLanguage;
    /**
     * Nếu true, cập nhật {@link #currentTourId} (có thể null để rời tour).
     * Nếu false/absent, giữ nguyên tour hiện tại.
     */
    private Boolean patchTour;
    private Long currentTourId;
}
