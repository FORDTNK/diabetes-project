-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: mysql:3306
-- Generation Time: Aug 08, 2026 at 02:46 PM
-- Server version: 8.0.45
-- PHP Version: 8.3.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `diabetic_foot_ai`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `admin_id` int NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `birth_date` date DEFAULT NULL,
  `age` int DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`admin_id`, `username`, `password`, `first_name`, `last_name`, `birth_date`, `age`, `phone`) VALUES
(1, 'admin', '$2b$10$HG32Pon.1ObenwAj6ZcPd.ZdYjO82jG7h7YefMLfakFR2UZk7zTpC', 'ธนากร', 'ภาคพรม', '2004-04-30', 21, '0800000000');

-- --------------------------------------------------------

--
-- Table structure for table `analysis_history`
--

CREATE TABLE `analysis_history` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `grade` varchar(10) DEFAULT NULL,
  `class_id` varchar(10) DEFAULT NULL,
  `advice` text,
  `wound_position` varchar(100) DEFAULT NULL,
  `image_name` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `analysis_history`
--

INSERT INTO `analysis_history` (`id`, `user_id`, `grade`, `class_id`, `advice`, `wound_position`, `image_name`, `created_at`) VALUES
(6, 1, 'Wagner 3', '3', 'หลีกเลี่ยงการดูแลแผลด้วยตนเอง ต้องอยู่ในการดูแลของแพทย์ และลดการเคลื่อนไหวของเท้าที่มีแผล', 'ส้นเท้า', 'dfu_1778648969108.jpg', '2026-05-13 12:10:12'),
(7, 2, 'Wagner 4', '4', 'ควรเข้ารับการรักษาในโรงพยาบาลทันที ห้ามแกะหรือกดบริเวณเนื้อตาย และงดการเดินโดยเด็ดขาด', 'ส้นเท้า', 'dfu_1780899944726.jpg', '2026-06-08 13:27:16'),
(13, 1, 'Wagner 5', '5', 'ต้องได้รับการรักษาอย่างเร่งด่วนในโรงพยาบาล และปฏิบัติตามแผนการรักษาอย่างเคร่งครัด', 'เท้าด้านขวา', 'dfu_1782312497975.jpg', '2026-06-24 21:48:26'),
(14, 3, 'Wagner 4', '4', 'ควรเข้ารับการรักษาในโรงพยาบาลทันที ห้ามแกะหรือกดบริเวณเนื้อตาย และงดการเดินโดยเด็ดขาด', 'ส้นเท้า', 'dfu_1782312692473.jpg', '2026-06-24 21:51:43'),
(15, 1, 'Wagner 5', '5', 'ต้องได้รับการรักษาอย่างเร่งด่วนในโรงพยาบาล และปฏิบัติตามแผนการรักษาอย่างเคร่งครัด', 'นิ้ว', 'dfu_1783066612364.jpg', '2026-07-03 15:17:16'),
(17, 1, 'Wagner 5', '5', 'ต้องได้รับการรักษาอย่างเร่งด่วนในโรงพยาบาล และปฏิบัติตามแผนการรักษาอย่างเคร่งครัด', 'นิ้ว', 'dfu_1783494495138.jpg', '2026-07-08 14:08:29'),
(18, 1, 'Wagner 4', '4', 'ควรเข้ารับการรักษาในโรงพยาบาลทันที ห้ามแกะหรือกดบริเวณเนื้อตาย และงดการเดินโดยเด็ดขาด', 'เท้าด้านขวา', 'dfu_1783494829007.jpg', '2026-07-08 14:14:54'),
(19, 1, 'Wagner 5', '5', 'ต้องได้รับการรักษาอย่างเร่งด่วนในโรงพยาบาล และปฏิบัติตามแผนการรักษาอย่างเคร่งครัด', 'เท้าด้านขวา', 'dfu_1783495027384.jpg', '2026-07-08 14:17:32'),
(20, 1, 'Wagner 5', '5', 'ต้องได้รับการรักษาอย่างเร่งด่วนในโรงพยาบาล และปฏิบัติตามแผนการรักษาอย่างเคร่งครัด', 'เท้าด้านขวา', 'dfu_1783495027384.jpg', '2026-07-08 14:17:33'),
(21, 1, 'Wagner 2', '2', 'งดการเดินหรือยืนลงน้ำหนักบริเวณแผล ดูแลแผลตามคำแนะนำแพทย์อย่างเคร่งครัด และสังเกตอาการติดเชื้อ เช่น บวม แดง หรือมีหนอง', 'เท้าด้านขวา', 'dfu_1783495093116.jpg', '2026-07-08 14:18:40'),
(22, 1, 'Wagner 3', '3', 'หลีกเลี่ยงการดูแลแผลด้วยตนเอง ต้องอยู่ในการดูแลของแพทย์ และลดการเคลื่อนไหวของเท้าที่มีแผล', 'เท้าด้านขวา', 'dfu_1783495141727.jpg', '2026-07-08 14:19:22'),
(23, 1, 'Wagner 2', '2', 'งดการเดินหรือยืนลงน้ำหนักบริเวณแผล ดูแลแผลตามคำแนะนำแพทย์อย่างเคร่งครัด และสังเกตอาการติดเชื้อ เช่น บวม แดง หรือมีหนอง', 'เท้าด้านขวา', 'dfu_1784640145001.jpg', '2026-07-21 20:22:39');

-- --------------------------------------------------------

--
-- Table structure for table `diabetes_info`
--

CREATE TABLE `diabetes_info` (
  `diabetes_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `topic` varchar(255) DEFAULT NULL,
  `content` text,
  `admin_id` int DEFAULT NULL,
  `image_url` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `diabetes_info`
--

INSERT INTO `diabetes_info` (`diabetes_id`, `user_id`, `title`, `topic`, `content`, `admin_id`, `image_url`) VALUES
(3, NULL, 'โรคเบาหวานคืออะไร', 'ความหมายของโรคเบาหวาน', 'โรคเบาหวานเป็นโรคเรื้อรังที่เกิดจากร่างกายมีระดับน้ำตาลในเลือดสูงกว่าปกติ เนื่องจากร่างกายไม่สามารถผลิตอินซูลินได้เพียงพอ หรือไม่สามารถใช้อินซูลินได้อย่างมีประสิทธิภาพ หากไม่ควบคุมอาจนำไปสู่ภาวะแทรกซ้อนที่รุนแรง', 1, '/uploads/diabetes1.jpg'),
(4, NULL, 'สาเหตุของโรคเบาหวาน', 'ปัจจัยที่ทำให้เกิดโรคเบาหวาน', 'สาเหตุของโรคเบาหวานเกิดจากพันธุกรรม การรับประทานอาหารหวานหรือมันมากเกินไป การขาดการออกกำลังกาย น้ำหนักเกิน และอายุที่เพิ่มขึ้น ปัจจัยเหล่านี้ส่งผลให้ร่างกายควบคุมระดับน้ำตาลได้ไม่ดี', 1, NULL),
(5, NULL, 'อาการของโรคเบาหวาน', 'สัญญาณเตือนที่ควรระวัง', 'อาการที่พบบ่อย ได้แก่ ปัสสาวะบ่อย กระหายน้ำ หิวบ่อย น้ำหนักลด เหนื่อยง่าย แผลหายช้า และอาจมีอาการชาตามมือหรือเท้า หากพบอาการเหล่านี้ควรตรวจระดับน้ำตาลในเลือด', 1, NULL),
(6, NULL, 'ประเภทของโรคเบาหวาน', 'ชนิดของโรคเบาหวาน', 'โรคเบาหวานแบ่งออกเป็นหลายประเภท ได้แก่ เบาหวานชนิดที่ 1 เบาหวานชนิดที่ 2 และเบาหวานขณะตั้งครรภ์ โดยแต่ละชนิดมีสาเหตุและแนวทางการรักษาที่แตกต่างกัน', 1, NULL),
(7, NULL, 'การวินิจฉัยโรคเบาหวาน', 'วิธีตรวจหาโรคเบาหวาน', 'การวินิจฉัยโรคเบาหวานทำได้โดยการตรวจระดับน้ำตาลในเลือด เช่น การตรวจน้ำตาลขณะอดอาหาร การตรวจน้ำตาลสะสม (HbA1c) และการตรวจหลังดื่มน้ำตาล แพทย์จะใช้ผลตรวจร่วมกับอาการของผู้ป่วย', 1, NULL),
(8, NULL, 'การควบคุมระดับน้ำตาล', 'การดูแลตนเองของผู้ป่วยเบาหวาน', 'ผู้ป่วยเบาหวานควรควบคุมอาหาร ลดหวาน มัน เค็ม ออกกำลังกายสม่ำเสมอ รับประทานยาหรือฉีดอินซูลินตามแพทย์สั่ง และตรวจระดับน้ำตาลในเลือดอย่างสม่ำเสมอ', 1, NULL),
(9, NULL, 'ภาวะแทรกซ้อนจากโรคเบาหวาน', 'ผลกระทบของโรคเบาหวาน', 'หากควบคุมโรคเบาหวานไม่ดี อาจเกิดภาวะแทรกซ้อน เช่น โรคไต โรคหัวใจ โรคหลอดเลือดสมอง จอประสาทตาเสื่อม และแผลที่เท้า ซึ่งอาจรุนแรงถึงขั้นต้องตัดอวัยวะ', 1, NULL),
(10, NULL, 'แผลเท้าในผู้ป่วยเบาหวาน', 'การเกิดแผลและการป้องกัน', 'ผู้ป่วยเบาหวานมีความเสี่ยงต่อการเกิดแผลที่เท้า เนื่องจากปลายประสาทเสื่อมและการไหลเวียนเลือดไม่ดี ควรตรวจเท้าทุกวัน ดูแลความสะอาด และรีบพบแพทย์เมื่อมีแผล', 1, NULL),
(11, NULL, 'อาหารสำหรับผู้ป่วยเบาหวาน', 'หลักการเลือกอาหาร', 'ควรเลือกรับประทานอาหารที่มีใยอาหารสูง ลดน้ำตาลและแป้งขัดสี เลี่ยงเครื่องดื่มหวาน และรับประทานอาหารในปริมาณที่เหมาะสม เพื่อช่วยควบคุมระดับน้ำตาลในเลือด', 1, NULL),
(12, NULL, 'การป้องกันโรคเบาหวาน', 'วิธีลดความเสี่ยงการเกิดโรค', 'การป้องกันโรคเบาหวานสามารถทำได้โดยควบคุมน้ำหนัก ออกกำลังกายสม่ำเสมอ รับประทานอาหารที่เหมาะสม งดสูบบุหรี่ และตรวจสุขภาพประจำปีเพื่อตรวจหาความผิดปกติตั้งแต่ระยะเริ่มต้น', 1, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `image`
--

CREATE TABLE `image` (
  `image_id` int NOT NULL,
  `diabetes_id` int DEFAULT NULL,
  `image_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `image`
--

INSERT INTO `image` (`image_id`, `diabetes_id`, `image_name`) VALUES
(3, 11, 'diabetes_1781591828817_pazytm.jpg'),
(4, 3, 'diabetes_1781591884208_diabetes1.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `treatment_guideline`
--

CREATE TABLE `treatment_guideline` (
  `guideline_id` int NOT NULL,
  `class_id` int DEFAULT NULL,
  `grade` varchar(50) DEFAULT NULL,
  `self_care_advice` text,
  `treatment_method` text,
  `admin_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `treatment_guideline`
--

INSERT INTO `treatment_guideline` (`guideline_id`, `class_id`, `grade`, `self_care_advice`, `treatment_method`, `admin_id`) VALUES
(4, 0, 'class 0', 'ควรล้างเท้าด้วยน้ำสะอาดและสบู่อ่อนทุกวัน เช็ดเท้าให้แห้งโดยเฉพาะซอกนิ้ว ทาครีมบำรุงผิวเพื่อป้องกันผิวแห้งแตก ตรวจเท้าด้วยตนเองทุกวัน หลีกเลี่ยงการเดินเท้าเปล่า และสวมรองเท้าที่ไม่บีบรัด', 'ควบคุมระดับน้ำตาลในเลือดให้เหมาะสม พบแพทย์เพื่อตัดหนังหนาหรือตาปลาอย่างปลอดภัย และติดตามสุขภาพเท้าอย่างสม่ำเสมอ', 1),
(5, 1, 'class 1', 'ทำความสะอาดแผลด้วยน้ำเกลือ ปิดแผลด้วยผ้าก๊อซสะอาด หลีกเลี่ยงแรงกดหรือการเดินลงน้ำหนักบริเวณแผล และไม่ควรใช้สมุนไพรหรือสารเคมีทาแผล', 'ใช้ยาฆ่าเชื้อเฉพาะที่ตามคำแนะนำแพทย์ และติดตามการหายของแผลอย่างต่อเนื่อง', 1),
(6, 2, 'class 2', 'งดการเดินหรือยืนลงน้ำหนักบริเวณแผล ดูแลแผลตามคำแนะนำแพทย์อย่างเคร่งครัด และสังเกตอาการติดเชื้อ เช่น บวม แดง หรือมีหนอง', 'ทำแผลแบบปลอดเชื้อ อาจต้องตัดเนื้อตาย และให้ยาปฏิชีวนะร่วมกับการควบคุมระดับน้ำตาลในเลือด', 1),
(7, 3, 'class 3', 'หลีกเลี่ยงการดูแลแผลด้วยตนเอง ต้องอยู่ในการดูแลของแพทย์ และลดการเคลื่อนไหวของเท้าที่มีแผล', 'อาจจำเป็นต้องผ่าตัดระบายหนอง ตัดเนื้อตาย และให้ยาปฏิชีวนะทางหลอดเลือด พร้อมการตรวจประเมินการลุกลามของการติดเชื้อ', 1),
(8, 4, 'class 4', 'ควรเข้ารับการรักษาในโรงพยาบาลทันที ห้ามแกะหรือกดบริเวณเนื้อตาย และงดการเดินโดยเด็ดขาด', 'แพทย์จะประเมินการไหลเวียนเลือด และอาจจำเป็นต้องผ่าตัดตัดนิ้วหรือบางส่วนของเท้าเพื่อป้องกันการลุกลาม', 1),
(9, 5, 'class 5', 'ต้องได้รับการรักษาอย่างเร่งด่วนในโรงพยาบาล และปฏิบัติตามแผนการรักษาอย่างเคร่งครัด', 'มักจำเป็นต้องผ่าตัดตัดขาเพื่อรักษาชีวิต ร่วมกับการให้ยาปฏิชีวนะและการฟื้นฟูสมรรถภาพหลังการรักษา', 1);

-- --------------------------------------------------------

--
-- Table structure for table `treatment_records`
--

CREATE TABLE `treatment_records` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `treatment_date` date DEFAULT NULL,
  `treatment_text` text,
  `doctor_advice` text,
  `detail_text` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `treatment_records`
--

INSERT INTO `treatment_records` (`id`, `user_id`, `treatment_date`, `treatment_text`, `doctor_advice`, `detail_text`, `created_at`) VALUES
(1, 1, '2026-07-08', 'gfgfdgfd', 'dfgfdgfd', 'fdgfdgfdg', '2026-07-03 08:14:47');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `user_id` int NOT NULL,
  `national_id` varchar(13) NOT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `birth_date` date DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`user_id`, `national_id`, `password`, `first_name`, `last_name`, `birth_date`, `phone`) VALUES
(1, '1101700000011', 'pass001', 'สมชาย', 'ใจดี', '1990-01-15', '0812345671'),
(2, '1101700000022', 'pass002', 'สมหญิง', 'รักเรียน', '1992-03-22', '0812345672'),
(3, '1101700000033', 'pass003', 'อนันต์', 'สุขสันต์', '1988-07-10', '0812345673'),
(4, '1101700000044', 'pass004', 'วิชัย', 'กล้าหาญ', '1985-11-05', '0812345674'),
(5, '1101700000055', 'pass005', 'สุดา', 'งามดี', '1995-02-18', '0812345675'),
(6, '1101700000066', 'pass006', 'ประสิทธิ์', 'มั่นคง', '1987-06-30', '0812345676'),
(7, '1101700000077', 'pass007', 'อรทัย', 'แสงทอง', '1993-09-12', '0812345677'),
(8, '1101700000088', 'pass008', 'เกรียงศักดิ์', 'พัฒนา', '1982-12-01', '0812345678'),
(9, '1101700000099', 'pass009', 'นภา', 'สดใส', '1998-04-25', '0812345679'),
(10, '1101700000100', 'pass010', 'ธนกร', 'บุญช่วย', '1991-08-14', '0812345680'),
(11, '1101700000111', 'pass011', 'ชาญชัย', 'รุ่งเรือง', '1984-10-20', '0812345681'),
(12, '1101700000122', 'pass012', 'พิมพ์ใจ', 'อารีย์', '1996-05-09', '0812345682'),
(13, '1101700000133', 'pass013', 'สันติ', 'สุขใจ', '1989-01-27', '0812345683'),
(14, '1101700000144', 'pass014', 'รัตนา', 'งดงาม', '1994-07-03', '0812345684'),
(15, '1101700000155', 'pass015', 'เอกชัย', 'ตั้งตรง', '1986-03-16', '0812345685'),
(16, '1101700000166', 'pass016', 'มณี', 'โชคดี', '1999-09-29', '0812345686'),
(17, '1101700000177', 'pass017', 'ชัยวัฒน์', 'เพิ่มพูน', '1983-12-11', '0812345687'),
(18, '1101700000188', 'pass018', 'จิราภรณ์', 'ใจงาม', '1997-06-08', '0812345688'),
(19, '1101700000199', 'pass019', 'กิตติ', 'มีสุข', '1990-02-04', '0812345689'),
(20, '1101700000200', 'pass020', 'ศิริพร', 'บุญลือ', '1993-11-19', '0812345690'),
(22, '1328700025173', 'Thanakorn6048', 'ธนากร', 'ภาคพรม', '2004-04-30', '0820837718');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`admin_id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `analysis_history`
--
ALTER TABLE `analysis_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ix_analysis_history_id` (`id`),
  ADD KEY `fk_analysis_history_user` (`user_id`);

--
-- Indexes for table `diabetes_info`
--
ALTER TABLE `diabetes_info`
  ADD PRIMARY KEY (`diabetes_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `admin_id` (`admin_id`);

--
-- Indexes for table `image`
--
ALTER TABLE `image`
  ADD PRIMARY KEY (`image_id`),
  ADD KEY `diabetes_id` (`diabetes_id`);

--
-- Indexes for table `treatment_guideline`
--
ALTER TABLE `treatment_guideline`
  ADD PRIMARY KEY (`guideline_id`),
  ADD KEY `admin_id` (`admin_id`);

--
-- Indexes for table `treatment_records`
--
ALTER TABLE `treatment_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_treatment_records_user` (`user_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `national_id` (`national_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `admin_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `analysis_history`
--
ALTER TABLE `analysis_history`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `diabetes_info`
--
ALTER TABLE `diabetes_info`
  MODIFY `diabetes_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `image`
--
ALTER TABLE `image`
  MODIFY `image_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `treatment_guideline`
--
ALTER TABLE `treatment_guideline`
  MODIFY `guideline_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `treatment_records`
--
ALTER TABLE `treatment_records`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `user_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `analysis_history`
--
ALTER TABLE `analysis_history`
  ADD CONSTRAINT `fk_analysis_history_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `diabetes_info`
--
ALTER TABLE `diabetes_info`
  ADD CONSTRAINT `diabetes_info_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `diabetes_info_ibfk_2` FOREIGN KEY (`admin_id`) REFERENCES `admin` (`admin_id`) ON DELETE SET NULL;

--
-- Constraints for table `image`
--
ALTER TABLE `image`
  ADD CONSTRAINT `image_ibfk_1` FOREIGN KEY (`diabetes_id`) REFERENCES `diabetes_info` (`diabetes_id`) ON DELETE CASCADE;

--
-- Constraints for table `treatment_guideline`
--
ALTER TABLE `treatment_guideline`
  ADD CONSTRAINT `treatment_guideline_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admin` (`admin_id`) ON DELETE SET NULL;

--
-- Constraints for table `treatment_records`
--
ALTER TABLE `treatment_records`
  ADD CONSTRAINT `fk_treatment_records_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
