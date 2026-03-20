package com.foodtour.api.dto.Qr;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QRResponse {
    private Long id;
    private Long poiId;
    private String qrValue;
    private Boolean isActive = true;
    private LocalDateTime createdAt;
}
