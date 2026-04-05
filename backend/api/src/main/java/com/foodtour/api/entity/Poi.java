package com.foodtour.api.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity ánh xạ bảng `pois` trong database.
 * POI = Point of Interest: điểm thuyết minh / quán ăn / địa điểm.
 *
 * Các trường đặc trưng:
 *  - latitude/longitude: tọa độ GPS của POI
 *  - trigger_radius: bán kính (mét) để kích hoạt geofence
 *  - priority: thứ tự ưu tiên hiển thị (số nhỏ hơn = ưu tiên cao hơn)
 *  - owner_id: FK tới users (chủ quán/owner)
 */
@Entity
@Table(name = "pois")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Poi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Tên của POI / quán ăn
    @Column(nullable = false, length = 255)
    private String name;

    // Vĩ độ (latitude): -90 đến 90
    @Column(nullable = false, precision = 10, scale = 7)
    private BigDecimal latitude;

    // Kinh độ (longitude): -180 đến 180
    @Column(nullable = false, precision = 10, scale = 7)
    private BigDecimal longitude;

    // Bán kính geofence tính bằng mét (mặc định 50m)
    @Column(name = "trigger_radius")
    @Builder.Default
    private Integer triggerRadius = 50;

    // Độ ưu tiên hiển thị (0 = thấp nhất)
    @Builder.Default
    private Integer priority = 0;

    // Trạng thái hoạt động
    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    // Trạng thái duyệt POI: PENDING | APPROVED
    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "PENDING";

    // FK tới bảng users (owner/chủ quán). Nullable vì POI có thể không có owner
    @Column(name = "owner_id")
    private Long ownerId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
