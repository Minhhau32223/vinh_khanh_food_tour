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

    @Query(value = """
            SELECT ph.poi_id,
                   COUNT(*) AS play_count,
                   AVG(CASE WHEN ph.duration_seconds IS NOT NULL THEN ph.duration_seconds END) AS avg_duration
            FROM play_history ph
            INNER JOIN pois p ON p.id = ph.poi_id AND p.owner_id = :ownerId
            WHERE (:periodDays IS NULL OR ph.played_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL :periodDays DAY))
            GROUP BY ph.poi_id
            ORDER BY play_count DESC
            LIMIT 10
            """, nativeQuery = true)
    List<Object[]> findTop10PoisByOwnerWithAvgDuration(@Param("ownerId") Long ownerId,
                                                       @Param("periodDays") Integer periodDays);

    @Query(value = "SELECT trigger_type, COUNT(*) FROM play_history GROUP BY trigger_type", nativeQuery = true)
    List<Object[]> countGroupedByTriggerType();

    /** Thống kê trigger type chỉ cho POI của owner. */
    @Query(value = """
            SELECT ph.trigger_type, COUNT(*) AS cnt
            FROM play_history ph
            INNER JOIN pois p ON p.id = ph.poi_id AND p.owner_id = :ownerId
            GROUP BY ph.trigger_type
            """, nativeQuery = true)
    List<Object[]> countGroupedByTriggerTypeForOwner(@Param("ownerId") Long ownerId);

    @Query(value = "SELECT COALESCE(SUM(duration_seconds), 0) FROM play_history", nativeQuery = true)
    Long sumDurationSeconds();

    /** Tổng giây nghe cho POI của owner. */
    @Query(value = """
            SELECT COALESCE(SUM(ph.duration_seconds), 0)
            FROM play_history ph
            INNER JOIN pois p ON p.id = ph.poi_id AND p.owner_id = :ownerId
            """, nativeQuery = true)
    Long sumDurationSecondsByOwner(@Param("ownerId") Long ownerId);

    @Query("SELECT AVG(p.durationSeconds) FROM PlayHistory p WHERE p.durationSeconds IS NOT NULL")
    Double avgDurationSecondsWherePresent();

    /** Trung bình giây nghe cho POI của owner. */
    @Query(value = """
            SELECT AVG(ph.duration_seconds)
            FROM play_history ph
            INNER JOIN pois p ON p.id = ph.poi_id AND p.owner_id = :ownerId
            WHERE ph.duration_seconds IS NOT NULL
            """, nativeQuery = true)
    Double avgDurationSecondsByOwner(@Param("ownerId") Long ownerId);

    /** Tổng lượt phát cho POI của owner. */
    @Query(value = """
            SELECT COUNT(ph.id)
            FROM play_history ph
            INNER JOIN pois p ON p.id = ph.poi_id AND p.owner_id = :ownerId
            """, nativeQuery = true)
    Long countPlayEventsByOwner(@Param("ownerId") Long ownerId);
}