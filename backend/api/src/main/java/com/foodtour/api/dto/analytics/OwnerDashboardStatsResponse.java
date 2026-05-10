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
public class OwnerDashboardStatsResponse {
    /** Tổng POI của owner này. */
    private long totalPois;
    /** POI của owner đang chờ duyệt. */
    private long pendingPois;
    /** POI của owner đã được duyệt. */
    private long approvedPois;
    /** POI của owner đã duyệt và đang bật. */
    private long approvedActivePois;
    /** Tổng lượt phát thuyết minh cho POI của owner. */
    private long totalPlayEvents;
    /** Tổng giây đã ghi nhận (theo các lần cập nhật duration). */
    private long totalListeningSecondsRecorded;
    /** Trung bình giây / lần phát (chỉ các bản ghi có duration). */
    private Double avgListeningSecondsPerPlayWithDuration;
    /** Lượt phát theo loại kích hoạt, chỉ cho POI của owner. */
    private List<TriggerTypeCountResponse> playsByTriggerType;
}
