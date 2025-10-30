const { pool } = require('./database/config');

const fixes = [
  {
    slug: 'danh-gia-iphone-15-pro-max-flagship-dang-gia-nhat-nam-2024',
    title: 'Đánh giá iPhone 15 Pro Max: Flagship đáng giá nhất năm 2024',
    meta_description: 'Đánh giá chi tiết iPhone 15 Pro Max với camera 48MP, chip A17 Pro và thiết kế titan cao cấp',
    description: 'iPhone 15 Pro Max mang đến những cải tiến đáng kể về camera, hiệu năng và thiết kế. Đây có phải là smartphone đáng mua nhất năm 2024?',
    content: '<h2>Thiết kế và chất liệu</h2><p>iPhone 15 Pro Max được làm từ titan nguyên khối, mang đến cảm giác cao cấp và bền bỉ. Khung máy mỏng hơn so với thế hệ trước nhưng vẫn chắc chắn.</p><h2>Camera 48MP</h2><p>Camera chính 48MP với cảm biến lớn hơn, khả năng chụp ảnh trong điều kiện thiếu sáng được cải thiện đáng kể. Tính năng zoom quang học 5x cho chất lượng hình ảnh tuyệt vời.</p><h2>Hiệu năng</h2><p>Chip A17 Pro với tiến trình 3nm mang đến hiệu năng mạnh mẽ, tiết kiệm pin và hỗ trợ ray tracing cho trải nghiệm gaming tốt hơn.</p><h2>Kết luận</h2><p>iPhone 15 Pro Max là một flagship xuất sắc với camera và hiệu năng hàng đầu. Tuy nhiên, giá bán cao có thể là rào cản với nhiều người dùng.</p>',
    author_name: 'Nguyễn Minh Tá'
  },
  {
    slug: 'so-sanh-samsung-galaxy-s24-ultra-vs-iphone-15-pro-max',
    title: 'So sánh Samsung Galaxy S24 Ultra vs iPhone 15 Pro Max',
    meta_description: 'So sánh chi tiết Samsung Galaxy S24 Ultra và iPhone 15 Pro Max về camera, hiệu năng và tính năng',
    description: 'Cuộc chiến giữa hai flagship hàng đầu: Samsung Galaxy S24 Ultra và iPhone 15 Pro Max. Đâu là lựa chọn tốt nhất?',
    content: '<h2>Camera</h2><p>Samsung Galaxy S24 Ultra có camera 200MP với zoom quang học 10x, trong khi iPhone 15 Pro Max có camera 48MP với zoom 5x. Galaxy S24 Ultra thắng về độ phân giải và zoom.</p><h2>Hiệu năng</h2><p>Cả hai đều sử dụng chip mạnh nhất của hãng. Snapdragon 8 Gen 3 của Samsung và A17 Pro của Apple đều mang đến hiệu năng xuất sắc.</p><h2>Hệ điều hành</h2><p>iOS 17 của Apple mang đến trải nghiệm mượt mà và tích hợp tốt với hệ sinh thái Apple. Android 14 của Samsung linh hoạt hơn và có nhiều tùy chỉnh.</p><h2>Giá bán</h2><p>Cả hai đều có giá bán cao, khoảng 30-35 triệu đồng. Samsung Galaxy S24 Ultra có thể rẻ hơn một chút.</p>',
    author_name: 'Trần Văn Nam'
  },
  {
    slug: 'tin-tuc-apple-ra-mat-macbook-pro-m3-voi-hieu-nang-vuot-troi',
    title: 'Tin tức: Apple ra mắt MacBook Pro M3 với hiệu năng vượt trội',
    meta_description: 'Apple chính thức ra mắt MacBook Pro M3 với chip M3, M3 Pro và M3 Max, hiệu năng tăng 20% so với thế hệ trước',
    description: 'Apple vừa ra mắt dòng MacBook Pro mới với chip M3 series, mang đến hiệu năng và thời lượng pin tốt hơn đáng kể.',
    content: '<h2>Chip M3 Series</h2><p>Apple ra mắt ba phiên bản chip M3: M3, M3 Pro và M3 Max. Chip M3 Max có thể xử lý các tác vụ nặng như render video 8K một cách mượt mà.</p><h2>Thời lượng pin</h2><p>MacBook Pro M3 có thời lượng pin lên đến 22 giờ, tăng 20% so với thế hệ trước. Điều này nhờ vào tiến trình 3nm của TSMC.</p><h2>Giá bán</h2><p>MacBook Pro 14 inch M3 có giá từ 1,599 USD, MacBook Pro 16 inch M3 Pro từ 2,499 USD. Giá bán tại Việt Nam sẽ được công bố trong thời gian tới.</p><h2>Tính năng mới</h2><p>Hỗ trợ WiFi 6E, Thunderbolt 4, và màn hình Liquid Retina XDR với độ sáng lên đến 1,600 nits.</p>',
    author_name: 'Lê Thị Hương'
  }
];

async function run() {
  const conn = await pool.getConnection();
  try {
    console.log('🔧 Repairing Vietnamese text for articles...');
    for (const f of fixes) {
      const [rows] = await conn.execute('SELECT id FROM articles WHERE slug = ?', [f.slug]);
      if (rows.length === 0) {
        console.log(`- Skip (not found): ${f.slug}`);
        continue;
      }
      await conn.execute(
        `UPDATE articles SET 
          title = ?,
          meta_description = ?,
          description = ?,
          content = ?,
          author_name = ?
        WHERE slug = ?`,
        [f.title, f.meta_description, f.description, f.content, f.author_name, f.slug]
      );
      console.log(`✅ Fixed: ${f.slug}`);
    }
    console.log('🎉 Repair completed.');
  } catch (e) {
    console.error('❌ Repair failed:', e.message);
    process.exitCode = 1;
  } finally {
    conn.release();
  }
}

if (require.main === module) {
  run().then(() => process.exit(0));
}

module.exports = { run };
