# 🚨 KHẨN CẤP - Database Credentials Đã Bị Lộ

## ⚠️ Tình huống:

File `server/database.env` đã được commit và push lên GitHub public repository:
- 🔴 **Link:** https://github.com/Meovuibuon/katreview-website
- 🔴 **Commits có chứa credentials:** `f29d892`, `7901f42`
- 🔴 **Thông tin bị lộ:**
  - Database password: `password123`
  - Database user: `katreview_user`
  - Database name: `katreview_db`

## ⚡ HÀNH ĐỘNG NGAY LẬP TỨC

### ✅ Đã được sửa tự động:
- [x] Thêm `database.env` vào `.gitignore`
- [x] Remove `database.env` khỏi Git tracking
- [x] Tạo `database.env.example` (template)
- [x] Generate JWT_SECRET mới

### 🔧 Bạn CẦN làm NGAY:

---

## BƯỚC 1: Đổi Database Password (QUAN TRỌNG NHẤT!)

### Cách 1: Dùng script tự động (Khuyến nghị)

```bash
cd server
node change-db-password.js
```

Script sẽ:
1. Kết nối database hiện tại
2. Hỏi password mới (tối thiểu 12 ký tự)
3. Đổi password trong database
4. Hướng dẫn cập nhật file `database.env`

### Cách 2: Thủ công qua MySQL Workbench/phpMyAdmin

```sql
-- Đăng nhập MySQL với quyền admin
-- Chạy lệnh:

ALTER USER 'katreview_user'@'localhost' IDENTIFIED BY 'NewStrongPassword@2025!';
FLUSH PRIVILEGES;

-- Sau đó cập nhật file database.env
```

### Sau khi đổi password:

**Cập nhật file `server/database.env`:**

```bash
# Mở file và đổi dòng này:
DB_PASSWORD=password123

# Thành (ví dụ):
DB_PASSWORD=NewStrongPassword@2025!
```

**Restart server:**
```bash
# Dừng server cũ
Stop-Process -Name node -Force

# Khởi động lại
cd server
npm start
```

---

## BƯỚC 2: Clean Git History (Tùy chọn nhưng khuyến nghị)

### Option A: Rewrite History (Nếu chưa ai fork repo)

```bash
# CẨN THẬN: Lệnh này sẽ thay đổi git history!

# 1. Remove file từ tất cả commits
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch server/database.env" \
  --prune-empty --tag-name-filter cat -- --all

# 2. Force push (CẨN THẬN!)
git push origin --force --all

# 3. Tất cả người khác cần re-clone repo
```

⚠️ **CHÚ Ý:** Chỉ làm nếu:
- Bạn là người duy nhất có quyền truy cập repo
- Chưa ai fork/clone repo
- Hiểu rõ rủi ro của force push

### Option B: Đơn giản hơn - Commit bình thường (Khuyến nghị)

Vì bạn đã đổi password, nên credentials cũ trong history không còn valid nữa:

```bash
# 1. Commit các thay đổi
git add .gitignore
git add server/database.env.example
git add SECURITY_GUIDE.md
git add SECURITY_BREACH_RESPONSE.md

git commit -m "Security: Remove database.env from tracking and add security measures"

# 2. Push bình thường
git push origin main
```

**Note trong commit message hoặc README:**
```
⚠️ Database credentials in old commits are no longer valid.
All passwords have been changed. Please use database.env.example as template.
```

---

## BƯỚC 3: Kiểm tra Database Access Logs (Nếu có)

Nếu MySQL logging enabled, kiểm tra:

```sql
-- Check who accessed database
SELECT * FROM mysql.general_log 
WHERE event_time > '2025-11-01' 
ORDER BY event_time DESC;

-- Check failed login attempts
SELECT * FROM performance_schema.users;
```

Nếu thấy truy cập bất thường → Backup database ngay và xem xét restore.

---

## BƯỚC 4: Cập nhật README (Để người khác biết)

Thêm vào `README.md`:

```markdown
## ⚠️ Security Note

Database credentials in git history (commits before Nov 2025) are **no longer valid**.
All sensitive data has been updated.

To set up:
1. Copy `server/database.env.example` to `server/database.env`
2. Fill in your own database credentials
3. Never commit `database.env` file
```

---

## BƯỚC 5: Best Practices Tiếp Theo

### Ngay bây giờ:
- [ ] Đổi database password (quan trọng nhất!)
- [ ] Restart server với password mới
- [ ] Commit và push các thay đổi security
- [ ] Cập nhật README với security note

### Trong tương lai:
- [ ] Định kỳ đổi password (3-6 tháng)
- [ ] Enable 2FA cho GitHub account
- [ ] Kiểm tra `.gitignore` trước mỗi commit
- [ ] Chạy `git status` trước khi push
- [ ] Backup database thường xuyên
- [ ] Monitor database access logs

---

## 📋 Checklist Hoàn Thành

### Bắt buộc (PHẢI làm):
- [ ] **Đã đổi database password** (script hoặc thủ công)
- [ ] **Đã cập nhật `database.env` với password mới**
- [ ] **Đã restart server và test login**
- [ ] **Đã commit .gitignore update và push**

### Khuyến nghị:
- [ ] Đã clean git history (hoặc note trong README)
- [ ] Đã check database access logs
- [ ] Đã backup database
- [ ] Đã test website hoạt động bình thường

---

## 🆘 Troubleshooting

### Server không start sau khi đổi password:

```bash
# Lỗi: "Access denied for user"
# → Kiểm tra database.env có password mới chưa
# → Kiểm tra password có đúng không (no typo)
```

### Không thể đổi password:

```bash
# Lỗi: "Access denied"
# → Cần quyền admin (root user)
# → Dùng MySQL Workbench/phpMyAdmin với root account
```

### Website không hoạt động sau khi đổi password:

```bash
# 1. Check server logs:
cd server
npm start

# 2. Xem lỗi gì
# 3. Thường là do database.env chưa cập nhật
```

---

## 📞 Liên Hệ

Nếu cần hỗ trợ:
1. Check `SECURITY_GUIDE.md` để biết thêm chi tiết
2. Nếu database bị compromise, backup và restore
3. Nếu có vấn đề kỹ thuật, mở GitHub Issue (KHÔNG đề cập credentials!)

---

## ✅ Sau khi hoàn thành:

Database của bạn đã an toàn! Credentials cũ không còn hoạt động.

**Remember:**
- 🔐 Không bao giờ commit files chứa passwords
- 🔍 Luôn check `git status` trước khi commit
- 📝 Dùng `.env.example` cho templates
- 🔄 Đổi passwords định kỳ

---

**Last Updated:** Nov 5, 2025
**Status:** 🔴 Credentials đã bị lộ → 🟡 Đang xử lý → 🟢 An toàn (sau khi hoàn thành checklist)

