package com.foodtour.api.service.impl;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.foodtour.api.entity.Payment;
import com.foodtour.api.entity.Tour;
import com.foodtour.api.repository.PaymentRepository;
import com.foodtour.api.repository.TourRepository;
import com.foodtour.api.service.PaymentService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
    private final PaymentRepository paymentRepository;
    private final TourRepository tourRepository;

    @Override
    public boolean canJoinTour(String sessionId, Long tourId) {

        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new RuntimeException("Tour not found"));

        // miễn phí
        if (tour.getPrice() == null ||
                tour.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            return true;
        }

        // đã thanh toán chưa
        return paymentRepository
                .existsBySessionIdAndTourIdAndStatus(
                        sessionId,
                        tourId,
                        "SUCCESS");
    }

    @Override
    public List<Payment> findBySessionId(String sessionId) {
        return paymentRepository.findBySessionId(sessionId);
    }

    @Override
    public Optional<Payment> findByOrderId(String orderId) {
        return paymentRepository.findByOrderId(orderId);
    }

    @Override
    public void updatePaymentStatus(String orderId, String resultCode, String transId) {
        paymentRepository.findByOrderId(orderId).ifPresent(payment -> {
            payment.setStatus("0".equals(resultCode) ? "SUCCESS" : "FAILED");
            payment.setProviderTxId(transId);
            paymentRepository.save(payment);
        });
    }
}
