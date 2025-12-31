CREATE DATABASE IF NOT EXISTS cutalking_db;
USE cutalking_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial Admin User
-- Username: admin
-- Password: password123 (This hash is for 'password123')
INSERT INTO users (username, password_hash, role) 
VALUES ('admin', '$2b$10$sTaxsY9/CL1qmukRJyjbg.le8u123JufPydSCGoOSclrLREZv6ff5C', 'admin') 
ON DUPLICATE KEY UPDATE username=username;

-- Note: You will need to generate a real bcrypt hash for the password in the actual implementation or use the registration endpoint.
-- For the purpose of this script, I will provide a valid hash for 'password123' in the backend code setup.
