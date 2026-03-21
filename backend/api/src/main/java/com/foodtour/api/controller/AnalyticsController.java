package com.foodtour.api.controller;

import com.foodtour.api.dto.PlayHistory.LogPlayHistoryRequest;
import com.foodtour.api.dto.PlayHistory.PlayHistoryResponse;
import com.foodtour.api.dto.PlayHistory.TopPoiResponse;
import com.foodtour.api.dto.PlayHistory.UpdateListeningDurationRequest;
import com.foodtour.api.dto.Session.SessionResponse;
import com.foodtour.api.dto.Session.UpdateSessionRequest;
import com.foodtour.api.service.AnalyticsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {
    private final AnalyticsService analyticsService;

    @PostMapping("/play-event")
    public ResponseEntity<PlayHistoryResponse> logPlayHistory (@Valid @RequestBody LogPlayHistoryRequest request) {
        return new ResponseEntity<>(analyticsService.logPlayHistory(request), HttpStatus.CREATED);
    }

    @PatchMapping("/play-event/{id}")
    public ResponseEntity<PlayHistoryResponse> updatePlayHistory(
            @PathVariable Long id,
            @RequestBody UpdateListeningDurationRequest request
    ) {
        return new ResponseEntity<>(analyticsService.updateListeningDurationa(id,request), HttpStatus.CREATED);
    }

    @GetMapping("/top-pois")
    public ResponseEntity<List<TopPoiResponse>> getTop10Pois() {
        return ResponseEntity.ok(analyticsService.getTop10Pois());
    }
}
