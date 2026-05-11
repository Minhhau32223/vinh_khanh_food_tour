package com.foodtour.api.dto.Tour;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TourResponse {

    private Long id;
    private String name;
    private String description;

    private Boolean isSystem;
    private Long createdBy;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private BigDecimal price;

    private List<Tour_PoisResponse> pois;
}
