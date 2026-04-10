package com.foodtour.api.repository;

import com.foodtour.api.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SessionRepository extends JpaRepository<Session, String> {
    @Query(value = """
            SELECT COUNT(DISTINCT recent.session_id)
            FROM (
                SELECT ul.session_id
                FROM user_locations ul
                WHERE ul.session_id IS NOT NULL
                  AND ul.recorded_at >= DATE_SUB(NOW(), INTERVAL :minutes MINUTE)
                UNION
                SELECT ph.session_id
                FROM play_history ph
                WHERE ph.session_id IS NOT NULL
                  AND ph.played_at >= DATE_SUB(NOW(), INTERVAL :minutes MINUTE)
            ) recent
            """, nativeQuery = true)
    long countDistinctActiveSessions(@Param("minutes") int minutes);
}
