/**
 * Script để cập nhật thông tin admin user
 * Usage: node update-admin.js
 */

const readline = require('readline');
const User = require('./database/models/User');
const { hashPassword } = require('./utils/auth');
const { testConnection, pool } = require('./database/config');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function updateAdmin() {
  try {
    console.log('\n🔧 === Cập nhật thông tin Admin ===\n');

    // Test database connection
    const connected = await testConnection();
    if (!connected) {
      console.log('❌ Không thể kết nối database');
      process.exit(1);
    }

    // Hiển thị danh sách users
    console.log('📋 Danh sách tài khoản hiện tại:\n');
    const users = await User.getAll();
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id} | Username: ${user.username} | Email: ${user.email} | Role: ${user.role}`);
    });

    console.log('\n');
    const userId = await question('Nhập ID của tài khoản muốn cập nhật: ');

    // Find user
    const user = await User.findById(parseInt(userId));
    if (!user) {
      console.log('\n❌ Không tìm thấy user với ID này!');
      rl.close();
      process.exit(1);
    }

    console.log('\n📝 Thông tin hiện tại:');
    console.log(`   Username: ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log('\n💡 Để giữ nguyên thông tin, nhấn Enter để bỏ qua\n');

    // Get new information
    const newUsername = await question(`Username mới (hiện tại: ${user.username}): `);
    const newEmail = await question(`Email mới (hiện tại: ${user.email}): `);
    const newPassword = await question('Mật khẩu mới (để trống nếu không đổi): ');

    // Validate
    if (newPassword && newPassword.length < 6) {
      console.log('\n❌ Mật khẩu phải có ít nhất 6 ký tự!');
      rl.close();
      process.exit(1);
    }

    // Check if new username already exists (if changed)
    if (newUsername && newUsername !== user.username) {
      const existingUser = await User.findByUsername(newUsername);
      if (existingUser) {
        console.log('\n❌ Username này đã tồn tại!');
        rl.close();
        process.exit(1);
      }
    }

    // Check if new email already exists (if changed)
    if (newEmail && newEmail !== user.email) {
      const existingEmail = await User.findByEmail(newEmail);
      if (existingEmail) {
        console.log('\n❌ Email này đã tồn tại!');
        rl.close();
        process.exit(1);
      }
    }

    // Build update query
    const updates = [];
    const values = [];

    if (newUsername && newUsername !== user.username) {
      updates.push('username = ?');
      values.push(newUsername);
    }

    if (newEmail && newEmail !== user.email) {
      updates.push('email = ?');
      values.push(newEmail);
    }

    if (newPassword) {
      const hashedPassword = await hashPassword(newPassword);
      updates.push('password = ?');
      values.push(hashedPassword);
    }

    if (updates.length === 0) {
      console.log('\n⚠️  Không có thông tin nào được thay đổi!');
      rl.close();
      process.exit(0);
    }

    // Confirm
    console.log('\n⚠️  Xác nhận cập nhật:');
    if (newUsername && newUsername !== user.username) {
      console.log(`   Username: ${user.username} → ${newUsername}`);
    }
    if (newEmail && newEmail !== user.email) {
      console.log(`   Email: ${user.email} → ${newEmail}`);
    }
    if (newPassword) {
      console.log(`   Password: sẽ được đổi`);
    }

    const confirm = await question('\nBạn có chắc chắn? (yes/no): ');
    if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
      console.log('\n❌ Đã hủy!');
      rl.close();
      process.exit(0);
    }

    // Update user
    console.log('\n⏳ Đang cập nhật...');
    values.push(userId);
    
    const query = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = ?
    `;

    const connection = await pool.getConnection();
    await connection.query(query, values);
    connection.release();

    console.log('\n✅ Cập nhật thành công!');
    console.log('\n📋 Thông tin mới:');
    console.log(`   Username: ${newUsername || user.username}`);
    console.log(`   Email: ${newEmail || user.email}`);
    if (newPassword) {
      console.log(`   Password: đã được cập nhật`);
    }
    console.log('\n🎉 Bạn có thể đăng nhập với thông tin mới!');

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Lỗi:', error.message);
    rl.close();
    process.exit(1);
  }
}

// Run the script
updateAdmin();

