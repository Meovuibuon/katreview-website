# Hướng dẫn Migration Database sang UTF8MB4

## Tổng quan
Database hiện tại đã được cập nhật để hỗ trợ tiếng Việt thông qua character set UTF8MB4. UTF8MB4 hỗ trợ đầy đủ các ký tự Unicode, bao gồm tiếng Việt có dấu và emoji.

## Các thay đổi đã thực hiện

### 1. Cập nhật Schema Files
- `schema.sql`: Thêm CHARACTER SET utf8mb4 và COLLATE utf8mb4_unicode_ci
- `create_db.sql`: Tạo database với UTF8MB4 support
- `config.js`: Thêm charset: 'utf8mb4' trong connection config

### 2. Scripts Migration
- `check-charset.js`: Kiểm tra character set hiện tại
- `migrate-to-utf8mb4.js`: Chuyển đổi database hiện tại sang UTF8MB4

## Cách sử dụng

### Kiểm tra Character Set hiện tại
```bash
cd server
npm run check-charset
```

### Migration Database hiện tại
```bash
cd server
npm run migrate-utf8mb4
```

### Tạo Database mới với UTF8MB4
```bash
# Chạy file create_db.sql trong MySQL
mysql -u root -p < database/create_db.sql

# Hoặc chạy schema.sql để tạo tables
mysql -u root -p < database/schema.sql
```

## Lưu ý quan trọng

### Trước khi Migration
1. **Backup database** trước khi chạy migration
2. Đảm bảo MySQL server đang chạy
3. Kiểm tra quyền truy cập database

### Sau khi Migration
1. Kiểm tra lại character set bằng `npm run check-charset`
2. Test việc lưu trữ tiếng Việt
3. Restart server nếu cần

## Character Set Details

### UTF8MB4 vs UTF8
- **UTF8**: Hỗ trợ tối đa 3 bytes, không hỗ trợ emoji và một số ký tự đặc biệt
- **UTF8MB4**: Hỗ trợ tối đa 4 bytes, hỗ trợ đầy đủ Unicode bao gồm emoji và tiếng Việt

### Collation utf8mb4_unicode_ci
- **unicode_ci**: So sánh không phân biệt hoa thường, hỗ trợ đa ngôn ngữ
- Phù hợp cho ứng dụng đa ngôn ngữ như tiếng Việt

## Troubleshooting

### Lỗi thường gặp
1. **Connection refused**: Kiểm tra MySQL server có đang chạy không
2. **Access denied**: Kiểm tra username/password trong database.env
3. **Character set not supported**: Đảm bảo MySQL version >= 5.5.3

### Kiểm tra MySQL Version
```sql
SELECT VERSION();
```

### Kiểm tra Character Set Support
```sql
SHOW CHARACTER SET LIKE 'utf8mb4';
```

## Test Vietnamese Support

Sau khi migration, test với dữ liệu tiếng Việt:

```sql
INSERT INTO articles (title, content) VALUES 
('Test tiếng Việt', 'Đây là nội dung tiếng Việt có dấu: àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ');

SELECT * FROM articles WHERE title LIKE '%tiếng%';
```

Nếu query trả về kết quả chính xác, migration đã thành công!





