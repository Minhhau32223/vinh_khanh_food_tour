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
public class PoiContent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // FK tới POI
    @Column(name = "poi_id")
    private Long poiId;

    // Ngôn ngữ (vi, en, ...)
    @Column(name = "language_code", nullable = false, length = 10)
    private String languageCode;

    // Tiêu đề nội dung
    @Column(nullable = false, length = 255)
    private String title;

    // Mô tả chi tiết
    @Column(columnDefinition = "TEXT")
    private String description;

    // JSON lưu danh sách image URLs
    @Column(name = "image_urls", columnDefinition = "JSON")
    private String imageUrls;

    // Link file audio
    @Column(name = "audio_file_url", columnDefinition = "TEXT")
    private String audioFileUrl;

    // Script để TTS
    @Column(name = "tts_script", columnDefinition = "TEXT")
    private String ttsScript;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}