/**
 * Script khẩn cấp để đổi database password
 * Chạy ngay khi phát hiện credentials bị lộ
 */

const mysql = require('mysql2/promise');
const readline = require('readline');
require('dotenv').config({ path: './database.env' });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function changePassword() {
  try {
    console.log('\n🚨 === KHẨN CẤP: Đổi Database Password ===\n');
    console.log('⚠️  Chỉ chạy script này khi database credentials đã bị lộ!\n');

    // Kết nối với database hiện tại
    console.log('📡 Đang kết nối database...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306,
      database: 'mysql' // Kết nối vào mysql system database
    });

    console.log('✅ Đã kết nối thành công!\n');

    // Hiển thị thông tin hiện tại
    console.log('📋 Thông tin hiện tại:');
    console.log(`   User: ${process.env.DB_USER}`);
    console.log(`   Host: ${process.env.DB_HOST}`);
    console.log(`   Password: ${process.env.DB_PASSWORD} (SẼ ĐỔI)`);
    console.log('');

    // Nhập password mới
    const newPassword = await question('🔐 Nhập password MỚI (tối thiểu 12 ký tự): ');

    if (newPassword.length < 12) {
      console.log('\n❌ Password phải có ít nhất 12 ký tự cho bảo mật!');
      rl.close();
      process.exit(1);
    }

    const confirmPassword = await question('🔐 Nhập lại password để xác nhận: ');

    if (newPassword !== confirmPassword) {
      console.log('\n❌ Password không khớp!');
      rl.close();
      process.exit(1);
    }

    // Confirm
    console.log('\n⚠️  XÁC NHẬN:');
    console.log(`   Bạn sắp đổi password cho user: ${process.env.DB_USER}@${process.env.DB_HOST}`);
    console.log('   Password mới: ' + '*'.repeat(newPassword.length));
    
    const confirm = await question('\nTiếp tục? (yes/no): ');
    if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
      console.log('\n❌ Đã hủy!');
      rl.close();
      connection.end();
      process.exit(0);
    }

    // Đổi password
    console.log('\n⏳ Đang đổi password...');
    await connection.query(
      `ALTER USER ?@? IDENTIFIED BY ?`,
      [process.env.DB_USER, process.env.DB_HOST, newPassword]
    );
    await connection.query('FLUSH PRIVILEGES');

    console.log('✅ Password đã được đổi thành công!\n');

    // Hướng dẫn cập nhật file env
    console.log('📝 QUAN TRỌNG - Cập nhật file database.env:');
    console.log('');
    console.log('   1. Mở file: server/database.env');
    console.log('   2. Đổi dòng:');
    console.log(`      DB_PASSWORD=${process.env.DB_PASSWORD}`);
    console.log('   3. Thành:');
    console.log(`      DB_PASSWORD=${newPassword}`);
    console.log('');
    console.log('   4. Lưu file và restart server');
    console.log('');
    console.log('🔄 Hoặc chạy lệnh này (PowerShell):');
    console.log(`   (Get-Content server/database.env) -replace 'DB_PASSWORD=.*', 'DB_PASSWORD=${newPassword}' | Set-Content server/database.env`);

    rl.close();
    connection.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Lỗi:', error.message);
    console.log('\n💡 Nếu lỗi "Access denied", thử:');
    console.log('   1. Đăng nhập MySQL bằng root user');
    console.log('   2. Chạy: ALTER USER \'katreview_user\'@\'localhost\' IDENTIFIED BY \'new_password\';');
    rl.close();
    process.exit(1);
  }
}

changePassword();

