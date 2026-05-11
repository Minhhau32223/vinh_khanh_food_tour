package com.foodtour.api.service;

import com.foodtour.api.entity.Payment;
import java.util.List;
import java.util.Optional;

public interface PaymentService {
    boolean canJoinTour(String sessionId, Long tourId);
    List<Payment> findBySessionId(String sessionId);
    Optional<Payment> findByOrderId(String orderId);        // ← thêm
    void updatePaymentStatus(String orderId, String resultCode, String transId); // ← thêm
}