package com.foodtour.api.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Entity ánh xạ bảng `tours` trong database.
 * Tour: hành trình tham quan được tạo bởi người dùng hoặc hệ thống.
 *
 * Các trường đặc trưng:
 *  - isSystem: tour do hệ thống tạo (true) hay người dùng tạo (false)
 *  - createdBy: FK tới users (người tạo tour). Nullable khi user bị xóa (SET NULL)
 *  - isActive: trạng thái hiển thị/ẩn tour
 */
@Entity
@Table(name = "tours")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tour {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Tên tour
    @Column(nullable = false, length = 255)
    private String name;

    // Mô tả chi tiết tour
    @Column(columnDefinition = "TEXT")
    private String description;

    // Tour do hệ thống tạo sẵn hay do người dùng tạo
    @Column(name = "is_system")
    @Builder.Default
    private Boolean isSystem = false;

    // FK tới bảng users (người tạo tour). Nullable vì user có thể bị xóa (ON DELETE SET NULL)
    @Column(name = "created_by")
    private Long createdBy;

    // Trạng thái hoạt động
    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
