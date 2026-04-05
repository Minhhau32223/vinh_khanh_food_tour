package com.foodtour.api.dto.PlayHistory;

import lombok.Data;

@Data
public class LogPlayHistoryRequest {
    private String sessionId;
    private Long poiId;
    private Long poiContentId;
    private String triggerType;
    /** vi | en | zh (hoặc mã ngôn ngữ backend) */
    private String language;
    private Integer durationSeconds;
}
