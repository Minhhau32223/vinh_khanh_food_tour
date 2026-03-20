package com.foodtour.api.service;

import com.foodtour.api.dto.Qr.CreateQRRequest;
import com.foodtour.api.dto.Qr.QRResponse;

public interface QRService {
    QRResponse createQR(Long poiId, CreateQRRequest request);
}




