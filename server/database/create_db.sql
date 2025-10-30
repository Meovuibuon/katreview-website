-- Create database and user for KatReview with UTF8MB4 support
CREATE DATABASE IF NOT EXISTS katreview_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'katreview_user'@'localhost' IDENTIFIED BY 'katreview123';
GRANT ALL PRIVILEGES ON katreview_db.* TO 'katreview_user'@'localhost';
FLUSH PRIVILEGES;

-- Show databases to confirm
SHOW DATABASES;






