# 🔐 Hướng dẫn Xác thực JWT - Authentication Guide

## Tổng quan

Website của bạn giờ đã có hệ thống xác thực JWT (JSON Web Token) bảo vệ toàn bộ trang admin. Chỉ người dùng đã đăng nhập mới có thể:
- Tạo, sửa, xóa bài viết
- Quản lý danh mục
- Truy cập trang admin

---

## 🎯 Tính năng

### Backend (Server)
✅ **User Model** - Database table lưu thông tin user
✅ **Password Hashing** - Mật khẩu được mã hóa bằng bcrypt
✅ **JWT Token** - Token hết hạn sau 24 giờ
✅ **Protected Routes** - Các API admin được bảo vệ
✅ **Auth Middleware** - Kiểm tra token tự động

### Frontend (Client)
✅ **Login Page** - Giao diện đăng nhập đẹp mắt
✅ **Protected Routes** - Chặn truy cập nếu chưa login
✅ **Auth Context** - Quản lý trạng thái đăng nhập
✅ **Auto Logout** - Tự động logout khi token hết hạn
✅ **Token Management** - Lưu token trong localStorage

---

## 📦 Cấu trúc Files Mới

### Backend
```
server/
├── database/
│   └── models/
│       └── User.js              ← User model (MySQL)
├── routes/
│   └── auth.js                  ← Auth routes (login, register, verify)
├── utils/
│   └── auth.js                  ← Auth utilities (JWT, bcrypt, middleware)
├── create-admin.js              ← Script tạo admin user
└── index.js                     ← Updated với auth routes
```

### Frontend
```
client/src/
├── context/
│   └── AuthContext.js           ← Auth context & provider
├── components/
│   └── ProtectedRoute.js        ← Protected route component
├── pages/
│   ├── LoginPage.js             ← Login page
│   └── AdminPage.js             ← Updated với logout button
├── services/
│   ├── api.js                   ← Updated với auth interceptors
│   └── authService.js           ← Auth service API
└── App.js                       ← Updated với AuthProvider
```

---

## 🚀 Cài đặt & Sử dụng

### Bước 1: Tạo Admin User Đầu Tiên

Chạy script để tạo tài khoản admin:

```bash
cd server
node create-admin.js
```

Script sẽ hỏi:
```
Tên đăng nhập: admin
Email: admin@example.com
Mật khẩu (tối thiểu 6 ký tự): ******
```

✅ **Hoàn tất!** Admin user đã được tạo.

### Bước 2: Khởi động Server

```bash
# Terminal 1 - Backend
cd server
npm start
```

```bash
# Terminal 2 - Frontend
cd client
npm start
```

### Bước 3: Đăng nhập

1. Mở trình duyệt: `http://localhost:3000/login`
2. Nhập username và password
3. Nhấn "Đăng nhập"
4. Tự động chuyển đến `/admin`

---

## 🔒 Bảo mật

### Token Expiration
- Token hết hạn sau **24 giờ**
- Tự động logout khi token expired
- Redirect về `/login`

### Password Security
- Mật khẩu được hash bằng **bcrypt** (10 rounds)
- Không bao giờ lưu plain text password
- Tối thiểu 6 ký tự

### Protected Routes
**Backend routes được bảo vệ:**
- `POST /api/articles` - Tạo bài viết
- `PUT /api/articles/:id` - Sửa bài viết
- `DELETE /api/articles/:id` - Xóa bài viết
- `POST /api/categories` - Tạo danh mục
- `PUT /api/categories/:id` - Sửa danh mục
- `DELETE /api/categories/:id` - Xóa danh mục

**Public routes (không cần login):**
- `GET /api/articles` - Xem bài viết
- `GET /api/articles/:slug` - Xem chi tiết
- `GET /api/categories` - Xem danh mục

---

## 🛠️ API Endpoints

### Auth APIs

#### 1. Register (Đăng ký)
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "admin",
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 2. Login (Đăng nhập)
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 3. Verify Token
```http
GET /api/auth/verify
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "role": "admin"
    }
  }
}
```

---

## 💻 Sử dụng trong Code

### Frontend - Đăng nhập

```javascript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { login, user, isAuthenticated, logout } = useAuth();
  
  const handleLogin = async () => {
    const result = await login('admin', 'password123');
    if (result.success) {
      console.log('Đăng nhập thành công!');
    }
  };
  
  return (
    <div>
      {isAuthenticated ? (
        <p>Xin chào, {user.username}!</p>
      ) : (
        <button onClick={handleLogin}>Đăng nhập</button>
      )}
    </div>
  );
}
```

### Frontend - Protected API Call

```javascript
import { articlesAPI } from '../services/api';

// Token tự động được thêm vào header
const createArticle = async () => {
  try {
    const response = await articlesAPI.create({
      title: 'Bài viết mới',
      content: 'Nội dung...'
    });
    console.log('Created:', response.data);
  } catch (error) {
    // Nếu token invalid, tự động redirect về /login
    console.error('Error:', error);
  }
};
```

---

## 🎨 Giao diện Login

Login page có:
- 🎨 Gradient background đẹp mắt
- 🔒 Icon khóa
- ✨ Animation smooth
- ⚠️ Error messages rõ ràng
- 📱 Responsive trên mobile

---

## 🔧 Troubleshooting

### Lỗi: "No token provided"
**Nguyên nhân:** Chưa đăng nhập
**Giải pháp:** Đăng nhập tại `/login`

### Lỗi: "Invalid or expired token"
**Nguyên nhân:** Token hết hạn (>24h)
**Giải pháp:** Đăng nhập lại

### Lỗi: "Invalid credentials"
**Nguyên nhân:** Sai username hoặc password
**Giải pháp:** Kiểm tra lại thông tin

### Không thể truy cập /admin
**Nguyên nhân:** Chưa đăng nhập
**Giải pháp:** Tự động redirect về `/login`

---

## 🔑 Environment Variables

Thêm vào `server/.env` (hoặc tạo mới):

```env
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRES_IN=24h
```

**⚠️ QUAN TRỌNG:** Đổi `JWT_SECRET` trong production!

---

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'editor') DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  INDEX idx_username (username),
  INDEX idx_email (email)
);
```

---

## 🎯 Tính năng tương lai

Có thể thêm:
- [ ] Remember me (persistent login)
- [ ] Password reset via email
- [ ] Two-factor authentication (2FA)
- [ ] Multiple admin roles (admin, editor, viewer)
- [ ] Activity logging
- [ ] Session management
- [ ] IP whitelist
- [ ] Rate limiting

---

## 📝 Testing

### Tạo test user
```bash
node server/create-admin.js
```

### Test login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'
```

### Test protected route
```bash
curl -X POST http://localhost:5000/api/articles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"title":"Test","content":"..."}'
```

---

## ✅ Checklist

- [x] Backend authentication
- [x] JWT token generation
- [x] Password hashing
- [x] Protected routes
- [x] Login page
- [x] Auth context
- [x] Protected frontend routes
- [x] Auto logout
- [x] Logout button
- [x] Token in API requests
- [x] Create admin script
- [x] Documentation

---

## 🆘 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra console log (F12)
2. Kiểm tra Network tab
3. Xem server logs
4. Đảm bảo MySQL đang chạy
5. Đảm bảo đã tạo admin user

---

## 🎉 Hoàn tất!

Website của bạn giờ đã an toàn! Chỉ người có tài khoản mới quản lý được nội dung.

**Credentials mặc định:**
- URL: `http://localhost:3000/login`
- Username: (tạo bằng `create-admin.js`)
- Password: (nhập khi chạy script)

**🔒 Giữ thông tin đăng nhập bí mật!**


