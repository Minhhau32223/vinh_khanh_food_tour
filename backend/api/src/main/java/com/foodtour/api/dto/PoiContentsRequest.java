package com.foodtour.api.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class PoiContentsRequest {
    private Long poiId;
    private String languageCode;
    private String title;
    private String description;
    private String imageUrls;
    private String audioFileUrl;
    private String ttsScript;
}


