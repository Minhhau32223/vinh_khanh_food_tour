package com.foodtour.api.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO trả về thông tin POI cho client.
 * Thêm field `distanceKm` → chỉ có giá trị khi gọi API nearby.
 * Các API list/detail thông thường sẽ có distanceKm = null.
 */
@Data
@Builder
public class PoiResponse {

    private Long id;
    private String name;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Integer triggerRadius;
    private Integer priority;
    private Boolean isActive;
    private String status;
    private Long ownerId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Khoảng cách tới điểm tìm kiếm (km).
     * Chỉ có giá trị khi gọi GET /api/pois/nearby.
     * null với các endpoint khác.
     */
    private Double distanceKm;
}
