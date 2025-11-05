/**
 * Script to create the first admin user
 * Run: node create-admin.js
 */

const readline = require('readline');
const User = require('./database/models/User');
const { hashPassword } = require('./utils/auth');
const { testConnection } = require('./database/config');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createAdmin() {
  try {
    console.log('\n🔐 === Tạo Admin User ===\n');

    // Test database connection
    const connected = await testConnection();
    if (!connected) {
      console.log('❌ Cannot connect to database');
      process.exit(1);
    }

    // Create users table if not exists
    await User.createTable();

    // Get user input
    const username = await question('Tên đăng nhập: ');
    const email = await question('Email: ');
    const password = await question('Mật khẩu (tối thiểu 6 ký tự): ');

    // Validate input
    if (!username || !email || !password) {
      console.log('\n❌ Vui lòng nhập đầy đủ thông tin!');
      rl.close();
      process.exit(1);
    }

    if (password.length < 6) {
      console.log('\n❌ Mật khẩu phải có ít nhất 6 ký tự!');
      rl.close();
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      console.log('\n❌ Tên đăng nhập đã tồn tại!');
      rl.close();
      process.exit(1);
    }

    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      console.log('\n❌ Email đã tồn tại!');
      rl.close();
      process.exit(1);
    }

    // Hash password
    console.log('\n⏳ Đang tạo user...');
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'admin'
    });

    console.log('\n✅ Admin user đã được tạo thành công!');
    console.log('\n📋 Thông tin:');
    console.log(`   Username: ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log('\n🎉 Bạn có thể đăng nhập vào /login với thông tin trên!');

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Lỗi:', error.message);
    rl.close();
    process.exit(1);
  }
}

// Run the script
createAdmin();


