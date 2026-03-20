package com.foodtour.api.dto.PoiContent;

import lombok.Data;

@Data
public class CreatePoiContentRequest {
    private Long poiId;
    private String languageCode;
    private String title;
    private String description;
    private String imageUrls;
    private String audioFileUrl;
    private String ttsScript;
}
