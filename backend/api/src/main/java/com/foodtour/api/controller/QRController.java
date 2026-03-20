package com.foodtour.api.controller;

import com.foodtour.api.dto.Qr.CreateQRRequest;
import com.foodtour.api.dto.Qr.QRResponse;
import com.foodtour.api.service.QRService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/qr")
@RequiredArgsConstructor
public class QRController {

    private final QRService qrService;

    // POST /api/qr/{poiId}
    @PostMapping("/{poiId}")
    public QRResponse createQR(
            @PathVariable Long poiId,
            @RequestBody CreateQRRequest request
    ) {
        return qrService.createQR(poiId, request);
    }
}