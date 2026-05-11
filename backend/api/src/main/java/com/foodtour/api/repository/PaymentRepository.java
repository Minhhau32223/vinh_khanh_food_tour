package com.foodtour.api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.foodtour.api.entity.Payment;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    // kiểm tra xem tour đó đã thanh toán chưa 
    boolean existsBySessionIdAndTourIdAndStatus(
            String sessionId,
            Long tourId,
            String status);
    List<Payment> findBySessionId(String sessionId);
    Optional<Payment> findByOrderId(String orderId);
}
