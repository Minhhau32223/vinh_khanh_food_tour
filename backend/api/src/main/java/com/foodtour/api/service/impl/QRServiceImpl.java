package com.foodtour.api.service.impl;

import com.foodtour.api.dto.PoiContentsResponse;
import com.foodtour.api.dto.PoiResponse;
import com.foodtour.api.dto.Qr.CreateQRRequest;
import com.foodtour.api.dto.Qr.QRResponse;
import com.foodtour.api.dto.Qr.QrResolveResponse;
import com.foodtour.api.entity.Poi;
import com.foodtour.api.entity.QRCode;
import com.foodtour.api.repository.PoiRepository;
import com.foodtour.api.repository.QRCodeRepository;
import com.foodtour.api.security.CustomUserDetails;
import com.foodtour.api.service.PoiContentsService;
import com.foodtour.api.service.QRService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QRServiceImpl implements QRService {

    private final QRCodeRepository qrCodeRepository;
    private final PoiRepository poiRepository;
    private final PoiContentsService poiContentsService;

    @Override
    @Transactional
    public QRResponse createQR(Long poiId, CreateQRRequest request) {
        if (!poiRepository.existsById(poiId)) {
            throw new RuntimeException("POI not found: " + poiId);
        }

        List<QRCode> existing = qrCodeRepository.findByPoiId(poiId);
        for (QRCode q : existing) {
            q.setIsActive(false);
            qrCodeRepository.save(q);
        }

        String val = (request.getQrValue() == null || request.getQrValue().isBlank())
                ? UUID.randomUUID().toString()
                : request.getQrValue();

        QRCode qr = QRCode.builder()
                .poiId(poiId)
                .qrValue(val)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        QRCode saved = qrCodeRepository.save(qr);
        return mapToResponse(saved);
    }

    @Override
    public List<QRResponse> getAccessibleQrCodes() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new RuntimeException("Authentication required");
        }

        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        String role = userDetails.getUser().getRole();

        return qrCodeRepository.findAll().stream()
                .filter(qr -> {
                    if ("ADMIN".equals(role)) {
                        return true;
                    }
                    if ("OWNER".equals(role)) {
                        return poiRepository.findById(qr.getPoiId())
                                .map(poi -> userDetails.getUser().getId().equals(poi.getOwnerId()))
                                .orElse(false);
                    }
                    return false;
                })
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public QrResolveResponse resolveByQrValue(String qrValue, String lang) {
        QRCode qr = qrCodeRepository.findFirstByQrValueAndIsActiveTrue(qrValue)
                .orElseThrow(() -> new RuntimeException("QR not found or inactive"));

        Poi poi = poiRepository.findById(qr.getPoiId())
                .orElseThrow(() -> new RuntimeException("POI not found"));

        if (!"APPROVED".equals(poi.getStatus()) || !Boolean.TRUE.equals(poi.getIsActive())) {
            throw new RuntimeException("POI not available");
        }

        String want = (lang == null || lang.isBlank()) ? "vi" : lang;
        boolean fallback = false;
        PoiContentsResponse content;
        try {
            content = poiContentsService.getPoiContentsByIdLanguage(poi.getId(), want);
        } catch (Exception e) {
            if (!"vi".equals(want)) {
                try {
                    content = poiContentsService.getPoiContentsByIdLanguage(poi.getId(), "vi");
                    fallback = true;
                } catch (Exception e2) {
                    throw new RuntimeException("No content for POI");
                }
            } else {
                throw new RuntimeException("No content for POI");
            }
        }

        PoiResponse poiDto = PoiResponse.builder()
                .id(poi.getId())
                .name(poi.getName())
                .latitude(poi.getLatitude())
                .longitude(poi.getLongitude())
                .triggerRadius(poi.getTriggerRadius())
                .priority(poi.getPriority())
                .isActive(poi.getIsActive())
                .status(poi.getStatus())
                .ownerId(poi.getOwnerId())
                .createdAt(poi.getCreatedAt())
                .updatedAt(poi.getUpdatedAt())
                .build();

        return QrResolveResponse.builder()
                .qrValue(qrValue)
                .poi(poiDto)
                .content(content)
                .language(fallback ? "vi" : want)
                .usedFallbackToVietnamese(fallback)
                .build();
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
