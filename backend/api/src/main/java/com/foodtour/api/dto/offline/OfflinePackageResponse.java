package com.foodtour.api.dto.offline;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfflinePackageResponse {
    private String language;
    private LocalDateTime generatedAt;
    private int totalPois;
    private List<String> supportedLanguages;
    private List<OfflinePoiPackageItemResponse> items;
}
