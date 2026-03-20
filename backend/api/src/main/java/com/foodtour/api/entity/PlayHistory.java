package com.foodtour.api.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "play_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlayHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // FK tới sessions (varchar 36)
    @Column(name = "session_id", length = 36)
    private String sessionId;

    // FK tới pois
    @Column(name = "poi_id")
    private Long poiId;

    // FK tới poi_contents
    @Column(name = "poi_content_id")
    private Long poiContentId;

    // AUTO | MANUAL | QR
    @Column(name = "trigger_type", nullable = false, length = 20)
    private String triggerType;

    // thời điểm phát (default CURRENT_TIMESTAMP)
    @CreationTimestamp
    @Column(name = "played_at", updatable = false)
    private LocalDateTime playedAt;

    // thời lượng
    @Column(name = "duration_seconds")
    private Integer durationSeconds;
}