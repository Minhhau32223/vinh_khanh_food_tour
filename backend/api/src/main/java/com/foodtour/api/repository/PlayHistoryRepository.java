package com.foodtour.api.repository;

import com.foodtour.api.entity.PlayHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlayHistoryRepository extends JpaRepository<PlayHistory, Long> {

    @Query(value = """
            SELECT ph.poi_id,
                   COUNT(*) AS play_count,
                   AVG(CASE WHEN ph.duration_seconds IS NOT NULL THEN ph.duration_seconds END) AS avg_duration
            FROM play_history ph
            WHERE (:periodDays IS NULL OR ph.played_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL :periodDays DAY))
            GROUP BY ph.poi_id
            ORDER BY play_count DESC
            LIMIT 10
            """, nativeQuery = true)
    List<Object[]> findTop10PoisWithAvgDuration(@Param("periodDays") Integer periodDays);

    @Query(value = "SELECT trigger_type, COUNT(*) FROM play_history GROUP BY trigger_type", nativeQuery = true)
    List<Object[]> countGroupedByTriggerType();

    @Query(value = "SELECT COALESCE(SUM(duration_seconds), 0) FROM play_history", nativeQuery = true)
    Long sumDurationSeconds();

    @Query("SELECT AVG(p.durationSeconds) FROM PlayHistory p WHERE p.durationSeconds IS NOT NULL")
    Double avgDurationSecondsWherePresent();
}