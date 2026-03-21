package com.foodtour.api.dto.PoiContent;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PoiContentResponse {
    private Long id;
    private Long poiId;
    private String languageCode;
    private String title;
    private String description;
    private String imageUrls;
    private String audioFileUrl;
    private String ttsScript;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}