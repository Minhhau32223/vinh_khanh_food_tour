-- ============================================================
-- Food Tour Database Schema
-- MySQL 8.0 | utf8mb4
-- 
-- Thứ tự DROP (phải xóa bảng con trước bảng cha):
--   play_history → user_locations → qr_codes → tour_pois
--   → poi_contents → sessions → pois → tours → users
--
-- Thứ tự CREATE (phải tạo bảng cha trước bảng con):
--   users → tours → pois → sessions → poi_contents
--   → qr_codes → tour_pois → user_locations → play_history
-- ============================================================

CREATE DATABASE IF NOT EXISTS `food_tour`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;
USE `food_tour`;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- DROP: thứ tự từ bảng con → bảng cha
-- ============================================================
DROP TABLE IF EXISTS `play_history`;
DROP TABLE IF EXISTS `user_locations`;
DROP TABLE IF EXISTS `qr_codes`;
DROP TABLE IF EXISTS `tour_pois`;
DROP TABLE IF EXISTS `poi_contents`;
DROP TABLE IF EXISTS `sessions`;
DROP TABLE IF EXISTS `pois`;
DROP TABLE IF EXISTS `tours`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 1. users — Người dùng hệ thống (gốc, không phụ thuộc ai)
-- ============================================================
CREATE TABLE `users` (
  `id`            BIGINT        NOT NULL AUTO_INCREMENT,
  `username`      VARCHAR(50)   NOT NULL,
  `password_hash` TEXT          NOT NULL,
  `role`          VARCHAR(20)   NOT NULL,          -- ADMIN | OWNER | USER
  `is_active`     TINYINT(1)    DEFAULT 1,
  `created_at`    TIMESTAMP     NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    TIMESTAMP     NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- 2. tours — Tour tham quan (phụ thuộc: users)
-- ============================================================
CREATE TABLE `tours` (
  `id`          BIGINT        NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(255)  NOT NULL,
  `description` TEXT,
  `is_system`   TINYINT(1)    DEFAULT 0,           -- 1 = tour hệ thống (do admin tạo)
  `created_by`  BIGINT        DEFAULT NULL,        -- FK → users.id
  `is_active`   TINYINT(1)    DEFAULT 1,
  `created_at`  TIMESTAMP     NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  TIMESTAMP     NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `tours_fk_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- 3. pois — Điểm thuyết minh / quán ăn (phụ thuộc: users)
-- ============================================================
CREATE TABLE `pois` (
  `id`             BIGINT          NOT NULL AUTO_INCREMENT,
  `name`           VARCHAR(255)    NOT NULL,
  `latitude`       DECIMAL(10,7)   NOT NULL,        -- Vĩ độ GPS
  `longitude`      DECIMAL(10,7)   NOT NULL,        -- Kinh độ GPS
  `trigger_radius` INT             DEFAULT 50,      -- Bán kính geofence (mét)
  `priority`       INT             DEFAULT 0,       -- Thứ tự ưu tiên
  `is_active`      TINYINT(1)      DEFAULT 1,
  `owner_id`       BIGINT          DEFAULT NULL,    -- FK → users.id (chủ quán)
  `created_at`     TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `owner_id` (`owner_id`),
  CONSTRAINT `pois_fk_user` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- 4. sessions — Phiên dùng app (phụ thuộc: tours)
-- ============================================================
CREATE TABLE `sessions` (
  `id`                 VARCHAR(36)   NOT NULL,       -- UUID
  `device_id`          VARCHAR(100)  NOT NULL,
  `preferred_language` VARCHAR(10)   DEFAULT 'vi',
  `current_tour_id`    BIGINT        DEFAULT NULL,   -- FK → tours.id
  `created_at`         TIMESTAMP     NULL DEFAULT CURRENT_TIMESTAMP,
  `expired_at`         TIMESTAMP     NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `current_tour_id` (`current_tour_id`),
  CONSTRAINT `sessions_fk_tour` FOREIGN KEY (`current_tour_id`) REFERENCES `tours` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- 5. poi_contents — Nội dung âm thanh/văn bản của POI (phụ thuộc: pois)
-- ============================================================
CREATE TABLE `poi_contents` (
  `id`             BIGINT        NOT NULL AUTO_INCREMENT,
  `poi_id`         BIGINT        DEFAULT NULL,       -- FK → pois.id
  `language_code`  VARCHAR(10)   NOT NULL,           -- vi | en | ...
  `title`          VARCHAR(255)  NOT NULL,
  `description`    TEXT,
  `image_urls`     JSON          DEFAULT NULL,       -- Mảng URL ảnh
  `audio_file_url` TEXT,                             -- URL file mp3
  `tts_script`     TEXT,                             -- Script text-to-speech
  `created_at`     TIMESTAMP     NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     TIMESTAMP     NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `poi_id` (`poi_id`),
  CONSTRAINT `poi_contents_fk_poi` FOREIGN KEY (`poi_id`) REFERENCES `pois` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- 6. qr_codes — Mã QR liên kết với POI (phụ thuộc: pois)
-- ============================================================
CREATE TABLE `qr_codes` (
  `id`         BIGINT     NOT NULL AUTO_INCREMENT,
  `poi_id`     BIGINT     DEFAULT NULL,             -- FK → pois.id
  `qr_value`   TEXT       NOT NULL,                 -- Giá trị mã QR
  `is_active`  TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP  NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `poi_id` (`poi_id`),
  CONSTRAINT `qr_codes_fk_poi` FOREIGN KEY (`poi_id`) REFERENCES `pois` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- 7. tour_pois — Bảng trung gian: POI thuộc về Tour nào (phụ thuộc: tours, pois)
-- ============================================================
CREATE TABLE `tour_pois` (
  `id`          BIGINT  NOT NULL AUTO_INCREMENT,
  `tour_id`     BIGINT  DEFAULT NULL,               -- FK → tours.id
  `poi_id`      BIGINT  DEFAULT NULL,               -- FK → pois.id
  `order_index` INT     NOT NULL,                   -- Thứ tự POI trong tour
  PRIMARY KEY (`id`),
  KEY `tour_id` (`tour_id`),
  KEY `poi_id` (`poi_id`),
  CONSTRAINT `tour_pois_fk_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tour_pois_fk_poi`  FOREIGN KEY (`poi_id`)  REFERENCES `pois` (`id`)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- 8. user_locations — Lịch sử vị trí GPS của user (phụ thuộc: sessions)
-- ============================================================
CREATE TABLE `user_locations` (
  `id`          BIGINT          NOT NULL AUTO_INCREMENT,
  `session_id`  VARCHAR(36)     DEFAULT NULL,       -- FK → sessions.id
  `latitude`    DECIMAL(10,7)   NOT NULL,
  `longitude`   DECIMAL(10,7)   NOT NULL,
  `recorded_at` TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `session_id` (`session_id`),
  CONSTRAINT `user_locations_fk_session` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- 9. play_history — Lịch sử phát âm thanh (phụ thuộc: sessions, pois, poi_contents)
-- ============================================================
CREATE TABLE `play_history` (
  `id`              BIGINT       NOT NULL AUTO_INCREMENT,
  `session_id`      VARCHAR(36)  DEFAULT NULL,      -- FK → sessions.id
  `poi_id`          BIGINT       DEFAULT NULL,      -- FK → pois.id
  `poi_content_id`  BIGINT       DEFAULT NULL,      -- FK → poi_contents.id
  `trigger_type`    VARCHAR(20)  NOT NULL,          -- GEOFENCE | TOUR | QR | MANUAL
  `played_at`       TIMESTAMP    NULL DEFAULT CURRENT_TIMESTAMP,
  `duration_seconds` INT         DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `session_id`     (`session_id`),
  KEY `poi_id`         (`poi_id`),
  KEY `poi_content_id` (`poi_content_id`),
  CONSTRAINT `play_history_fk_session`     FOREIGN KEY (`session_id`)     REFERENCES `sessions`     (`id`) ON DELETE CASCADE,
  CONSTRAINT `play_history_fk_poi`         FOREIGN KEY (`poi_id`)         REFERENCES `pois`         (`id`) ON DELETE CASCADE,
  CONSTRAINT `play_history_fk_poi_content` FOREIGN KEY (`poi_content_id`) REFERENCES `poi_contents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
