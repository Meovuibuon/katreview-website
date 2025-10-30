# MySQL Setup Guide for KatReview Website

## 🚀 **Quick Setup Steps**

### 1. Install MySQL
- **Windows**: Download from https://dev.mysql.com/downloads/mysql/
- **macOS**: `brew install mysql`
- **Linux**: `sudo apt-get install mysql-server`

### 2. Start MySQL Service
```bash
# Windows (as Administrator)
net start mysql

# macOS/Linux
sudo systemctl start mysql
# or
brew services start mysql
```

### 3. Create Database
```sql
-- Connect to MySQL
mysql -u root -p

-- Create database
CREATE DATABASE katreview_db;
CREATE USER 'katreview_user'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON katreview_db.* TO 'katreview_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 4. Run Database Schema
```bash
# From project root
mysql -u katreview_user -p katreview_db < server/database/schema.sql
```

### 5. Update Environment Variables
Create `.env` file in server directory:
```env
DB_HOST=localhost
DB_USER=katreview_user
DB_PASSWORD=password123
DB_NAME=katreview_db
DB_PORT=3306
```

### 6. Start the Application
```bash
npm run dev
```

## 🔧 **Alternative: Use XAMPP/WAMP**
1. Install XAMPP or WAMP
2. Start Apache and MySQL services
3. Open phpMyAdmin (http://localhost/phpmyadmin)
4. Create database `katreview_db`
5. Import `server/database/schema.sql`

## ✅ **Verification**
- Server should show: "✅ MySQL database initialized successfully"
- Visit: http://localhost:3000
- Check API: http://localhost:5000/api/health

## 🆘 **Troubleshooting**
- **Connection refused**: MySQL not running
- **Access denied**: Wrong username/password
- **Database not found**: Run schema.sql first
- **Port 3306 in use**: Change port in .env file











