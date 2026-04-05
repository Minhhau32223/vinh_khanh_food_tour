package com.foodtour.api.dto.Tour;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class CreateTourRequest {
    @NotBlank(message = "Name cannot be blank")
    private String name;

    @NotBlank(message = "Description cannot be blank")
    private String description;

    private Boolean isSystem = false;

    private Long createdBy;

    /** Thứ tự POI trong tour (order_index tăng dần). */
    private List<TourPoiOrderRequest> pois;
}

