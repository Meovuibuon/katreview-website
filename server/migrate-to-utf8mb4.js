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

// Migration script to convert existing database to UTF8MB4
const migrateToUTF8MB4 = async () => {
  let connection;
  
  try {
    console.log('🔄 Starting migration to UTF8MB4...');
    
    // Connect to MySQL server (without specifying database)
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port,
      charset: 'utf8mb4'
    });

    console.log('✅ Connected to MySQL server');

    // Convert database to UTF8MB4
    console.log('🔄 Converting database to UTF8MB4...');
    await connection.execute(`ALTER DATABASE ${dbConfig.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log('✅ Database character set updated to UTF8MB4');

    // Use the database
    await connection.execute(`USE ${dbConfig.database}`);

    // Get all tables
    const [tables] = await connection.execute('SHOW TABLES');
    const tableNames = tables.map(row => Object.values(row)[0]);

    console.log(`📋 Found ${tableNames.length} tables to migrate:`, tableNames);

    // Convert each table to UTF8MB4
    for (const tableName of tableNames) {
      console.log(`🔄 Converting table '${tableName}' to UTF8MB4...`);
      
      // Convert table character set
      await connection.execute(`ALTER TABLE ${tableName} CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      
      console.log(`✅ Table '${tableName}' converted successfully`);
    }

    // Verify the conversion
    console.log('🔍 Verifying character set conversion...');
    
    // Check database character set
    const [dbInfo] = await connection.execute(`SELECT DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = '${dbConfig.database}'`);
    console.log('📊 Database character set:', dbInfo[0]);

    // Check table character sets
    for (const tableName of tableNames) {
      const [tableInfo] = await connection.execute(`SELECT TABLE_COLLATION FROM information_schema.TABLES WHERE TABLE_SCHEMA = '${dbConfig.database}' AND TABLE_NAME = '${tableName}'`);
      console.log(`📊 Table '${tableName}' collation:`, tableInfo[0].TABLE_COLLATION);
    }

    console.log('🎉 Migration to UTF8MB4 completed successfully!');
    console.log('💡 Your database now supports Vietnamese characters and emojis');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('💡 Make sure MySQL is running and you have proper permissions');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
};

// Run migration if this script is executed directly
if (require.main === module) {
  migrateToUTF8MB4()
    .then(() => {
      console.log('✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateToUTF8MB4 };





