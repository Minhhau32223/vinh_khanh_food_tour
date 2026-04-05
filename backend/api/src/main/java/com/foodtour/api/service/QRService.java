package com.foodtour.api.service;

import com.foodtour.api.dto.Qr.CreateQRRequest;
import com.foodtour.api.dto.Qr.QRResponse;
import com.foodtour.api.dto.Qr.QrResolveResponse;

import java.util.List;

public interface QRService {
    QRResponse createQR(Long poiId, CreateQRRequest request);
    List<QRResponse> getAccessibleQrCodes();

    QrResolveResponse resolveByQrValue(String qrValue, String lang);
}



