package com.foodtour.api.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Entity ánh xạ bảng `qr_codes`
 *
 * QRCode dùng để:
 *  - Gắn với 1 POI cụ thể
 *  - Khi scan → xác định POI → trigger nội dung (audio / info)
 *
 * Các trường:
 *  - poi_id: FK tới bảng pois
 *  - qr_value: nội dung QR (string encode)
 *  - is_active: trạng thái QR còn sử dụng hay không
 */
@Entity
@Table(name = "qr_codes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QRCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // FK tới POI
    @Column(name = "poi_id")
    private Long poiId;

    // Giá trị QR (chuỗi encode)
    @Column(name = "qr_value", nullable = false, columnDefinition = "TEXT")
    private String qrValue;

    // Trạng thái hoạt động (true = dùng được)
    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    // Thời gian tạo (auto từ DB)
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}