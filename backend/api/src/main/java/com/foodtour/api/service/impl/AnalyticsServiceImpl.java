package com.foodtour.api.service.impl;

import com.foodtour.api.dto.PlayHistory.LogPlayHistoryRequest;
import com.foodtour.api.dto.PlayHistory.PlayHistoryResponse;
import com.foodtour.api.dto.PlayHistory.TopPoiResponse;
import com.foodtour.api.dto.PlayHistory.UpdateListeningDurationRequest;
import com.foodtour.api.dto.PoiResponse;
import com.foodtour.api.entity.PlayHistory;
import com.foodtour.api.entity.Poi;
import com.foodtour.api.repository.PlayHistoryRepository;
import com.foodtour.api.repository.PoiRepository;
import com.foodtour.api.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {
    private final PlayHistoryRepository playHistoryRepository;
    private final PoiRepository poiRepository;

    @Override
    public PlayHistoryResponse logPlayHistory (LogPlayHistoryRequest request) {
        PlayHistory playHistory = PlayHistory.builder()
                .sessionId(request.getSessionId())
                .poiId(request.getPoiId())
                .poiContentId(request.getPoiContentId())
                .triggerType(request.getTriggerType())
                .durationSeconds(request.getDurationSeconds())
                .build();
        playHistoryRepository.save(playHistory);
        return mapToPlayHistoryResponse(playHistory);
    }

    @Override
    public PlayHistoryResponse updateListeningDurationa(Long id, UpdateListeningDurationRequest request) {
        PlayHistory playHistory = playHistoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Play History not found with id: " + id));
        if (request.getDurationSeconds() != null) {
            playHistory.setDurationSeconds(request.getDurationSeconds());
        }
        playHistoryRepository.save(playHistory);
        return mapToPlayHistoryResponse(playHistory);
    }

    @Override
    public List<TopPoiResponse> getTop10Pois() {
        return playHistoryRepository.findTop10Pois()
                .stream()
                .map(row -> {
                    Long poiId = ((Number) row[0]).longValue();
                    Long playCount = ((Number) row[1]).longValue();
                    Poi poi = poiRepository.findById(poiId).orElse(null);
                    return TopPoiResponse.builder()
                            .playCount(playCount)
                            .poi(poi != null ? PoiResponse.builder()
                                    .id(poi.getId())
                                    .name(poi.getName())
                                    .latitude(poi.getLatitude())
                                    .longitude(poi.getLongitude())
                                    .build() : null)
                            .build();
                })
                .collect(Collectors.toList());
    }

    private PlayHistoryResponse mapToPlayHistoryResponse(PlayHistory playHistory) {
        return PlayHistoryResponse.builder()
                .id(playHistory.getId())
                .sessionId(playHistory.getSessionId())
                .poiId(playHistory.getPoiId())
                .poiContentId(playHistory.getPoiContentId())
                .triggerType(playHistory.getTriggerType())
                .playedAt(playHistory.getPlayedAt())
                .durationSeconds(playHistory.getDurationSeconds())
                .build();
    }
}
