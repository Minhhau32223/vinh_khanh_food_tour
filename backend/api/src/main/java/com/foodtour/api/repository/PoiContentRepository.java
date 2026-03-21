package com.foodtour.api.repository;

import com.foodtour.api.entity.PoiContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PoiContentRepository extends JpaRepository<PoiContent, Long> {
}
