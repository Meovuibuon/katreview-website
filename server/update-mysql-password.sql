-- =====================================================
-- CẬP NHẬT DATABASE PASSWORD
-- Chạy script này trong MySQL Workbench hoặc phpMyAdmin
-- =====================================================

-- Đổi password cho user katreview_user
ALTER USER 'katreview_user'@'localhost' IDENTIFIED BY 'UQCK5XEh@';

-- Refresh privileges
FLUSH PRIVILEGES;

-- Kiểm tra user đã được cập nhật
SELECT User, Host FROM mysql.user WHERE User = 'katreview_user';

-- =====================================================
-- HOÀN TẤT! Password đã được đổi
-- =====================================================

