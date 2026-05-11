package com.foodtour.api.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.foodtour.api.entity.Payment;
import com.foodtour.api.service.PaymentService;
import com.foodtour.api.service.impl.MomoServiceImpl;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;
    private final MomoServiceImpl momoService;

    @GetMapping("/{tourId}/can-join")
    public ResponseEntity<Boolean> canJoinTour(
            @PathVariable Long tourId,
            @RequestParam String sessionId) {
        return ResponseEntity.ok(
                paymentService.canJoinTour(sessionId, tourId));
    }

    @PostMapping("/momo/create")
    public ResponseEntity<Map<String, String>> createMomoPayment(
            @RequestParam String sessionId,
            @RequestParam Long tourId) throws Exception {
        String payUrl = momoService.createPayment(sessionId, tourId);
        return ResponseEntity.ok(Map.of("payUrl", payUrl));
    }

    @GetMapping("/momo/redirect")
    public void momoRedirect(
            @RequestParam Map<String, String> params,
            HttpServletResponse response) throws Exception {

        String orderId = params.get("orderId");
        String resultCode = params.get("resultCode");
        String transId = params.get("transId");

        // ✅ Qua service
        paymentService.updatePaymentStatus(orderId, resultCode, transId);

        String query = params.entrySet().stream()
                .map(e -> e.getKey() + "=" + e.getValue())
                .collect(java.util.stream.Collectors.joining("&"));

        response.sendRedirect("http://192.168.1.16:3000/payment/result?" + query);
    }

    @PostMapping("/momo/callback")
    public ResponseEntity<Void> momoCallback(@RequestBody Map<String, String> params) throws Exception {
        momoService.handleCallback(params);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<Payment>> getBySession(@PathVariable String sessionId) {
        return ResponseEntity.ok(paymentService.findBySessionId(sessionId));
    }
}
