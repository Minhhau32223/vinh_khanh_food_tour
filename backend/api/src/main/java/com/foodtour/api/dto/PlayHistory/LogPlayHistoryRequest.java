package com.foodtour.api.dto.PlayHistory;

import lombok.Data;

@Data
public class LogPlayHistoryRequest {
    private String sessionId;
    private Long poiId;
    private Long poiContentId;
    private String triggerType;
    private Integer durationSeconds;
}
