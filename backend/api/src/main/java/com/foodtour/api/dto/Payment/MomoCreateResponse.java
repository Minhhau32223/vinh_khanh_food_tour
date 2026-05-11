package com.foodtour.api.dto.Payment;

import lombok.Data;

@Data
public class MomoCreateResponse {
    private String payUrl;
    private String orderId;
    private int resultCode;
    private String message;
}