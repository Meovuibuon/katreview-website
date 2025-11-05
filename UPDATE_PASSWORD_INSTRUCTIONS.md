# ⚠️ CẬP NHẬT MYSQL PASSWORD - HƯỚNG DẪN

## 📋 File `database.env` đã được cập nhật!

Password mới: `UQCK5XEh@`

---

## 🔧 BẠN CẦN CHẠY SQL COMMAND SAU:

### Cách 1: MySQL Workbench

1. Mở **MySQL Workbench**
2. Kết nối với MySQL (user root hoặc admin)
3. Mở tab **Query** mới
4. Copy và paste lệnh SQL sau:

```sql
ALTER USER 'katreview_user'@'localhost' IDENTIFIED BY 'UQCK5XEh@';
FLUSH PRIVILEGES;
```

5. Click **Execute** (icon ⚡ hoặc Ctrl+Enter)
6. Xong! Password đã được đổi trong MySQL

---

### Cách 2: phpMyAdmin

1. Mở **phpMyAdmin**
2. Click tab **SQL** ở trên
3. Copy và paste lệnh SQL sau:

```sql
ALTER USER 'katreview_user'@'localhost' IDENTIFIED BY 'UQCK5XEh@';
FLUSH PRIVILEGES;
```

4. Click **Go**
5. Xong!

---

### Cách 3: MySQL Command Line

Mở PowerShell và chạy:

```powershell
mysql -u root -p
```

Nhập password root, sau đó chạy:

```sql
ALTER USER 'katreview_user'@'localhost' IDENTIFIED BY 'UQCK5XEh@';
FLUSH PRIVILEGES;
exit;
```

---

## ✅ SAU KHI CHẠY SQL:

Server sẽ tự động restart và sử dụng password mới!

Database password cũ: `password123` ❌
Database password mới: `UQCK5XEh@` ✅

---

## 📝 Tóm tắt những gì đã thay đổi:

1. ✅ File `server/database.env` đã có password mới
2. ⏳ MySQL database đang chờ bạn chạy SQL command
3. ⏳ Server sẽ restart sau khi hoàn tất

---

**Sau khi chạy SQL command, các bước tiếp theo sẽ tự động thực hiện!**

