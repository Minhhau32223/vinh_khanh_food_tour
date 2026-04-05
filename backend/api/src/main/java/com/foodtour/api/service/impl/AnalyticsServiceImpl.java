package com.foodtour.api.service.impl;

import com.foodtour.api.dto.PlayHistory.LogPlayHistoryRequest;
import com.foodtour.api.dto.PlayHistory.PlayHistoryResponse;
import com.foodtour.api.dto.PlayHistory.TopPoiResponse;
import com.foodtour.api.dto.PlayHistory.UpdateListeningDurationRequest;
import com.foodtour.api.dto.PoiResponse;
import com.foodtour.api.dto.analytics.AdminDashboardStatsResponse;
import com.foodtour.api.dto.analytics.LogLocationRequest;
import com.foodtour.api.dto.analytics.TriggerTypeCountResponse;
import com.foodtour.api.entity.PlayHistory;
import com.foodtour.api.entity.Poi;
import com.foodtour.api.entity.UserLocation;
import com.foodtour.api.repository.PlayHistoryRepository;
import com.foodtour.api.repository.PoiRepository;
import com.foodtour.api.repository.SessionRepository;
import com.foodtour.api.repository.TourRepository;
import com.foodtour.api.repository.UserLocationRepository;
import com.foodtour.api.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {
    private final PlayHistoryRepository playHistoryRepository;
    private final PoiRepository poiRepository;
    private final TourRepository tourRepository;
    private final SessionRepository sessionRepository;
    private final UserLocationRepository userLocationRepository;

    @Override
    public PlayHistoryResponse logPlayHistory (LogPlayHistoryRequest request) {
        PlayHistory playHistory = PlayHistory.builder()
                .sessionId(request.getSessionId())
                .poiId(request.getPoiId())
                .poiContentId(request.getPoiContentId())
                .triggerType(request.getTriggerType())
                .language(request.getLanguage())
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
    public List<TopPoiResponse> getTop10Pois(Integer periodDays) {
        return playHistoryRepository.findTop10PoisWithAvgDuration(periodDays)
                .stream()
                .map(row -> {
                    Long poiId = ((Number) row[0]).longValue();
                    Long playCount = ((Number) row[1]).longValue();
                    Double avgDuration = null;
                    if (row[2] != null) {
                        if (row[2] instanceof Number n) {
                            avgDuration = n.doubleValue();
                        }
                    }
                    Poi poi = poiRepository.findById(poiId).orElse(null);
                    String poiName = poi != null ? poi.getName() : ("POI #" + poiId);
                    return TopPoiResponse.builder()
                            .poiId(poiId)
                            .poiName(poiName)
                            .avgDurationSeconds(avgDuration)
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

    @Override
    @Transactional
    public void logUserLocation(LogLocationRequest request) {
        UserLocation row = UserLocation.builder()
                .sessionId(request.getSessionId())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .build();
        userLocationRepository.save(row);
    }

    @Override
    public AdminDashboardStatsResponse getAdminDashboardStats() {
        long totalPois = poiRepository.count();
        long pendingPois = poiRepository.countByStatus("PENDING");
        long approvedPois = poiRepository.countByStatus("APPROVED");
        long approvedActivePois = poiRepository.countByStatusAndIsActive("APPROVED", true);

        long totalTours = tourRepository.count();
        long activeTours = tourRepository.countByIsActiveTrue();
        long totalSessions = sessionRepository.count();
        long totalPlayEvents = playHistoryRepository.count();

        Long sumDur = playHistoryRepository.sumDurationSeconds();
        long totalListening = sumDur != null ? sumDur : 0L;
        Double avgPerPlay = playHistoryRepository.avgDurationSecondsWherePresent();

        List<TriggerTypeCountResponse> byTrigger = new ArrayList<>();
        for (Object[] row : playHistoryRepository.countGroupedByTriggerType()) {
            String tt = row[0] != null ? row[0].toString() : "UNKNOWN";
            long cnt = ((Number) row[1]).longValue();
            byTrigger.add(TriggerTypeCountResponse.builder().triggerType(tt).count(cnt).build());
        }

        return AdminDashboardStatsResponse.builder()
                .totalPois(totalPois)
                .pendingPois(pendingPois)
                .approvedPois(approvedPois)
                .approvedActivePois(approvedActivePois)
                .totalTours(totalTours)
                .activeTours(activeTours)
                .totalSessions(totalSessions)
                .totalPlayEvents(totalPlayEvents)
                .totalListeningSecondsRecorded(totalListening)
                .avgListeningSecondsPerPlayWithDuration(avgPerPlay)
                .playsByTriggerType(byTrigger)
                .build();
    }

    private PlayHistoryResponse mapToPlayHistoryResponse(PlayHistory playHistory) {
        return PlayHistoryResponse.builder()
                .id(playHistory.getId())
                .sessionId(playHistory.getSessionId())
                .poiId(playHistory.getPoiId())
                .poiContentId(playHistory.getPoiContentId())
                .triggerType(playHistory.getTriggerType())
                .language(playHistory.getLanguage())
                .playedAt(playHistory.getPlayedAt())
                .durationSeconds(playHistory.getDurationSeconds())
                .build();
    }
}
