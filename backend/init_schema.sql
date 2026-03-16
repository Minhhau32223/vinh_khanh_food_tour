CREATE DATABASE  IF NOT EXISTS `food_tour` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `food_tour`;
-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: food_tour
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `play_history`
--

DROP TABLE IF EXISTS `play_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `play_history` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `session_id` varchar(36) DEFAULT NULL,
  `poi_id` bigint DEFAULT NULL,
  `poi_content_id` bigint DEFAULT NULL,
  `trigger_type` varchar(20) NOT NULL,
  `played_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `duration_seconds` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `session_id` (`session_id`),
  KEY `poi_id` (`poi_id`),
  KEY `poi_content_id` (`poi_content_id`),
  CONSTRAINT `play_history_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `play_history_ibfk_2` FOREIGN KEY (`poi_id`) REFERENCES `pois` (`id`) ON DELETE CASCADE,
  CONSTRAINT `play_history_ibfk_3` FOREIGN KEY (`poi_content_id`) REFERENCES `poi_contents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `play_history`
--

LOCK TABLES `play_history` WRITE;
/*!40000 ALTER TABLE `play_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `play_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `poi_contents`
--

DROP TABLE IF EXISTS `poi_contents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `poi_contents` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `poi_id` bigint DEFAULT NULL,
  `language_code` varchar(10) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `image_urls` json DEFAULT NULL,
  `audio_file_url` text,
  `tts_script` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `poi_id` (`poi_id`),
  CONSTRAINT `poi_contents_ibfk_1` FOREIGN KEY (`poi_id`) REFERENCES `pois` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `poi_contents`
--

LOCK TABLES `poi_contents` WRITE;
/*!40000 ALTER TABLE `poi_contents` DISABLE KEYS */;
/*!40000 ALTER TABLE `poi_contents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pois`
--

DROP TABLE IF EXISTS `pois`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pois` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `latitude` decimal(10,7) NOT NULL,
  `longitude` decimal(10,7) NOT NULL,
  `trigger_radius` int DEFAULT '50',
  `priority` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `owner_id` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `owner_id` (`owner_id`),
  CONSTRAINT `pois_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pois`
--

LOCK TABLES `pois` WRITE;
/*!40000 ALTER TABLE `pois` DISABLE KEYS */;
/*!40000 ALTER TABLE `pois` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `qr_codes`
--

DROP TABLE IF EXISTS `qr_codes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `qr_codes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `poi_id` bigint DEFAULT NULL,
  `qr_value` text NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `poi_id` (`poi_id`),
  CONSTRAINT `qr_codes_ibfk_1` FOREIGN KEY (`poi_id`) REFERENCES `pois` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `qr_codes`
--

LOCK TABLES `qr_codes` WRITE;
/*!40000 ALTER TABLE `qr_codes` DISABLE KEYS */;
/*!40000 ALTER TABLE `qr_codes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(36) NOT NULL,
  `device_id` varchar(100) NOT NULL,
  `preferred_language` varchar(10) DEFAULT 'vi',
  `current_tour_id` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expired_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `current_tour_id` (`current_tour_id`),
  CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`current_tour_id`) REFERENCES `tours` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tour_pois`
--

DROP TABLE IF EXISTS `tour_pois`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tour_pois` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tour_id` bigint DEFAULT NULL,
  `poi_id` bigint DEFAULT NULL,
  `order_index` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `tour_id` (`tour_id`),
  KEY `poi_id` (`poi_id`),
  CONSTRAINT `tour_pois_ibfk_1` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tour_pois_ibfk_2` FOREIGN KEY (`poi_id`) REFERENCES `pois` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tour_pois`
--

LOCK TABLES `tour_pois` WRITE;
/*!40000 ALTER TABLE `tour_pois` DISABLE KEYS */;
/*!40000 ALTER TABLE `tour_pois` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tours`
--

DROP TABLE IF EXISTS `tours`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tours` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `is_system` tinyint(1) DEFAULT '0',
  `created_by` bigint DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `tours_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tours`
--

LOCK TABLES `tours` WRITE;
/*!40000 ALTER TABLE `tours` DISABLE KEYS */;
/*!40000 ALTER TABLE `tours` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_locations`
--

DROP TABLE IF EXISTS `user_locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_locations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `session_id` varchar(36) DEFAULT NULL,
  `latitude` decimal(10,7) NOT NULL,
  `longitude` decimal(10,7) NOT NULL,
  `recorded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `session_id` (`session_id`),
  CONSTRAINT `user_locations_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_locations`
--

LOCK TABLES `user_locations` WRITE;
/*!40000 ALTER TABLE `user_locations` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_locations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password_hash` text NOT NULL,
  `role` varchar(20) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,'admin','$2a$10$7l5B8ULs9o7Ya0Ddu3F9be4Tu7PhyJ3vrsCJeK5SsDwPLKBcuGoCG','ADMIN',1,'2026-03-16 15:49:15','2026-03-16 15:49:15'),(3,'owner1','$2a$10$zrMHoJ7F2CrsuhnyGf/itu8g1X/NNVTIEtHIdFmjjI4FqqSwgOcua','OWNER',1,'2026-03-16 16:03:51','2026-03-16 16:03:51'),(4,'owner2','$2a$10$7rizVN2fm9ygu7ZsvwMmzOhVHK90PvSc4jQrA5oCCgzNOMgBy5bB.','OWNER',1,'2026-03-16 16:12:52','2026-03-16 16:12:52'),(5,'user1','$2a$10$ODtl4wRfmxBExqAtKc3SS.P2X5dterBoRRsBcNhjHW1x.BPOiZ9t.','USER',1,'2026-03-16 16:13:38','2026-03-16 16:13:38'),(6,'owner3','$2a$10$AxVRgiTnPL2dmvkEREDq0uyUfwiHrpGUC2hK.MD5ll9cODMWfe9IK','OWNER',1,'2026-03-16 16:15:05','2026-03-16 16:15:05');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-16 23:26:46
