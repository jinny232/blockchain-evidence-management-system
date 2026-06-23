-- MySQL dump 10.13  Distrib 9.7.1, for Win64 (x86_64)
--
-- Host: localhost    Database: evidencemanagementdb
-- ------------------------------------------------------
-- Server version	9.7.1

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
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'd35c7c9e-6c0a-11f1-93f5-bcfce78ea622:1-68';

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `actor_name` varchar(100) DEFAULT NULL,
  `actor_role` varchar(50) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` varchar(100) DEFAULT NULL,
  `status` enum('Success','Warning','Failed','Critical') DEFAULT 'Success',
  `details` text,
  `ip_address` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,'Admin','Admin','Created user','User','1','Success','New investigator account created.','127.0.0.1','2026-06-19 18:48:53'),(2,'Mr Investigator','Investigator','Uploaded evidence','Evidence','1','Success','Evidence file uploaded and hash generated.','127.0.0.1','2026-06-19 18:48:53'),(3,'Lab Tech','Lab Technician','Accepted evidence','Evidence','1','Success','Evidence accepted for analysis.','127.0.0.1','2026-06-19 18:48:53'),(4,'Peraon1','Investigator','Submitted evidence','Evidence','2','Success','Submitted Image evidence #2 to case C-1001. SHA-256: 3e00449563fa9a80675abc8edd34234bc7c3963b5d02e7e6be570d4c60f7e1c5. IPFS CID: Not uploaded.','::1','2026-06-20 15:09:27'),(5,'Peraon1','Investigator','Submitted evidence','Evidence','3','Success','Submitted Image evidence #3 to case C-1001. SHA-256: aa5e468f662fb82c12b4025f5e83b809ebbdb8922b731343ba1bac8c7fdf35fc. Blockchain: Failed. Tx: N/A.','::1','2026-06-20 17:01:14'),(6,'Peraon1','Investigator','Submitted evidence','Evidence','4','Success','Submitted Image evidence #4 to case C-1001. SHA-256: 83cefa835bbe89b430ac5f39d7c3f9460b6fad4c9aaadf05d947d05a46b2afbd. Blockchain: Recorded. Tx: 0x81bd0bc40c1796a5708590a7a6a36b6ed1f315cdbda98492d4edea9a458fcb53.','::1','2026-06-20 17:02:27'),(7,'Peraon1','Investigator','Submitted evidence','Evidence','5','Success','Submitted Image evidence #5 to case C-1001. SHA-256: 7c7041b8ec83e6344b5fd4bb07216813735eca89068964926bab3018b70e13ce. Blockchain: Recorded. Tx: 0x2f1875e65ffd0e34c218139a0bc78188f27cfad6f4aea1345af81567a1ae0a6c.','::1','2026-06-20 17:07:26'),(8,'Admin','Admin','Update user failed','User','7','Failed','Username or email already exists.','::1','2026-06-20 17:40:54'),(9,'Admin','Admin','Update user failed','User','7','Failed','Username or email already exists.','::1','2026-06-20 17:41:01'),(10,'Admin','Admin','Update user failed','User','7','Failed','Username or email already exists.','::1','2026-06-20 17:41:02'),(11,'Admin','Admin','Updated user','User','7','Success','Updated user person3. Role: Lab Technician, Active: Yes.','::1','2026-06-20 17:41:17'),(12,'Admin','Admin','Updated case team','Case','1','Success','Updated team for case ID 1. Total assigned members: 3.','::1','2026-06-20 17:42:24'),(13,'Person3','Lab Technician','Accepted evidence','Evidence','5','Success','Accepted evidence #5 for laboratory analysis.','::1','2026-06-20 17:50:28'),(14,'Person3','Lab Technician','Submitted lab result','Evidence','5','Success','Submitted lab analysis result for evidence #5. Conclusion: d.','::1','2026-06-20 18:08:33'),(15,'Admin','Admin','Updated user','User','4','Success','Updated user person4. Role: Lawyer, Active: Yes.','::1','2026-06-20 18:18:33'),(16,'Admin','Admin','Updated case team','Case','1','Success','Updated team for case ID 1. Total assigned members: 4.','::1','2026-06-20 18:19:23'),(17,'Delectus natus atqu','Lawyer','Created legal note','Legal Note','1','Success','Created legal note #1: fff.','::1','2026-06-20 18:38:23'),(18,'test1','Judge','Created verdict','Verdict','2','Critical','Created verdict #2: kl. Decision: Not Guilty.','::1','2026-06-21 08:05:07'),(19,'Admin','Admin','Updated case team','Case','1','Success','Updated team for case ID 1. Total assigned members: 4.','::1','2026-06-22 12:16:49');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `case_team_assignments`
--

DROP TABLE IF EXISTS `case_team_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `case_team_assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `case_id` int NOT NULL,
  `user_id` int NOT NULL,
  `role` varchar(50) NOT NULL,
  `assigned_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_case_user_role` (`case_id`,`user_id`,`role`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `case_team_assignments_ibfk_1` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE,
  CONSTRAINT `case_team_assignments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `case_team_assignments`
--

LOCK TABLES `case_team_assignments` WRITE;
/*!40000 ALTER TABLE `case_team_assignments` DISABLE KEYS */;
INSERT INTO `case_team_assignments` VALUES (14,1,5,'Investigator','Admin','2026-06-22 12:16:49'),(15,1,7,'Lab Technician','Admin','2026-06-22 12:16:49'),(16,1,4,'Lawyer','Admin','2026-06-22 12:16:49'),(17,1,6,'Judge','Admin','2026-06-22 12:16:49');
/*!40000 ALTER TABLE `case_team_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cases`
--

DROP TABLE IF EXISTS `cases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cases` (
  `id` int NOT NULL AUTO_INCREMENT,
  `case_code` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `priority` enum('Low','Medium','High','Urgent') NOT NULL DEFAULT 'Medium',
  `status` enum('Open','In Progress','Closed') NOT NULL DEFAULT 'Open',
  `lead_investigator` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `case_code` (`case_code`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cases`
--

LOCK TABLES `cases` WRITE;
/*!40000 ALTER TABLE `cases` DISABLE KEYS */;
INSERT INTO `cases` VALUES (1,'C-1001','CAse Fire','description','Medium','Closed','Peraon1','2026-06-19 08:17:30','2026-06-21 08:05:07');
/*!40000 ALTER TABLE `cases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `court_verdicts`
--

DROP TABLE IF EXISTS `court_verdicts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `court_verdicts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `judge_id` int NOT NULL,
  `case_id` int NOT NULL,
  `verdict_title` varchar(255) NOT NULL,
  `decision` varchar(50) NOT NULL,
  `verdict_summary` text NOT NULL,
  `sentence_text` text,
  `status` varchar(20) DEFAULT 'Draft',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `judge_id` (`judge_id`),
  KEY `case_id` (`case_id`),
  CONSTRAINT `court_verdicts_ibfk_1` FOREIGN KEY (`judge_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `court_verdicts_ibfk_2` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `court_verdicts`
--

LOCK TABLES `court_verdicts` WRITE;
/*!40000 ALTER TABLE `court_verdicts` DISABLE KEYS */;
INSERT INTO `court_verdicts` VALUES (1,5,1,'Final Court Decision','Guilty','After reviewing the submitted evidence, lab analysis, and legal notes, the court finds the defendant guilty.','The defendant is sentenced according to the applicable law.','Final','2026-06-21 08:00:24','2026-06-21 08:00:24'),(2,6,1,'kl','Not Guilty','kk','kk','Final','2026-06-21 08:05:07','2026-06-21 08:05:07');
/*!40000 ALTER TABLE `court_verdicts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `evidence`
--

DROP TABLE IF EXISTS `evidence`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evidence` (
  `id` int NOT NULL AUTO_INCREMENT,
  `case_id` int DEFAULT NULL,
  `evidence_type` enum('Image','Document','Video','Audio','Disk Image','Network Log','Other') DEFAULT 'Other',
  `description` text,
  `file_hash` varchar(256) NOT NULL,
  `ipfs_cid` varchar(255) DEFAULT NULL,
  `submitted_by` varchar(255) DEFAULT NULL,
  `status` enum('Pending','Accepted','Analyzed','Rejected') DEFAULT 'Pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `blockchain_tx_hash` varchar(255) DEFAULT NULL,
  `blockchain_status` varchar(50) DEFAULT 'Not Recorded',
  PRIMARY KEY (`id`),
  KEY `fk_evidence_case` (`case_id`),
  CONSTRAINT `fk_evidence_case` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evidence`
--

LOCK TABLES `evidence` WRITE;
/*!40000 ALTER TABLE `evidence` DISABLE KEYS */;
INSERT INTO `evidence` VALUES (1,1,'Document','Initial case document','abc123hashsample','QmSampleCID123','Mr Investigator','Accepted','2026-06-19 14:41:28','2026-06-19 14:41:49',NULL,'Not Recorded'),(2,1,'Image','ryeryy','3e00449563fa9a80675abc8edd34234bc7c3963b5d02e7e6be570d4c60f7e1c5',NULL,'Peraon1','Pending','2026-06-20 15:09:27','2026-06-20 15:09:27',NULL,'Not Recorded'),(3,1,'Image','ddddddddddddddddddddd','aa5e468f662fb82c12b4025f5e83b809ebbdb8922b731343ba1bac8c7fdf35fc','QmReCc4grwj6qnHco4funF98Qiu7EoG5FJXVSnefDfbdcF','Peraon1','Pending','2026-06-20 17:01:14','2026-06-20 17:01:14',NULL,'Failed'),(4,1,'Image','dd','83cefa835bbe89b430ac5f39d7c3f9460b6fad4c9aaadf05d947d05a46b2afbd','QmS1GY3rnhq8ywqc6u7Te6necmnpB4TaBE2RdV5hTXLs63','Peraon1','Pending','2026-06-20 17:02:27','2026-06-20 17:02:27','0x81bd0bc40c1796a5708590a7a6a36b6ed1f315cdbda98492d4edea9a458fcb53','Recorded'),(5,1,'Image',',','7c7041b8ec83e6344b5fd4bb07216813735eca89068964926bab3018b70e13ce','Qma5Athuv4NEbG9h58ph8EZyUCHxXywiWin9J8S1ZGbuRs','Peraon1','Analyzed','2026-06-20 17:07:26','2026-06-20 18:08:33','0x2f1875e65ffd0e34c218139a0bc78188f27cfad6f4aea1345af81567a1ae0a6c','Recorded');
/*!40000 ALTER TABLE `evidence` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lab_results`
--

DROP TABLE IF EXISTS `lab_results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lab_results` (
  `id` int NOT NULL AUTO_INCREMENT,
  `evidence_id` int NOT NULL,
  `analyzed_by` varchar(100) NOT NULL,
  `analysis_type` varchar(50) DEFAULT NULL,
  `result` text NOT NULL,
  `conclusion` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `attachment_name` varchar(255) DEFAULT NULL,
  `attachment_mime_type` varchar(100) DEFAULT NULL,
  `attachment_size` int DEFAULT NULL,
  `attachment_hash` varchar(256) DEFAULT NULL,
  `attachment_ipfs_cid` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `evidence_id` (`evidence_id`),
  CONSTRAINT `lab_results_ibfk_1` FOREIGN KEY (`evidence_id`) REFERENCES `evidence` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lab_results`
--

LOCK TABLES `lab_results` WRITE;
/*!40000 ALTER TABLE `lab_results` DISABLE KEYS */;
INSERT INTO `lab_results` VALUES (1,5,'Person3','General Analysis','d','d','2026-06-20 18:08:33','50144235811_7d709af1ae_b.jpg','image/jpeg',157423,'23ba6662e03ff74e4bae6df3a69c4aae6d21b0b3cd2202898d684203680beb89','QmVAroHawbFtYr3grWPGsAkQM3heBzG71PWWdVbXtLgVQx');
/*!40000 ALTER TABLE `lab_results` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `legal_notes`
--

DROP TABLE IF EXISTS `legal_notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `legal_notes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lawyer_id` int NOT NULL,
  `case_id` int DEFAULT NULL,
  `evidence_id` int DEFAULT NULL,
  `note_type` varchar(50) DEFAULT 'Case Opinion',
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `recommendation` text,
  `status` varchar(20) DEFAULT 'Draft',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `lawyer_id` (`lawyer_id`),
  KEY `case_id` (`case_id`),
  KEY `evidence_id` (`evidence_id`),
  CONSTRAINT `legal_notes_ibfk_1` FOREIGN KEY (`lawyer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `legal_notes_ibfk_2` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE SET NULL,
  CONSTRAINT `legal_notes_ibfk_3` FOREIGN KEY (`evidence_id`) REFERENCES `evidence` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `legal_notes`
--

LOCK TABLES `legal_notes` WRITE;
/*!40000 ALTER TABLE `legal_notes` DISABLE KEYS */;
INSERT INTO `legal_notes` VALUES (1,4,1,2,'Evidence Remark','fff','f','f','Archived','2026-06-20 18:38:23','2026-06-20 18:38:23');
/*!40000 ALTER TABLE `legal_notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('Admin','Investigator','Lab Technician','Lawyer','Judge') NOT NULL,
  `active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin User','admin','admin@example.com','$2b$10$UCTLXNLsU6D8KcEamfr1BuBdcSbbWfRZqUO6ErZoJB.ZZeeCRB60K','Admin',1,'2026-06-18 03:49:26'),(4,'Delectus natus atqu','person4','noqaxiko@mailinator.com','$2b$10$hgfNmLvvz8jJg5ExfeFeEuhxXOGAizcZnV/wjb.5fyOspCxIztnK6','Lawyer',1,'2026-06-18 04:14:23'),(5,'Peraon1','person1','ddd@gmail.com','$2b$10$G6d.cMz3aPEYeo2ibPEbk.cpVnnlW3fmoLvMA3yS06GD8XD0.Vowu','Investigator',1,'2026-06-18 04:16:58'),(6,'test1','person2','person2@gmail.com','$2b$10$gEnCp.aViLIOEBmgdxg1kuz7lNH/mTHF0KBO40hLhBY1tY7bHUzC6','Judge',1,'2026-06-19 02:46:32'),(7,'Person3','person3','person@gmail.com','$2b$10$MOpw1fFK/OuusJRFT/EO4exgQ/Hu9h6SZq/ck6XA8xKmUPnJfzG6m','Lab Technician',1,'2026-06-19 19:30:03');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-22 19:15:23
