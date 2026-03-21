package com.foodtour.api.dto.PlayHistory;

import com.foodtour.api.dto.PoiResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// dto/PlayHistory/TopPoiResponse.java
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TopPoiResponse {
    private PoiResponse poi;
    private Long playCount;
}