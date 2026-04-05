package com.foodtour.api.dto.Tour;

import lombok.Data;

@Data
public class TourPoiOrderRequest {
    private Long poiId;
    private Integer orderIndex;
}
