package com.foodtour.api.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

/**
 * DTO nhận input khi tạo hoặc cập nhật POI.
 * Dùng chung cho POST (tạo mới) và PUT (cập nhật).
 */
@Data
public class PoiRequest {

    @NotBlank(message = "Name is required")
    private String name;

    // Vĩ độ: -90 (cực Nam) đến +90 (cực Bắc)
    @NotNull(message = "Latitude is required")
    @DecimalMin(value = "-90.0") @DecimalMax(value = "90.0")
    private BigDecimal latitude;

    // Kinh độ: -180 (Tây) đến +180 (Đông)
    @NotNull(message = "Longitude is required")
    @DecimalMin(value = "-180.0") @DecimalMax(value = "180.0")
    private BigDecimal longitude;

    // Bán kính geofence (mét), mặc định 50m
    private Integer triggerRadius = 50;

    // Độ ưu tiên hiển thị
    private Integer priority = 0;

    // Trạng thái POI
    private Boolean isActive = true;

    // ID chủ quán (nullable)
    private Long ownerId;
}
