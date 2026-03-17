package com.foodtour.api.repository;

import com.foodtour.api.entity.Poi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository truy cập bảng `pois`.
 * Spring Data JPA tự tạo SQL từ tên method.
 *
 * findByIsActiveTrue() tương đương:
 *   SELECT * FROM pois WHERE is_active = 1
 */
@Repository
public interface PoiRepository extends JpaRepository<Poi, Long> {

    // Lấy tất cả POI đang active
    List<Poi> findByIsActiveTrue();
}
