const { pool } = require('./database/config');

async function convertTableCharset(connection) {
  // Ensure table and all text columns use utf8mb4
  await connection.execute("ALTER TABLE categories CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
}

const fixes = [
  {
    slug: 'review',
    name: 'Review',
    description: 'Đánh giá sản phẩm và dịch vụ chất lượng'
  },
  {
    slug: 'so-sanh',
    name: 'So Sánh',
    description: 'So sánh các sản phẩm và dịch vụ'
  },
  {
    slug: 'tin-tuc',
    name: 'Tin Tức',
    description: 'Tin tức công nghệ và đời sống'
  }
];

async function normalizeCategoryTexts(connection) {
  for (const f of fixes) {
    const [rows] = await connection.execute('SELECT id FROM categories WHERE slug = ?', [f.slug]);
    if (rows.length === 0) continue;
    await connection.execute(
      'UPDATE categories SET name = ?, description = ? WHERE slug = ? ',
      [f.name, f.description, f.slug]
    );
  }
}

async function run() {
  const conn = await pool.getConnection();
  try {
    console.log('🔄 Converting categories table to utf8mb4...');
    await convertTableCharset(conn);
    console.log('✅ Table converted to utf8mb4');

    console.log('📝 Normalizing Vietnamese texts for categories...');
    await normalizeCategoryTexts(conn);
    console.log('✅ Categories texts updated');
  } catch (e) {
    console.error('❌ Repair categories failed:', e.message);
    process.exitCode = 1;
  } finally {
    conn.release();
  }
}

if (require.main === module) {
  run().then(() => process.exit(0));
}

module.exports = { run };









