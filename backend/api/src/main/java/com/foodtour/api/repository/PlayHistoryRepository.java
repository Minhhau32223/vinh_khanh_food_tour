package com.foodtour.api.repository;

import com.foodtour.api.entity.PlayHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlayHistoryRepository extends JpaRepository<PlayHistory, Long> {
    @Query(value = "SELECT poi_id, COUNT(*) as playCount FROM play_history GROUP BY poi_id ORDER BY playCount DESC LIMIT 10", nativeQuery = true)
    List<Object[]> findTop10Pois();
}