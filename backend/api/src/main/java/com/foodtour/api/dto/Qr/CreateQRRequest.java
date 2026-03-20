package com.foodtour.api.dto.Qr;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateQRRequest {

    @NotBlank(message = "QR value cannot be blank")
    private String qrValue;

    private Boolean isActive = true;
}