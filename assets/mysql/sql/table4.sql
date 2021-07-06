-- MySQL dump 10.13  Distrib 8.0.21, for Linux (x86_64)
--
-- Host: localhost    Database: riuser_dbg_jp
-- ------------------------------------------------------
-- Server version	8.0.21

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `USER_PREFERENCE`
--

DROP TABLE IF EXISTS `USER_PREFERENCE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `USER_PREFERENCE` (
  `user_preference_id` varchar(64) NOT NULL,
  `user_id` varchar(64) NOT NULL,
  `data` json DEFAULT NULL,
  `applet_id` varchar(64) DEFAULT NULL,
  `preference_name` varchar(64) DEFAULT NULL,
  `trigger_block_id` varchar(64) DEFAULT NULL,
  `trigger_device_id` varchar(64) DEFAULT NULL,
  `trigger_user_id` varchar(64) DEFAULT NULL,
  `service_block_id` varchar(64) DEFAULT NULL,
  `service_device_id` varchar(64) DEFAULT NULL,
  `service_user_id` varchar(64) DEFAULT NULL,
  `action_block_id` varchar(64) DEFAULT NULL,
  `action_device_id` varchar(64) DEFAULT NULL,
  `action_user_id` varchar(64) DEFAULT NULL,
  `action_tag_id` varchar(64) DEFAULT NULL,
  `del_flg` char(1) NOT NULL DEFAULT '0',
  `ins_log` varchar(100) DEFAULT NULL,
  `ins_date` datetime DEFAULT NULL,
  `upd_log` varchar(100) DEFAULT NULL,
  `upd_date` datetime DEFAULT NULL,
  `version` int NOT NULL DEFAULT '0',
  KEY `user_preference_id` (`user_preference_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `USER_PREFERENCE_SETTING`
--

DROP TABLE IF EXISTS `USER_PREFERENCE_SETTING`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `USER_PREFERENCE_SETTING` (
  `id` varchar(64) NOT NULL,
  `user_id` varchar(64) DEFAULT NULL,
  `user_preference_id` varchar(64) DEFAULT NULL,
  `applet_id` varchar(64) DEFAULT NULL,
  `block_id` varchar(64) DEFAULT NULL,
  `view_flg` char(1) NOT NULL DEFAULT '0',
  `enable_flg` char(1) NOT NULL DEFAULT '0',
  `preference` json DEFAULT NULL,
  `del_flg` char(1) NOT NULL DEFAULT '0',
  `ins_log` varchar(100) DEFAULT NULL,
  `ins_date` datetime DEFAULT NULL,
  `upd_log` varchar(100) DEFAULT NULL,
  `upd_date` datetime DEFAULT NULL,
  `version` int NOT NULL DEFAULT '0',
  KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `APPLET_COPY`
--

DROP TABLE IF EXISTS `APPLET_COPY`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `APPLET_COPY` (
  `applet_copy_id` varchar(64) NOT NULL,
  `user_id` varchar(64) DEFAULT NULL,
  `applet_id` varchar(64) DEFAULT NULL,
  `user_preference_id` varchar(64) DEFAULT NULL,
  `data` json DEFAULT NULL,
  `del_flg` char(1) NOT NULL DEFAULT '0',
  `ins_log` varchar(100) DEFAULT NULL,
  `ins_date` datetime DEFAULT NULL,
  `upd_log` varchar(100) DEFAULT NULL,
  `upd_date` datetime DEFAULT NULL,
  `version` int NOT NULL DEFAULT '0',
  KEY `applet_copy_id` (`applet_copy_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-10-30 17:20:25
