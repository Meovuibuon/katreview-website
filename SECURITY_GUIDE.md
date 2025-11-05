# 🔐 Hướng dẫn Bảo mật - Security Guide

## 📍 Nơi lưu trữ thông tin nhạy cảm

### 1. **Thông tin tài khoản (Username, Password, Email)**
- **Vị trí:** MySQL Database (table `users`)
- **Bảo mật:** 
  - ✅ Password được mã hóa bằng **bcrypt** (salt rounds: 10)
  - ✅ Không ai có thể đọc được password gốc
  - ✅ Kể cả admin database cũng không thể xem password
  - ✅ Password chỉ có thể verify, không thể decrypt

### 2. **Database credentials**
- **Vị trí:** `server/database.env`
- **Bảo mật:**
  - ✅ File này ĐÃ được thêm vào `.gitignore`
  - ✅ Không bao giờ được commit lên Git/GitHub
  - ✅ Mỗi môi trường (dev/production) có file riêng

### 3. **JWT Secret Key**
- **Vị trí:** `server/database.env` (biến `JWT_SECRET`)
- **Bảo mật:**
  - ✅ Được generate ngẫu nhiên (64 ký tự hex)
  - ✅ Không được public
  - ✅ Dùng để sign và verify JWT tokens

---

## 🛡️ Cách Password được bảo vệ

### Quy trình mã hóa:
```
Password gốc → bcrypt hash (+ salt) → Lưu vào database
"mypassword" → "$2a$10$..." (60 ký tự) → MySQL
```

### Ví dụ:
- **Password:** `admin123456`
- **Stored:** `$2a$10$x7FqN8h.Kq9ZPY.../...` (không thể đảo ngược)

### Khi login:
```
User nhập password → Hash → So sánh với hash trong DB → Cho phép/Từ chối
```

---

## 🚫 Files KHÔNG BAO GIỜ commit lên Git/GitHub

### Danh sách files nhạy cảm (đã được bảo vệ):

```bash
# Environment files
database.env
server/database.env
.env
.env.local
.env.production

# Upload files (chứa ảnh user upload)
uploads/*

# Node modules
node_modules/

# Database backups (nếu có)
*.sql
*.dump
backups/
```

---

## ✅ Checklist Bảo mật

### Trước khi commit lên GitHub:

- [x] File `database.env` đã có trong `.gitignore`
- [x] File `database.env.example` đã được tạo (template không có thông tin nhạy cảm)
- [x] Password được mã hóa bằng bcrypt
- [x] JWT_SECRET đã được generate ngẫu nhiên
- [x] Không có password hardcode trong code

### Kiểm tra nhanh:
```bash
# Xem files sẽ được commit
git status

# KHÔNG được thấy:
# - database.env
# - .env
# - uploads/[image files]
```

---

## 🌐 Khi deploy lên Production/Live

### 1. **Đổi tất cả credentials:**

```bash
# Trên server production, tạo file database.env mới:
DB_HOST=your-production-db-host
DB_USER=production_user
DB_PASSWORD=STRONG_RANDOM_PASSWORD_HERE
DB_NAME=production_db_name

# Generate JWT secret mới:
JWT_SECRET=<random-64-character-hex-string>

NODE_ENV=production
```

### 2. **Cách generate JWT secret mạnh:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. **Set permissions cho file env:**
```bash
chmod 600 database.env  # Chỉ owner có thể đọc/ghi
```

### 4. **Đổi database password:**
```sql
-- Trên MySQL production:
ALTER USER 'production_user'@'localhost' IDENTIFIED BY 'new_strong_password';
FLUSH PRIVILEGES;
```

---

## 🔑 Best Practices

### 1. **Password Policy:**
- Tối thiểu 12 ký tự cho production
- Kết hợp chữ hoa, chữ thường, số, ký tự đặc biệt
- Không dùng từ điển, thông tin cá nhân

### 2. **JWT Token:**
- Thời gian hết hạn: 24h (có thể giảm xuống)
- Token lưu ở `localStorage` (client)
- Tự động xóa khi logout

### 3. **Database:**
- Backup thường xuyên
- Không expose port MySQL ra internet
- Dùng user riêng cho từng app (không dùng root)

### 4. **Server:**
- Luôn cập nhật packages (`npm audit fix`)
- Dùng HTTPS khi production
- Enable CORS đúng cách
- Rate limiting cho login endpoint

---

## 🚨 Nếu Database Credentials bị lộ

### Hành động ngay lập tức:

1. **Đổi database password:**
```sql
ALTER USER 'user'@'localhost' IDENTIFIED BY 'new_password';
```

2. **Đổi JWT_SECRET:**
```bash
# Generate new secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Update trong database.env
```

3. **Restart server:**
```bash
# Stop
Stop-Process -Name node -Force

# Start với config mới
cd server && npm start
```

4. **Force logout tất cả users** (JWT cũ sẽ không valid nữa)

5. **Kiểm tra logs** để xem có truy cập bất thường không

---

## 📋 Git Commands An toàn

### Kiểm tra trước khi commit:
```bash
# Xem files sẽ được add
git status

# Xem nội dung chi tiết
git diff

# Chắc chắn không có sensitive data
git add .
git commit -m "Your message"
```

### Nếu đã commit nhầm file sensitive:
```bash
# Remove từ history (NGUY HIỂM - cẩn thận!)
git rm --cached server/database.env
git commit -m "Remove sensitive file"
git push

# Nếu đã push lên GitHub:
# 1. Xóa repo cũ
# 2. Đổi TẤT CẢ credentials
# 3. Tạo repo mới và push lại
```

---

## 🎯 Summary

### Các thông tin được bảo vệ:
1. ✅ **Password:** Mã hóa bcrypt, không thể đảo ngược
2. ✅ **Database credentials:** Trong file `.env` không commit lên Git
3. ✅ **JWT Secret:** Random 64-char, không public
4. ✅ **User data:** Trong database có authentication

### Khi share code lên GitHub:
- ✅ File `database.env` KHÔNG được commit (trong .gitignore)
- ✅ Chỉ commit `database.env.example` (template trống)
- ✅ README hướng dẫn người khác setup env của họ

### Khi deploy production:
- ✅ Tạo `database.env` mới với credentials khác
- ✅ Generate JWT secret mới
- ✅ Đổi database password
- ✅ Enable HTTPS

---

## 🆘 Liên hệ

Nếu phát hiện vấn đề bảo mật, đừng public trên GitHub Issues. 
Liên hệ trực tiếp với admin/developer.

---

**✨ Website của bạn giờ đã an toàn!**

