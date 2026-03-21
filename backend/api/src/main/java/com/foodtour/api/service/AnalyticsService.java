package com.foodtour.api.service;

import com.foodtour.api.dto.PlayHistory.LogPlayHistoryRequest;
import com.foodtour.api.dto.PlayHistory.PlayHistoryResponse;
import com.foodtour.api.dto.PlayHistory.TopPoiResponse;
import com.foodtour.api.dto.PlayHistory.UpdateListeningDurationRequest;

import java.util.List;

public interface AnalyticsService {
    PlayHistoryResponse logPlayHistory (LogPlayHistoryRequest request);
    PlayHistoryResponse updateListeningDurationa(Long id, UpdateListeningDurationRequest request);
    List<TopPoiResponse> getTop10Pois();
}
