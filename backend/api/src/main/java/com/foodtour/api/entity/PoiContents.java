package com.foodtour.api.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "poi_contents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PoiContents {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name ="poi_id")
    private Poi poi;

    @Column(name = "language_code",nullable = false,length = 10)
    private String languageCode;

    @Column(name="title",length = 255,nullable = false)
    private String title;

    @Column(name = "description",columnDefinition = "TEXT")
    private String description;

    @Column(name="image_urls",columnDefinition = "JSON")
    private String imageUrls;

    @Column(name="audio_file_url",columnDefinition = "TEXT")
    private String audioFileUrl;

    @Column(name = "tts_script",columnDefinition = "TEXT")
    private String ttsScript;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

}
