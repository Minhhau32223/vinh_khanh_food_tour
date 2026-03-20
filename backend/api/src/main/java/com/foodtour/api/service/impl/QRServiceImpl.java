package com.foodtour.api.service.impl;

import com.foodtour.api.dto.Qr.CreateQRRequest;
import com.foodtour.api.dto.Qr.QRResponse;
import com.foodtour.api.entity.QRCode;
import com.foodtour.api.repository.QRCodeRepository;
import com.foodtour.api.service.QRService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class QRServiceImpl implements QRService {


    private  final QRCodeRepository qrCodeRepository;

    @Override
    public QRResponse createQR(Long poiId, CreateQRRequest request) {

        QRCode qr = QRCode.builder()
                .poiId(poiId)
                .qrValue(request.getQrValue())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        QRCode saved = qrCodeRepository.save(qr);
        return mapToResponse(saved);
    }

    private QRResponse mapToResponse(QRCode qr) {
        return QRResponse.builder()
                .id(qr.getId())
                .poiId(qr.getPoiId())
                .qrValue(qr.getQrValue())
                .isActive(qr.getIsActive())
                .createdAt(qr.getCreatedAt())
                .build();
    }
}

