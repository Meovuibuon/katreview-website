const mysql = require('mysql2/promise');
require('dotenv').config({ path: './database.env' });

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'katreview_db',
  port: process.env.DB_PORT || 3306,
  charset: 'utf8mb4'
};

// Check current character set configuration
const checkCharset = async () => {
  let connection;
  
  try {
    console.log('🔍 Checking current character set configuration...');
    
    // Connect to MySQL server
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Check database character set
    console.log('\n📊 Database Character Set:');
    const [dbInfo] = await connection.execute(`SELECT DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = '${dbConfig.database}'`);
    console.log(`   Character Set: ${dbInfo[0].DEFAULT_CHARACTER_SET_NAME}`);
    console.log(`   Collation: ${dbInfo[0].DEFAULT_COLLATION_NAME}`);

    // Check all tables
    console.log('\n📋 Table Character Sets:');
    const [tables] = await connection.execute('SHOW TABLES');
    const tableNames = tables.map(row => Object.values(row)[0]);

    if (tableNames.length === 0) {
      console.log('   No tables found');
    } else {
      for (const tableName of tableNames) {
        const [tableInfo] = await connection.execute(`SELECT TABLE_COLLATION FROM information_schema.TABLES WHERE TABLE_SCHEMA = '${dbConfig.database}' AND TABLE_NAME = '${tableName}'`);
        console.log(`   ${tableName}: ${tableInfo[0].TABLE_COLLATION}`);
      }
    }

    // Check if UTF8MB4 is properly configured
    const isUTF8MB4 = dbInfo[0].DEFAULT_CHARACTER_SET_NAME === 'utf8mb4' && 
                      dbInfo[0].DEFAULT_COLLATION_NAME === 'utf8mb4_unicode_ci';
    
    console.log('\n🎯 Status:');
    if (isUTF8MB4) {
      console.log('   ✅ Database is properly configured for Vietnamese support (UTF8MB4)');
    } else {
      console.log('   ❌ Database needs to be migrated to UTF8MB4 for Vietnamese support');
      console.log('   💡 Run: node migrate-to-utf8mb4.js');
    }

    // Test Vietnamese character support
    console.log('\n🧪 Testing Vietnamese character support:');
    try {
      // Try to insert a test record with Vietnamese characters
      await connection.execute(`
        CREATE TEMPORARY TABLE test_vietnamese (
          id INT AUTO_INCREMENT PRIMARY KEY,
          text VARCHAR(255)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      
      await connection.execute(`INSERT INTO test_vietnamese (text) VALUES (?)`, ['Xin chào! Đây là tiếng Việt có dấu: àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ']);
      
      const [result] = await connection.execute('SELECT text FROM test_vietnamese WHERE id = 1');
      console.log('   ✅ Vietnamese characters test passed');
      console.log(`   📝 Test text: ${result[0].text}`);
      
    } catch (error) {
      console.log('   ❌ Vietnamese characters test failed:', error.message);
    }

  } catch (error) {
    console.error('❌ Check failed:', error.message);
    console.error('💡 Make sure MySQL is running and database exists');
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
};

// Run check if this script is executed directly
if (require.main === module) {
  checkCharset()
    .then(() => {
      console.log('\n✅ Character set check completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Character set check failed:', error);
      process.exit(1);
    });
}

module.exports = { checkCharset };





