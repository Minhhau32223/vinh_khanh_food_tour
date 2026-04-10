package com.foodtour.api.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardStatsResponse {
    private long totalPois;
    private long pendingPois;
    private long approvedPois;
    private long approvedActivePois;
    private long totalTours;
    private long activeTours;
    private long totalSessions;
    private long activeSessionsLast5Minutes;
    private long activeSessionsLast30Minutes;
    private long totalPlayEvents;
    /** Tổng giây đã ghi nhận (theo các lần cập nhật duration). */
    private long totalListeningSecondsRecorded;
    /** Trung bình giây / lần phát (chỉ các bản ghi có duration). */
    private Double avgListeningSecondsPerPlayWithDuration;
    private List<TriggerTypeCountResponse> playsByTriggerType;
}
