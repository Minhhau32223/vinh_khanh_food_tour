package com.foodtour.api.service;

import com.foodtour.api.dto.PlayHistory.LogPlayHistoryRequest;
import com.foodtour.api.dto.PlayHistory.PlayHistoryResponse;
import com.foodtour.api.dto.PlayHistory.TopPoiResponse;
import com.foodtour.api.dto.PlayHistory.UpdateListeningDurationRequest;
import com.foodtour.api.dto.analytics.AdminDashboardStatsResponse;
import com.foodtour.api.dto.analytics.LogLocationRequest;
import com.foodtour.api.dto.analytics.OwnerDashboardStatsResponse;

import java.util.List;

public interface AnalyticsService {
    PlayHistoryResponse logPlayHistory (LogPlayHistoryRequest request);
    PlayHistoryResponse updateListeningDurationa(Long id, UpdateListeningDurationRequest request);
    /** @param periodDays null = all time, 7 or 30 = last N days */
    List<TopPoiResponse> getTop10Pois(Integer periodDays);

    /** Top 10 POI chỉ trong phạm vi của owner. */
    List<TopPoiResponse> getTop10PoisByOwner(Long ownerId, Integer periodDays);

    void logUserLocation(LogLocationRequest request);

    AdminDashboardStatsResponse getAdminDashboardStats();

    /** Tổng quan thống kê chỉ cho POI của owner này. */
    OwnerDashboardStatsResponse getOwnerDashboardStats(Long ownerId);
}
