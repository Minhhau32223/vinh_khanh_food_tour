package com.foodtour.api.controller;

import com.foodtour.api.dto.Qr.CreateQRRequest;
import com.foodtour.api.dto.Qr.QRResponse;
import com.foodtour.api.dto.Qr.QrResolveResponse;
import com.foodtour.api.service.QRService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/qr")
@RequiredArgsConstructor
public class QRController {

    private final QRService qrService;

    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public ResponseEntity<List<QRResponse>> getAccessibleQrCodes() {
        return ResponseEntity.ok(qrService.getAccessibleQrCodes());
    }

    @PostMapping("/{poiId}")
    public QRResponse createQR(
            @PathVariable Long poiId,
            @RequestBody(required = false) CreateQRRequest request
    ) {
        if (request == null) {
            request = new CreateQRRequest();
        }
        return qrService.createQR(poiId, request);
    }

    /** Guest: quét QR → POI + content (không cần GPS). */
    @GetMapping("/{qrValue}")
    public ResponseEntity<QrResolveResponse> resolve(
            @PathVariable String qrValue,
            @RequestParam(required = false, defaultValue = "vi") String lang
    ) {
        return ResponseEntity.ok(qrService.resolveByQrValue(qrValue, lang));
    }
}
