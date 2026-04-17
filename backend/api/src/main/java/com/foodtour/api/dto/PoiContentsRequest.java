package com.foodtour.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PoiContentsRequest {
    private Long poiId;
    private String languageCode;
    private String title;
    private String description;
    private String imageUrls;
    private String audioFileUrl;
    private String ttsScript;
}


