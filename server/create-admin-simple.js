/**
 * Simple script to create admin user with command-line arguments
 * Usage: node create-admin-simple.js <username> <email> <password>
 * Example: node create-admin-simple.js admin admin@example.com mypassword123
 */

const User = require('./database/models/User');
const { hashPassword } = require('./utils/auth');
const { testConnection } = require('./database/config');

async function createAdmin() {
  try {
    console.log('\n🔐 === Creating Admin User ===\n');

    // Get arguments from command line
    const username = process.argv[2];
    const email = process.argv[3];
    const password = process.argv[4];

    // Validate input
    if (!username || !email || !password) {
      console.log('❌ Usage: node create-admin-simple.js <username> <email> <password>');
      console.log('Example: node create-admin-simple.js admin admin@example.com mypassword123\n');
      process.exit(1);
    }

    if (password.length < 6) {
      console.log('❌ Password must be at least 6 characters!\n');
      process.exit(1);
    }

    // Test database connection
    const connected = await testConnection();
    if (!connected) {
      console.log('❌ Cannot connect to database');
      process.exit(1);
    }

    // Create users table if not exists
    await User.createTable();

    // Check if user already exists
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      console.log(`❌ Username "${username}" already exists!\n`);
      process.exit(1);
    }

    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      console.log(`❌ Email "${email}" already exists!\n`);
      process.exit(1);
    }

    // Hash password
    console.log('⏳ Creating admin user...');
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'admin'
    });

    console.log('\n✅ Admin user created successfully!');
    console.log('\n📋 Account Details:');
    console.log(`   Username: ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log('\n🎉 You can now login at http://localhost:3000/login\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
createAdmin();

