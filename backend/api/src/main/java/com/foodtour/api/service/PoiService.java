package com.foodtour.api.service;

import com.foodtour.api.dto.PoiRequest;
import com.foodtour.api.dto.PoiResponse;

import java.math.BigDecimal;
import java.util.List;

/**
 * Interface định nghĩa các hành vi nghiệp vụ của POI.
 * Tách interface và implementation theo nguyên tắc SOLID (Dependency Inversion).
 */
public interface PoiService {

    // Lấy tất cả POI đang active
    List<PoiResponse> getAllPois();

    // Lấy chi tiết một POI theo ID
    PoiResponse getPoiById(Long id);

    /**
     * Tìm POI nằm trong phạm vi radius (km) từ tọa độ (lat, lng).
     * Sử dụng công thức Haversine để tính khoảng cách chính xác.
     *
     * @param lat      Vĩ độ điểm tìm kiếm
     * @param lng      Kinh độ điểm tìm kiếm
     * @param radiusKm Bán kính tìm kiếm (km)
     * @return Danh sách POI trong bán kính, kèm distanceKm, sắp xếp gần nhất trước
     */
    List<PoiResponse> getNearbyPois(BigDecimal lat, BigDecimal lng, double radiusKm);

    // Tạo POI mới (Admin)
    PoiResponse createPoi(PoiRequest request);

    // Cập nhật POI (Admin)
    PoiResponse updatePoi(Long id, PoiRequest request);

    Boolean updateStutus(Long id);

    PoiResponse approvePoi(Long id);
}
