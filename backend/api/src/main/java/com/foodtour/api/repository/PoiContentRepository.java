package com.foodtour.api.repository;

import com.foodtour.api.entity.PoiContents;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PoiContentRepository extends JpaRepository<PoiContents, Long> {
    List<PoiContents> findByPoiId(Long poiId);
    Optional<PoiContents> findByPoiIdAndLanguageCode(Long poiId, String languageCode);
}
