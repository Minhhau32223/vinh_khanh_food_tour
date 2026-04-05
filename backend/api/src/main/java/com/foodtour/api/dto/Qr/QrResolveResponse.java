package com.foodtour.api.dto.Qr;

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
public class QrResolveResponse {
    private String qrValue;
    private PoiResponse poi;
    private PoiContentsResponse content;
    /** Ngôn ngữ nội dung thực tế (sau fallback) */
    private String language;
    private boolean usedFallbackToVietnamese;
}
