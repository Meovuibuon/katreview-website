# 🚀 MySQL Setup Instructions for KatReview

## **Cách 1: Sử dụng MySQL Workbench (Recommended)**

1. **Mở MySQL Workbench**
2. **Kết nối với MySQL server** (localhost:3306)
3. **Chạy các lệnh SQL sau:**

```sql
-- Tạo database
CREATE DATABASE IF NOT EXISTS katreview_db;

-- Tạo user
CREATE USER IF NOT EXISTS 'katreview_user'@'localhost' IDENTIFIED BY 'password123';

-- Cấp quyền
GRANT ALL PRIVILEGES ON katreview_db.* TO 'katreview_user'@'localhost';
FLUSH PRIVILEGES;

-- Chọn database
USE katreview_db;
```

4. **Import schema:**
   - File → Open SQL Script
   - Chọn file: `server/database/schema.sql`
   - Execute (Ctrl+Shift+Enter)

## **Cách 2: Sử dụng phpMyAdmin (XAMPP/WAMP)**

1. **Mở phpMyAdmin** (http://localhost/phpmyadmin)
2. **Tạo database:** `katreview_db`
3. **Tạo user:** `katreview_user` với password `password123`
4. **Import file:** `server/database/schema.sql`

## **Cách 3: Command Line (nếu có PATH)**

```bash
# Kết nối MySQL
mysql -u root -p

# Chạy setup
source server/database/setup.sql

# Import schema
mysql -u katreview_user -p katreview_db < server/database/schema.sql
```

## **Kiểm tra kết nối:**

Sau khi setup xong, chạy:
```bash
npm run dev
```

Nếu thành công, bạn sẽ thấy:
```
✅ MySQL database connected successfully
📊 Database: katreview_db
🌐 Host: localhost:3306
✅ Database schema initialized successfully
🚀 Server running on port 5000
📊 Using MySQL database
```

## **Troubleshooting:**

- **Access denied**: Kiểm tra username/password
- **Database not found**: Chạy CREATE DATABASE trước
- **Connection refused**: MySQL service chưa start
- **Port 3306 in use**: Thay đổi port trong database.env

## **Test API:**

Sau khi server chạy thành công:
- Health check: http://localhost:5000/api/health
- Categories: http://localhost:5000/api/categories
- Articles: http://localhost:5000/api/articles









