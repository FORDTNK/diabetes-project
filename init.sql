CREATE DATABASE IF NOT EXISTS diabetic_foot_ai;
USE diabetic_foot_ai;

-- Admin table
CREATE TABLE IF NOT EXISTS admin (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE,
    age INT,
    phone VARCHAR(20)
);

-- User table
CREATE TABLE IF NOT EXISTS user (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    national_id VARCHAR(13) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE,
    phone VARCHAR(20)
);

-- Diabetes info table
CREATE TABLE IF NOT EXISTS diabetes_info (
    diabetes_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    title VARCHAR(255) NOT NULL,
    topic VARCHAR(255),
    content TEXT,
    admin_id INT,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE SET NULL,
    FOREIGN KEY (admin_id) REFERENCES admin(admin_id) ON DELETE SET NULL
);

-- Image table
CREATE TABLE IF NOT EXISTS image (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    diabetes_id INT,
    image_name VARCHAR(255) NOT NULL,
    FOREIGN KEY (diabetes_id) REFERENCES diabetes_info(diabetes_id) ON DELETE CASCADE
);

-- Treatment guideline table
CREATE TABLE IF NOT EXISTS treatment_guideline (
    guideline_id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT,
    grade VARCHAR(50),
    self_care_advice TEXT,
    treatment_method TEXT,
    admin_id INT,
    FOREIGN KEY (admin_id) REFERENCES admin(admin_id) ON DELETE SET NULL
);

-- Seed default admin (password: admin123 hashed with bcrypt)
INSERT INTO admin (username, password, first_name, last_name, birth_date, age, phone)
VALUES ('admin', '$2b$10$HG32Pon.1ObenwAj6ZcPd.ZdYjO82jG7h7YefMLfakFR2UZk7zTpC', 'แอดมิน', 'ระบบ', '1990-01-01', 36, '0800000000');

-- Seed sample users
INSERT INTO user (national_id, password, first_name, last_name, birth_date, phone) VALUES
('1234567890123', '$2b$10$HG32Pon.1ObenwAj6ZcPd.ZdYjO82jG7h7YefMLfakFR2UZk7zTpC', 'สมชาย', 'ใจดี', '1985-05-15', '0812345678'),
('9876543210987', '$2b$10$HG32Pon.1ObenwAj6ZcPd.ZdYjO82jG7h7YefMLfakFR2UZk7zTpC', 'สมหญิง', 'รักสุข', '1990-08-20', '0898765432');

-- Seed sample treatment guidelines
INSERT INTO treatment_guideline (class_id, grade, self_care_advice, treatment_method, admin_id) VALUES
(0, 'ระดับ 0', 'ล้างเท้าด้วยน้ำอุ่นทุกวัน ทาครีมบำรุงผิว ตรวจเท้าทุกวัน', 'ให้คำแนะนำเรื่องการดูแลเท้า ตรวจเท้าเป็นประจำ', 1),
(1, 'ระดับ 1', 'ทำความสะอาดแผลด้วยน้ำเกลือ ปิดแผลด้วยผ้าก๊อซสะอาด', 'ทำความสะอาดแผล ตัดเนื้อตายออก ใช้ยาปฏิชีวนะเฉพาะที่', 1),
(2, 'ระดับ 2', 'หลีกเลี่ยงการลงน้ำหนักบนเท้าข้างที่มีแผล พบแพทย์ตามนัด', 'รักษาด้วยยาปฏิชีวนะ ตรวจเลือดเป็นระยะ ทำแผลเป็นประจำ', 1);

-- Seed sample diabetes info
INSERT INTO diabetes_info (user_id, title, topic, content, admin_id) VALUES
(NULL, 'โรคเบาหวานคืออะไร', 'ความรู้ทั่วไป', 'โรคเบาหวานเป็นโรคเรื้อรังที่ร่างกายไม่สามารถผลิตหรือใช้อินซูลินได้อย่างเหมาะสม ทำให้ระดับน้ำตาลในเลือดสูงกว่าปกติ', 1),
(NULL, 'การดูแลเท้าสำหรับผู้ป่วยเบาหวาน', 'การดูแลตนเอง', 'ผู้ป่วยเบาหวานควรตรวจดูเท้าทุกวัน ล้างเท้าด้วยน้ำอุ่น ทาครีมบำรุง และสวมรองเท้าที่พอดี', 1);
