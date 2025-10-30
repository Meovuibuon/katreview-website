-- Create database and user for KatReview
CREATE DATABASE IF NOT EXISTS katreview_db;
CREATE USER IF NOT EXISTS 'katreview_user'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON katreview_db.* TO 'katreview_user'@'localhost';
FLUSH PRIVILEGES;

-- Show databases to confirm
SHOW DATABASES;









