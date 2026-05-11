// service/impl/MomoServiceImpl.java
package com.foodtour.api.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.foodtour.api.entity.Payment;
import com.foodtour.api.repository.PaymentRepository;
import com.foodtour.api.repository.TourRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.*;

@Service
@RequiredArgsConstructor
public class MomoServiceImpl {

    @Value("${momo.partner-code}") private String partnerCode;
    @Value("${momo.access-key}")   private String accessKey;
    @Value("${momo.secret-key}")   private String secretKey;
    @Value("${momo.endpoint}")     private String endpoint;
    @Value("${momo.redirect-url}") private String redirectUrl;
    @Value("${momo.ipn-url}")      private String ipnUrl;

    private final PaymentRepository paymentRepository;
    private final TourRepository    tourRepository;
    private final ObjectMapper      objectMapper;

    public String createPayment(String sessionId, Long tourId) throws Exception {
        var tour   = tourRepository.findById(tourId).orElseThrow();
        String orderId    = "TOUR_" + tourId + "_" + sessionId + "_" + System.currentTimeMillis();
        String requestId  = UUID.randomUUID().toString();
        long   amount     = tour.getPrice().longValue();
        String orderInfo  = "Thanh toan tour: " + tour.getName();
        String extraData  = "";
        String requestType = "captureWallet"; 

        // Tạo chữ ký HMAC SHA256
        String rawHash = String.format(
            "accessKey=%s&amount=%d&extraData=%s&ipnUrl=%s&orderId=%s&orderInfo=%s&partnerCode=%s&redirectUrl=%s&requestId=%s&requestType=%s",
            accessKey, amount, extraData, ipnUrl, orderId, orderInfo,
            partnerCode, redirectUrl, requestId, requestType
        );
        String signature = hmacSHA256(secretKey, rawHash);

        // Build request body
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("partnerCode", partnerCode);
        body.put("accessKey",   accessKey);
        body.put("requestId",   requestId);
        body.put("amount",      amount);
        body.put("orderId",     orderId);
        body.put("orderInfo",   orderInfo);
        body.put("redirectUrl", redirectUrl);
        body.put("ipnUrl",      ipnUrl);
        body.put("extraData",   extraData);
        body.put("requestType", requestType);
        body.put("signature",   signature);
        body.put("lang",        "vi");

        // Gọi MoMo API
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(endpoint))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        Map<?, ?> result = objectMapper.readValue(response.body(), Map.class);

        String payUrl = (String) result.get("payUrl");
        if (payUrl == null) throw new RuntimeException("MoMo error: " + result.get("message"));

        // Lưu payment PENDING
        paymentRepository.save(Payment.builder()
            .sessionId(sessionId)
            .tourId(tourId)
            .amount(BigDecimal.valueOf(amount))
            .status("PENDING")
            .provider("MOMO")
            .orderId(orderId)
            .build());

        return payUrl;
    }

    public void handleCallback(Map<String, String> params) throws Exception {
        String orderId    = params.get("orderId");
        String resultCode = params.get("resultCode");
        String transId    = params.get("transId");

        // Verify chữ ký callback
        String rawHash = String.format(
            "accessKey=%s&amount=%s&extraData=%s&message=%s&orderId=%s&orderInfo=%s&orderType=%s&partnerCode=%s&payType=%s&requestId=%s&responseTime=%s&resultCode=%s&transId=%s",
            accessKey, params.get("amount"), params.get("extraData"),
            params.get("message"), orderId, params.get("orderInfo"),
            params.get("orderType"), partnerCode, params.get("payType"),
            params.get("requestId"), params.get("responseTime"),
            resultCode, transId
        );
        String expected  = hmacSHA256(secretKey, rawHash);
        String received  = params.get("signature");
        if (!expected.equals(received)) throw new RuntimeException("Invalid signature");

        paymentRepository.findByOrderId(orderId).ifPresent(payment -> {
            payment.setStatus("0".equals(resultCode) ? "SUCCESS" : "FAILED");
            payment.setProviderTxId(transId);
            paymentRepository.save(payment);
        });
    }

    private String hmacSHA256(String key, String data) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(key.getBytes(), "HmacSHA256"));
        byte[] bytes = mac.doFinal(data.getBytes());
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) sb.append(String.format("%02x", b));
        return sb.toString();
    }
}