package com.foodtour.api.controller;

import com.foodtour.api.dto.PlayHistory.LogPlayHistoryRequest;
import com.foodtour.api.dto.PlayHistory.PlayHistoryResponse;
import com.foodtour.api.dto.PlayHistory.TopPoiResponse;
import com.foodtour.api.dto.PlayHistory.UpdateListeningDurationRequest;
import com.foodtour.api.dto.analytics.AdminDashboardStatsResponse;
import com.foodtour.api.dto.analytics.LogLocationRequest;
import com.foodtour.api.service.AnalyticsService;
import com.foodtour.api.service.OnlineCounterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {
    private final AnalyticsService analyticsService;
    private final OnlineCounterService onlineCounterService;

    @PostMapping("/play-event")
    public ResponseEntity<PlayHistoryResponse> logPlayHistory(@Valid @RequestBody LogPlayHistoryRequest request) {
        return new ResponseEntity<>(analyticsService.logPlayHistory(request), HttpStatus.CREATED);
    }

    @PatchMapping("/play-event/{id}")
    public ResponseEntity<PlayHistoryResponse> updatePlayHistory(
            @PathVariable Long id,
            @RequestBody UpdateListeningDurationRequest request
    ) {
        return new ResponseEntity<>(analyticsService.updateListeningDurationa(id, request), HttpStatus.CREATED);
    }

    @GetMapping("/top-pois")
    public ResponseEntity<List<TopPoiResponse>> getTop10Pois(
            @RequestParam(name = "period", defaultValue = "all") String period) {
        return ResponseEntity.ok(analyticsService.getTop10Pois(parseTopPoisPeriodDays(period)));
    }

    @PostMapping("/location")
    public ResponseEntity<Void> logLocation(@Valid @RequestBody LogLocationRequest request) {
        analyticsService.logUserLocation(request);
        return ResponseEntity.accepted().build();
    }

    /** Tổng quan hệ thống — chỉ Admin. */
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminDashboardStatsResponse> getAdminDashboard() {
        return ResponseEntity.ok(analyticsService.getAdminDashboardStats());
    }

    /**
     * Danh sách thiết bị đang online theo Redis TTL — chỉ Admin.
     * Returns: { count: N, devices: ["deviceId1", "deviceId2", ...] }
     */
    @GetMapping("/online-devices")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getOnlineDevices() {
        try {
            List<Map<String, Object>> devices = onlineCounterService.readOnlineDevices();
            return ResponseEntity.ok(Map.of(
                "count", devices.size(),
                "devices", devices
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("count", 0, "devices", List.of()));
        }
    }

    /** PRD: 7d | 30d | all (hoặc 7 / 30). */
    private static Integer parseTopPoisPeriodDays(String period) {
        if (period == null || period.isBlank()) return null;
        String p = period.trim();
        if ("all".equalsIgnoreCase(p)) return null;
        if ("7d".equalsIgnoreCase(p) || "7".equals(p)) return 7;
        if ("30d".equalsIgnoreCase(p) || "30".equals(p)) return 30;
        return null;
    }
}
