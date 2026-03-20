package com.foodtour.api.dto.Tour;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tour_PoisResponse {
//    private Long id;
//    private Long tourId;
//    private Long poiId;
//    private Integer orderIndex = 0;

    private Long poiId;
    private Integer orderIndex;
}

