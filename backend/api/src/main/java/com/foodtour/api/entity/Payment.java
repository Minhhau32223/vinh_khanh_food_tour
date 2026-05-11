package com.foodtour.api.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity ánh xạ bảng `payments`.
 * Lưu thông tin thanh toán của người dùng cho tour.
 *
 * Các trường:
 *  - sessionId: session người dùng thực hiện thanh toán
 *  - tourId: tour được thanh toán
 *  - amount: số tiền
 *  - status: trạng thái thanh toán (PENDING, SUCCESS, FAILED...)
 *  - provider: nhà cung cấp thanh toán (MOMO, VNPAY, PAYPAL...)
 *  - providerTxId: mã giao dịch từ phía provider
 */
@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // FK tới bảng sessions
    @Column(name = "session_id", nullable = false, length = 36)
    private String sessionId;

    // FK tới bảng tours
    @Column(name = "tour_id", nullable = false)
    private Long tourId;

    // Số tiền thanh toán
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    // Trạng thái thanh toán
    // Ví dụ: PENDING, SUCCESS, FAILED
    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "PENDING";

    // Nhà cung cấp thanh toán
    // Ví dụ: MOMO, VNPAY, PAYPAL
    @Column(nullable = false, length = 20)
    private String provider;

    // Mã giao dịch trả về từ provider
    @Column(name = "provider_tx_id", length = 100)
    private String providerTxId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "order_id")
    private String orderId; // mã đơn hàng gửi sang MoMo
}