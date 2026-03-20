package com.foodtour.api.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tour_pois")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Tour_Pois {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tour_id", nullable = false)
    private Long tourId;

    @Column(name = "poi_id", nullable = false)
    private Long poiId;

    // Thứ tự POI trong tour (0 = đầu tiên)
    @Column(name = "order_index", nullable = false)
    @Builder.Default
    private Integer orderIndex = 0;

    // Quan hệ để fetch POI details
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "poi_id", insertable = false, updatable = false)
    private Poi poi;
}
