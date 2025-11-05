# 🚀 Quick Start - Authentication

## 3 Bước để bắt đầu:

### 1️⃣ Tạo Admin User (Chỉ làm 1 lần)

```bash
cd server
node create-admin.js
```

Nhập thông tin:
```
Tên đăng nhập: admin
Email: admin@example.com  
Mật khẩu: password123 (hoặc bất kỳ, tối thiểu 6 ký tự)
```

✅ **Xong!** Admin user đã được tạo.

---

### 2️⃣ Khởi động Server & Client

**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

---

### 3️⃣ Đăng nhập

1. Mở: `http://localhost:3000/login`
2. Nhập username và password (từ bước 1)
3. Click "Đăng nhập"
4. ✨ Tự động vào trang admin!

---

## 🎯 Những gì đã thay đổi:

### ✅ Được bảo vệ (Cần login):
- `/admin` - Trang quản trị
- Tạo/sửa/xóa bài viết
- Tạo/sửa/xóa danh mục

### ✅ Công khai (Không cần login):
- `/` - Trang chủ
- `/article/:slug` - Xem bài viết
- `/category/:slug` - Xem danh mục

---

## 🔐 Thông tin quan trọng:

### Token hết hạn:
- **24 giờ** sau khi login
- Tự động logout khi hết hạn
- Redirect về `/login`

### Mật khẩu:
- Được mã hóa bằng bcrypt
- Tối thiểu **6 ký tự**
- Không bao giờ lưu dạng plain text

### Logout:
- Click nút **"🚪 Đăng xuất"** ở trang admin
- Hoặc đợi 24h để tự động logout

---

## 💡 Tips

### Quên mật khẩu?
Chạy lại `create-admin.js` với username khác, hoặc xóa user cũ trong database.

### Tạo thêm admin?
Chạy `create-admin.js` nhiều lần với username/email khác nhau.

### Đổi thời gian hết hạn token?
Sửa trong `server/utils/auth.js`:
```javascript
const JWT_EXPIRES_IN = '24h'; // Đổi thành '7d', '30d', etc.
```

---

## 🎨 Demo

**Login Page:**
- Gradient background tím đẹp mắt
- Form đăng nhập đơn giản
- Error messages rõ ràng

**Admin Page:**
- Hiển thị username góc trên
- Nút Logout đỏ
- Tất cả functions như trước

---

## 🐛 Troubleshooting

**Không vào được `/admin`?**
→ Đăng nhập tại `/login` trước

**Báo lỗi "Invalid credentials"?**
→ Kiểm tra username/password

**Token hết hạn?**
→ Đăng nhập lại

**Không tạo được admin user?**
→ Kiểm tra MySQL đang chạy

---

## 📚 Chi tiết đầy đủ

Xem file `AUTHENTICATION_GUIDE.md` để biết thêm chi tiết về:
- Cấu trúc code
- API endpoints
- Bảo mật
- Troubleshooting
- Advanced features

---

## ✅ Checklist

- [ ] Đã chạy `create-admin.js`
- [ ] Server đang chạy (`npm start`)
- [ ] Client đang chạy (`npm start`)
- [ ] Có thể login tại `/login`
- [ ] Có thể vào `/admin`
- [ ] Có thể logout

---

**🎉 Hoàn tất! Website của bạn giờ đã an toàn!**


