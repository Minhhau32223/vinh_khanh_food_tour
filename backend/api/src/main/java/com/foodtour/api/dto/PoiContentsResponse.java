package com.foodtour.api.dto;




import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
@Getter
@Setter
@Builder

public class PoiContentsResponse {

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
