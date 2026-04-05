package com.foodtour.api.service.impl;

import com.foodtour.api.dto.PoiRequest;
import com.foodtour.api.dto.PoiResponse;
import com.foodtour.api.entity.Poi;
import com.foodtour.api.repository.PoiRepository;
import com.foodtour.api.security.CustomUserDetails;
import com.foodtour.api.service.PoiContentsService;
import com.foodtour.api.service.PoiService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Hiện thực nghiệp vụ của POI.
 *
 * GEOFENCE LOGIC (getNearbyPois):
 * ─────────────────────────────────────────────────────
 * Bước 1: Lấy tất cả POI active từ DB
 * Bước 2: Với mỗi POI, tính khoảng cách tới điểm tìm kiếm
 *         bằng công thức HAVERSINE (chính xác trên mặt cầu)
 * Bước 3: Lọc những POI có distance <= radiusKm
 * Bước 4: Sắp xếp theo khoảng cách tăng dần (gần nhất trước)
 * Bước 5: Thêm distanceKm vào response
 * ─────────────────────────────────────────────────────
 */
@Service
@RequiredArgsConstructor
public class PoiServiceImpl implements PoiService {

    private final PoiRepository poiRepository;
    private final PoiContentsService poiContentsService;

    // Bán kính Trái Đất tính bằng km (dùng cho Haversine)
    private static final double EARTH_RADIUS_KM = 6371.0;

    @Override
    public List<PoiResponse> getAllPois() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return poiRepository.findByIsActiveTrueAndStatus("APPROVED").stream()
                    .map(poi -> mapToResponse(poi, null))
                    .collect(Collectors.toList());
        }
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        if ("ADMIN".equals(userDetails.getUser().getRole())) {
            return poiRepository.findAll().stream()
                    .map(poi -> mapToResponse(poi, null))
                    .collect(Collectors.toList());
        }
        if ("OWNER".equals(userDetails.getUser().getRole())) {
            return poiRepository.findByOwnerId(userDetails.getUser().getId()).stream()
                    .map(poi -> mapToResponse(poi, null))
                    .collect(Collectors.toList());
        }
        return poiRepository.findByIsActiveTrueAndStatus("APPROVED").stream()
                .map(poi -> mapToResponse(poi, null))
                .collect(Collectors.toList());
    }

    @Override
    public PoiResponse getPoiById(Long id) {
        Poi poi = poiRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("POI not found with id: " + id));
        return mapToResponse(poi, null);
    }

    /**
     * Tìm POI gần tọa độ (lat, lng) trong radius (km).
     *
     * Công thức Haversine:
     *   a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlng/2)
     *   c = 2 × atan2(√a, √(1−a))
     *   d = R × c  (R = 6371 km)
     *
     * Đơn vị đầu vào: độ (degree), phải convert sang radian trước khi tính.
     */
    @Override
    public List<PoiResponse> getNearbyPois(BigDecimal lat, BigDecimal lng, double radiusKm) {
        double searchLat = lat.doubleValue();
        double searchLng = lng.doubleValue();

        return poiRepository.findByIsActiveTrue()
                .stream()
                // Bước 2: Tính distance cho từng POI
                .map(poi -> {
                    double distance = haversineDistance(
                            searchLat, searchLng,
                            poi.getLatitude().doubleValue(),
                            poi.getLongitude().doubleValue()
                    );
                    // Thêm distance vào POI để dùng sau
                    return new PoiWithDistance(poi, distance);
                })
                // Bước 3: Lọc trong radius
                .filter(pwd -> pwd.distance <= radiusKm)
                // Bước 4: Sắp xếp gần nhất trước
                .sorted(Comparator.comparingDouble(pwd -> pwd.distance))
                // Bước 5: Map sang response kèm distanceKm
                .map(pwd -> mapToResponse(pwd.poi, Math.round(pwd.distance * 1000.0) / 1000.0))
                .collect(Collectors.toList());
    }

    @Override
    public PoiResponse createPoi(PoiRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        boolean isAdmin = "ADMIN".equals(userDetails.getUser().getRole());
        Poi poi = Poi.builder()
                .name(request.getName())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .triggerRadius(request.getTriggerRadius() != null ? request.getTriggerRadius() : 50)
                .priority(request.getPriority() != null ? request.getPriority() : 0)
                .isActive(isAdmin ? (request.getIsActive() != null ? request.getIsActive() : true) : false)
                .status(isAdmin ? "APPROVED" : "PENDING")
                .ownerId(isAdmin ? request.getOwnerId() : userDetails.getUser().getId())
                .build();

        return mapToResponse(poiRepository.save(poi), null);
    }

    @Override
    public PoiResponse updatePoi(Long id, PoiRequest request) {
        Poi poi = poiRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("POI not found with id: " + id));

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        boolean isAdmin = "ADMIN".equals(userDetails.getUser().getRole());
        if (!isAdmin && !userDetails.getUser().getId().equals(poi.getOwnerId())) {
            throw new AccessDeniedException("Owner can only edit own POI");
        }

        if (request.getName() != null) poi.setName(request.getName());
        if (request.getLatitude() != null) poi.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) poi.setLongitude(request.getLongitude());
        if (request.getTriggerRadius() != null) poi.setTriggerRadius(request.getTriggerRadius());
        if (request.getPriority() != null) poi.setPriority(request.getPriority());
        if (isAdmin && request.getIsActive() != null) poi.setIsActive(request.getIsActive());
        if (isAdmin && request.getOwnerId() != null) poi.setOwnerId(request.getOwnerId());

        return mapToResponse(poiRepository.save(poi), null);
    }

    @Override
    public Boolean updateStutus(Long id) {
        Poi poi = poiRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("POI not found with id: " + id));
        poi.setIsActive(!poi.getIsActive());
        poiRepository.save(poi);
        return Boolean.TRUE;
    }

    @Override
    public PoiResponse approvePoi(Long id) {
        Poi poi = poiRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("POI not found with id: " + id));
        poi.setStatus("APPROVED");
        poi.setIsActive(true);
        Poi saved = poiRepository.save(poi);
        try {
            poiContentsService.translateAndGenerateForPoi(id);
        } catch (Exception e) {
            throw new RuntimeException("POI approved but translate/audio failed: " + e.getMessage(), e);
        }
        return mapToResponse(saved, null);
    }

    // ─────────────────────────────────────────────────────
    // CÔNG THỨC HAVERSINE
    // Tính khoảng cách km giữa 2 tọa độ (lat1,lng1) và (lat2,lng2)
    // ─────────────────────────────────────────────────────
    private double haversineDistance(double lat1, double lng1, double lat2, double lng2) {
        // Convert từ độ sang radian (rad = deg × π/180)
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);

        double lat1Rad = Math.toRadians(lat1);
        double lat2Rad = Math.toRadians(lat2);

        // Haversine formula
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(lat1Rad) * Math.cos(lat2Rad)
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS_KM * c; // km
    }

    // Helper class nội bộ để carry distance cùng với POI
    private record PoiWithDistance(Poi poi, double distance) {}

    // ─────────────────────────────────────────────────────
    // Helper: convert Poi entity → PoiResponse DTO
    // distanceKm = null với các API thường, có giá trị với nearby
    // ─────────────────────────────────────────────────────
    private PoiResponse mapToResponse(Poi poi, Double distanceKm) {
        return PoiResponse.builder()
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
                .distanceKm(distanceKm)
                .build();
    }
}
