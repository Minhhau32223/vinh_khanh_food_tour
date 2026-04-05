package com.foodtour.api.dto.PlayHistory;

import com.foodtour.api.dto.PoiResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// dto/PlayHistory/TopPoiResponse.java
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TopPoiResponse {
    private Long poiId;
    private String poiName;
    /** Trung bình thời lượng nghe (giây), null nếu chưa có bản ghi duration. */
    private Double avgDurationSeconds;
    private PoiResponse poi;
    private Long playCount;
}