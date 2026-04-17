package com.foodtour.api.controller;

import com.foodtour.api.dto.PoiContentsRequest;
import com.foodtour.api.dto.PoiContentsResponse;
import com.foodtour.api.dto.PoiRequest;
import com.foodtour.api.dto.PoiResponse;
import com.foodtour.api.dto.offline.OfflinePackageResponse;
import com.foodtour.api.service.PoiContentsService;
import com.foodtour.api.service.PoiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

/**
 * REST Controller cho POI (Point of Interest).
 *
 * Phân quyền:
 *   - GET endpoints: Tất cả user đã đăng nhập
 *   - POST/PUT endpoints: Chỉ ADMIN
 *
 * Base URL: /api/pois
 */
@RestController
@RequestMapping("/api/pois")
@RequiredArgsConstructor
public class PoiController {

    private final PoiService poiService;
    private final PoiContentsService poiContentsService;

    /**
     * API 1: Lấy danh sách tất cả POI đang active.
     * GET /api/pois
     *
     * Response: List<PoiResponse> với distanceKm = null
     */
    @GetMapping
    public ResponseEntity<List<PoiResponse>> getAllPois() {
        return ResponseEntity.ok(poiService.getAllPois());
    }

    @GetMapping("/languages")
    public ResponseEntity<List<String>> getSupportedLanguages() {
        return ResponseEntity.ok(poiContentsService.getSupportedLanguages());
    }

    @GetMapping("/offline-package")
    public ResponseEntity<OfflinePackageResponse> getOfflinePackage(
            @RequestParam(name = "lang", defaultValue = "vi") String language) {
        return ResponseEntity.ok(poiContentsService.buildOfflinePackage(language));
    }

    /**
     * API 2: Lấy chi tiết một POI theo ID.
     * GET /api/pois/{id}
     *
     * Response: PoiResponse hoặc 404 nếu không tìm thấy
     */
    @GetMapping("/{id}")
    public ResponseEntity<PoiResponse> getPoiById(@PathVariable Long id) {
        return ResponseEntity.ok(poiService.getPoiById(id));
    }


    /**
     * API 3:  GEOFENCE — Tìm POI gần vị trí hiện tại.
     * GET /api/pois/nearby?lat=10.7769&lng=106.6952&radius=1.0
     *
     * @param lat    Vĩ độ của người dùng (bắt buộc)
     * @param lng    Kinh độ của người dùng (bắt buộc)
     * @param radius Bán kính tìm kiếm tính bằng km (mặc định 0.5 km = 500m)
     *
     * Response: List<PoiResponse> kèm distanceKm, sắp xếp gần nhất trước
     *
     * Ví dụ:
     *   GET /api/pois/nearby?lat=10.7769&lng=106.6952&radius=1.0
     *   → Tìm tất cả POI trong bán kính 1km từ tọa độ (10.7769, 106.6952)
     */
    @GetMapping("/nearby")
    public ResponseEntity<List<PoiResponse>> getNearbyPois(
            @RequestParam BigDecimal lat,
            @RequestParam BigDecimal lng,
            @RequestParam(defaultValue = "0.5") double radius) {
        return ResponseEntity.ok(poiService.getNearbyPois(lat, lng, radius));
    }

    /**
     * API 4: Tạo POI mới (chỉ ADMIN).
     * POST /api/pois
     * Header: Authorization: Bearer <token>
     *
     * Response: PoiResponse với HTTP 201 Created
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public ResponseEntity<PoiResponse> createPoi(@Valid @RequestBody PoiRequest request) {
        return new ResponseEntity<>(poiService.createPoi(request), HttpStatus.CREATED);
    }

    /**
     * API 5: Cập nhật POI (chỉ ADMIN).
     * PUT /api/pois/{id}
     * Header: Authorization: Bearer <token>
     *
     * Chỉ cần gửi những field muốn thay đổi.
     * Response: PoiResponse đã được cập nhật
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public ResponseEntity<PoiResponse> updatePoi(
            @PathVariable Long id,
            @RequestBody PoiRequest request) {
        return ResponseEntity.ok(poiService.updatePoi(id, request));
    }
    /**
     * API 5: Cập nhật Status Poi (chỉ ADMIN).
     * PATCH /api/pois/{id}/status
     * Header: Authorization: Bearer <token>
     *
     * Chỉ cần gửi những field muốn thay đổi.
     * Response: PoiResponse đã được cập nhật
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Boolean> updatePoiStatus(@PathVariable Long id) {
        return ResponseEntity.ok(poiService.updateStutus(id));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PoiResponse> approvePoi(@PathVariable Long id) {
        return ResponseEntity.ok(poiService.approvePoi(id));
    }

    @PostMapping(value = "/{poiId}/content", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public ResponseEntity<?> createPoiContentsMultipart(
            @PathVariable Long poiId,
            @RequestParam String title,
            @RequestParam(required = false, defaultValue = "") String description,
            @RequestParam String ttsScript,
            @RequestParam(required = false) String imageUrls,
            @RequestParam(required = false) List<MultipartFile> images
    ) {
        try {
            PoiContentsRequest request = PoiContentsRequest.builder()
                    .poiId(poiId)
                    .title(title)
                    .description(description)
                    .ttsScript(ttsScript)
                    .imageUrls(imageUrls)
                    .build();
            return ResponseEntity.ok(poiContentsService.createPoiContents(poiId, request, images));
        } catch (Exception ex) {
            System.err.println("[PoiController] createPoiContentsMultipart error poiId=" + poiId + ": " + ex.getMessage());
            ex.printStackTrace();
            return ResponseEntity.status(500).body(java.util.Map.of("message", ex.getMessage() != null ? ex.getMessage() : "Lỗi server không xác định"));
        }
    }

    @PostMapping(value = "/{poiId}/content", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public ResponseEntity<List<PoiContentsResponse>> createPoiContentsJson(
            @PathVariable Long poiId,
            @RequestBody PoiContentsRequest request
    ) throws Exception {
        return ResponseEntity.ok(poiContentsService.createPoiContents(poiId, request, null));
    }

    @PatchMapping(value = "/{poiId}/content/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public ResponseEntity<List<PoiContentsResponse>> updatePoiContents(
            @PathVariable Long poiId,
            @RequestParam(required = false) List<MultipartFile> images
    ) throws Exception {
        return ResponseEntity.ok(poiContentsService.updatePoiContents(poiId, images));
    }


    @GetMapping("/{id}/content/{language}")
    public ResponseEntity<PoiContentsResponse> getPoiContentsByIdLanguage(
            @PathVariable Long id,
            @PathVariable String language
    ) throws Exception {
        return ResponseEntity.ok(poiContentsService.getPoiContentsByIdLanguage(id, language));
    }

    @GetMapping("/{id}/contents")
    public ResponseEntity<List<PoiContentsResponse>> getPoiContents(@PathVariable Long id) {
        return ResponseEntity.ok(poiContentsService.getPoiContents(id));
    }



}
