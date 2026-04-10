package com.foodtour.api.dto.offline;

import com.foodtour.api.dto.PoiContentsResponse;
import com.foodtour.api.dto.PoiResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfflinePoiPackageItemResponse {
    private PoiResponse poi;
    private PoiContentsResponse content;
    private boolean usedFallbackToVietnamese;
}
