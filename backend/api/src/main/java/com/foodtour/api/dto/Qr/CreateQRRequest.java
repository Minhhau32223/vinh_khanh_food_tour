package com.foodtour.api.dto.Qr;

import lombok.Data;

@Data
public class CreateQRRequest {

    /** Nếu để trống, hệ thống tự sinh UUID. */
    private String qrValue;

    private Boolean isActive = true;
}