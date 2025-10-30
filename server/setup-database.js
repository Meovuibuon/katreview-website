const mysql = require('mysql2/promise');

async function setupDatabase() {
  try {
    console.log('🔧 Setting up MySQL database...');
    
    // Connect to the database
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'katreview_user',
      password: 'katreview123',
      database: 'katreview_db'
    });

    console.log('✅ Connected to MySQL database');

    // Check if tables exist and add sample data
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('✅ Database tables:', tables.map(t => Object.values(t)[0]));

    // Add sample data if tables are empty
    const [categoriesCount] = await connection.execute('SELECT COUNT(*) as count FROM categories');
    if (categoriesCount[0].count === 0) {
      console.log('📝 Adding sample categories...');
      await connection.execute(`
        INSERT INTO categories (name, slug, description) VALUES
        ('Review', 'review', 'Đánh giá sản phẩm và dịch vụ chất lượng'),
        ('So Sánh', 'so-sanh', 'So sánh các sản phẩm và dịch vụ'),
        ('Tin Tức', 'tin-tuc', 'Tin tức công nghệ và đời sống')
      `);
      console.log('✅ Sample categories added');
    }

    const [articlesCount] = await connection.execute('SELECT COUNT(*) as count FROM articles');
    if (articlesCount[0].count === 0) {
      console.log('📝 Adding sample articles...');
      await connection.execute(`
        INSERT INTO articles (title, slug, meta_description, description, content, author_name, author_email, category_id, featured, views) VALUES
        ('Đánh giá iPhone 15 Pro Max: Flagship đáng giá nhất năm 2024', 'danh-gia-iphone-15-pro-max-flagship-dang-gia-nhat-nam-2024', 'Đánh giá chi tiết iPhone 15 Pro Max với camera 48MP, chip A17 Pro và thiết kế titan cao cấp', 'iPhone 15 Pro Max mang đến những cải tiến đáng kể về camera, hiệu năng và thiết kế. Đây có phải là smartphone đáng mua nhất năm 2024?', '<h2>Thiết kế và chất liệu</h2><p>iPhone 15 Pro Max được làm từ titan nguyên khối, mang đến cảm giác cao cấp và bền bỉ. Khung máy mỏng hơn so với thế hệ trước nhưng vẫn chắc chắn.</p><h2>Camera 48MP</h2><p>Camera chính 48MP với cảm biến lớn hơn, khả năng chụp ảnh trong điều kiện thiếu sáng được cải thiện đáng kể. Tính năng zoom quang học 5x cho chất lượng hình ảnh tuyệt vời.</p><h2>Hiệu năng</h2><p>Chip A17 Pro với tiến trình 3nm mang đến hiệu năng mạnh mẽ, tiết kiệm pin và hỗ trợ ray tracing cho trải nghiệm gaming tốt hơn.</p><h2>Kết luận</h2><p>iPhone 15 Pro Max là một flagship xuất sắc với camera và hiệu năng hàng đầu. Tuy nhiên, giá bán cao có thể là rào cản với nhiều người dùng.</p>', 'Nguyễn Minh Tá', 'minhta@katreview.com', 1, TRUE, 1250),
        ('So sánh Samsung Galaxy S24 Ultra vs iPhone 15 Pro Max', 'so-sanh-samsung-galaxy-s24-ultra-vs-iphone-15-pro-max', 'So sánh chi tiết Samsung Galaxy S24 Ultra và iPhone 15 Pro Max về camera, hiệu năng và tính năng', 'Cuộc chiến giữa hai flagship hàng đầu: Samsung Galaxy S24 Ultra và iPhone 15 Pro Max. Đâu là lựa chọn tốt nhất?', '<h2>Camera</h2><p>Samsung Galaxy S24 Ultra có camera 200MP với zoom quang học 10x, trong khi iPhone 15 Pro Max có camera 48MP với zoom 5x. Galaxy S24 Ultra thắng về độ phân giải và zoom.</p><h2>Hiệu năng</h2><p>Cả hai đều sử dụng chip mạnh nhất của hãng. Snapdragon 8 Gen 3 của Samsung và A17 Pro của Apple đều mang đến hiệu năng xuất sắc.</p><h2>Hệ điều hành</h2><p>iOS 17 của Apple mang đến trải nghiệm mượt mà và tích hợp tốt với hệ sinh thái Apple. Android 14 của Samsung linh hoạt hơn và có nhiều tùy chỉnh.</p><h2>Giá bán</h2><p>Cả hai đều có giá bán cao, khoảng 30-35 triệu đồng. Samsung Galaxy S24 Ultra có thể rẻ hơn một chút.</p>', 'Trần Văn Nam', 'nam@katreview.com', 2, TRUE, 980),
        ('Tin tức: Apple ra mắt MacBook Pro M3 với hiệu năng vượt trội', 'tin-tuc-apple-ra-mat-macbook-pro-m3-voi-hieu-nang-vuot-troi', 'Apple chính thức ra mắt MacBook Pro M3 với chip M3, M3 Pro và M3 Max, hiệu năng tăng 20% so với thế hệ trước', 'Apple vừa ra mắt dòng MacBook Pro mới với chip M3 series, mang đến hiệu năng và thời lượng pin tốt hơn đáng kể.', '<h2>Chip M3 Series</h2><p>Apple ra mắt ba phiên bản chip M3: M3, M3 Pro và M3 Max. Chip M3 Max có thể xử lý các tác vụ nặng như render video 8K một cách mượt mà.</p><h2>Thời lượng pin</h2><p>MacBook Pro M3 có thời lượng pin lên đến 22 giờ, tăng 20% so với thế hệ trước. Điều này nhờ vào tiến trình 3nm của TSMC.</p><h2>Giá bán</h2><p>MacBook Pro 14 inch M3 có giá từ 1,599 USD, MacBook Pro 16 inch M3 Pro từ 2,499 USD. Giá bán tại Việt Nam sẽ được công bố trong thời gian tới.</p><h2>Tính năng mới</h2><p>Hỗ trợ WiFi 6E, Thunderbolt 4, và màn hình Liquid Retina XDR với độ sáng lên đến 1,600 nits.</p>', 'Lê Thị Hương', 'huong@katreview.com', 3, FALSE, 756)
      `);
      console.log('✅ Sample articles added');
    }
    console.log('🎉 MySQL setup completed!');
    
    await connection.end();
    return true;
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    return false;
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = setupDatabase;




