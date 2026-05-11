package com.foodtour.api.dto.Tour;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class UpdateTourRequest {

    @NotBlank(message = "Name cannot be blank")
    private String name;

    @NotBlank(message = "Description cannot be blank")
    private String description;

    private Boolean isSystem;
    private Boolean isActive;

    private BigDecimal price;

    private List<TourPoiOrderRequest> pois;
}