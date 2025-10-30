const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));

// File-based database fallback
const DATA_FILE = path.join(__dirname, 'data.json');

// Load data from file or create default data
const loadData = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      return {
        categories: data.categories || [],
        articles: data.articles || []
      };
    }
  } catch (error) {
    console.error('Error loading data file:', error);
  }
  
  // Return default data if file doesn't exist or error
  return {
    categories: [
      {
        _id: '1',
        name: 'Review',
        slug: 'review',
        description: 'Đánh giá sản phẩm và dịch vụ chất lượng',
        createdAt: new Date()
      },
      {
        _id: '2',
        name: 'So Sánh',
        slug: 'so-sanh',
        description: 'So sánh các sản phẩm và dịch vụ',
        createdAt: new Date()
      },
      {
        _id: '3',
        name: 'Tin Tức',
        slug: 'tin-tuc',
        description: 'Tin tức công nghệ và đời sống',
        createdAt: new Date()
      }
    ],
    articles: [
      {
        _id: '1',
        title: 'Đánh giá iPhone 15 Pro Max: Flagship đáng giá nhất năm 2024',
        slug: 'danh-gia-iphone-15-pro-max-flagship-dang-gia-nhat-nam-2024',
        metaDescription: 'Đánh giá chi tiết iPhone 15 Pro Max với camera 48MP, chip A17 Pro và thiết kế titan cao cấp',
        description: 'iPhone 15 Pro Max mang đến những cải tiến đáng kể về camera, hiệu năng và thiết kế. Đây có phải là smartphone đáng mua nhất năm 2024?',
        content: `
          <h2>Thiết kế và chất liệu</h2>
          <p>iPhone 15 Pro Max được làm từ titan nguyên khối, mang đến cảm giác cao cấp và bền bỉ. Khung máy mỏng hơn so với thế hệ trước nhưng vẫn chắc chắn.</p>
          
          <h2>Camera 48MP</h2>
          <p>Camera chính 48MP với cảm biến lớn hơn, khả năng chụp ảnh trong điều kiện thiếu sáng được cải thiện đáng kể. Tính năng zoom quang học 5x cho chất lượng hình ảnh tuyệt vời.</p>
          
          <h2>Hiệu năng</h2>
          <p>Chip A17 Pro với tiến trình 3nm mang đến hiệu năng mạnh mẽ, tiết kiệm pin và hỗ trợ ray tracing cho trải nghiệm gaming tốt hơn.</p>
          
          <h2>Kết luận</h2>
          <p>iPhone 15 Pro Max là một flagship xuất sắc với camera và hiệu năng hàng đầu. Tuy nhiên, giá bán cao có thể là rào cản với nhiều người dùng.</p>
        `,
        images: [],
        author: {
          name: 'Nguyễn Minh Tá',
          email: 'minhta@katreview.com'
        },
        category: '1',
        publishedAt: new Date(),
        updatedAt: new Date(),
        featured: true,
        views: 1250
      },
      {
        _id: '2',
        title: 'So sánh Samsung Galaxy S24 Ultra vs iPhone 15 Pro Max',
        slug: 'so-sanh-samsung-galaxy-s24-ultra-vs-iphone-15-pro-max',
        metaDescription: 'So sánh chi tiết Samsung Galaxy S24 Ultra và iPhone 15 Pro Max về camera, hiệu năng và tính năng',
        description: 'Cuộc chiến giữa hai flagship hàng đầu: Samsung Galaxy S24 Ultra và iPhone 15 Pro Max. Đâu là lựa chọn tốt nhất?',
        content: `
          <h2>Camera</h2>
          <p>Samsung Galaxy S24 Ultra có camera 200MP với zoom quang học 10x, trong khi iPhone 15 Pro Max có camera 48MP với zoom 5x. Galaxy S24 Ultra thắng về độ phân giải và zoom.</p>
          
          <h2>Hiệu năng</h2>
          <p>Cả hai đều sử dụng chip mạnh nhất của hãng. Snapdragon 8 Gen 3 của Samsung và A17 Pro của Apple đều mang đến hiệu năng xuất sắc.</p>
          
          <h2>Hệ điều hành</h2>
          <p>iOS 17 của Apple mang đến trải nghiệm mượt mà và tích hợp tốt với hệ sinh thái Apple. Android 14 của Samsung linh hoạt hơn và có nhiều tùy chỉnh.</p>
          
          <h2>Giá bán</h2>
          <p>Cả hai đều có giá bán cao, khoảng 30-35 triệu đồng. Samsung Galaxy S24 Ultra có thể rẻ hơn một chút.</p>
        `,
        images: [],
        author: {
          name: 'Trần Văn Nam',
          email: 'nam@katreview.com'
        },
        category: '2',
        publishedAt: new Date(),
        updatedAt: new Date(),
        featured: true,
        views: 980
      },
      {
        _id: '3',
        title: 'Tin tức: Apple ra mắt MacBook Pro M3 với hiệu năng vượt trội',
        slug: 'tin-tuc-apple-ra-mat-macbook-pro-m3-voi-hieu-nang-vuot-troi',
        metaDescription: 'Apple chính thức ra mắt MacBook Pro M3 với chip M3, M3 Pro và M3 Max, hiệu năng tăng 20% so với thế hệ trước',
        description: 'Apple vừa ra mắt dòng MacBook Pro mới với chip M3 series, mang đến hiệu năng và thời lượng pin tốt hơn đáng kể.',
        content: `
          <h2>Chip M3 Series</h2>
          <p>Apple ra mắt ba phiên bản chip M3: M3, M3 Pro và M3 Max. Chip M3 Max có thể xử lý các tác vụ nặng như render video 8K một cách mượt mà.</p>
          
          <h2>Thời lượng pin</h2>
          <p>MacBook Pro M3 có thời lượng pin lên đến 22 giờ, tăng 20% so với thế hệ trước. Điều này nhờ vào tiến trình 3nm của TSMC.</p>
          
          <h2>Giá bán</h2>
          <p>MacBook Pro 14 inch M3 có giá từ 1,599 USD, MacBook Pro 16 inch M3 Pro từ 2,499 USD. Giá bán tại Việt Nam sẽ được công bố trong thời gian tới.</p>
          
          <h2>Tính năng mới</h2>
          <p>Hỗ trợ WiFi 6E, Thunderbolt 4, và màn hình Liquid Retina XDR với độ sáng lên đến 1,600 nits.</p>
        `,
        images: [],
        author: {
          name: 'Lê Thị Hương',
          email: 'huong@katreview.com'
        },
        category: '3',
        publishedAt: new Date(),
        updatedAt: new Date(),
        featured: false,
        views: 756
      }
    ]
  };
};

// Save data to file
const saveData = () => {
  try {
    const data = {
      categories,
      articles,
      lastUpdated: new Date().toISOString()
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log('Data saved to file');
  } catch (error) {
    console.error('Error saving data file:', error);
  }
};

// Load initial data
const initialData = loadData();
let categories = initialData.categories;
let articles = initialData.articles;

console.log('Using file-based database (fallback)');
console.log(`Loaded ${categories.length} categories and ${articles.length} articles`);

// Helper functions
const findCategoryById = (id) => categories.find(cat => cat._id === id);
const findCategoryBySlug = (slug) => categories.find(cat => cat.slug === slug);
const findArticleBySlug = (slug) => articles.find(article => article.slug === slug);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ storage: storage });

// Routes
// Categories API
app.get('/api/categories', (req, res) => {
  res.json(categories);
});

app.get('/api/categories/:slug', (req, res) => {
  const category = findCategoryBySlug(req.params.slug);
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }
  res.json(category);
});

app.post('/api/categories', (req, res) => {
  const { name, description } = req.body;
  const slug = name.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim('-');
  
  const newCategory = {
    _id: (categories.length + 1).toString(),
    name,
    slug,
    description,
    createdAt: new Date()
  };
  
  categories.push(newCategory);
  saveData();
  res.status(201).json(newCategory);
});

// Articles API
app.get('/api/articles', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const category = req.query.category;
  const skip = (page - 1) * limit;

  let filteredArticles = articles;
  if (category) {
    const categoryDoc = findCategoryBySlug(category);
    if (categoryDoc) {
      filteredArticles = articles.filter(article => article.category === categoryDoc._id);
    }
  }

  const paginatedArticles = filteredArticles
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(skip, skip + limit)
    .map(article => ({
      ...article,
      category: findCategoryById(article.category)
    }));

  res.json({
    articles: paginatedArticles,
    totalPages: Math.ceil(filteredArticles.length / limit),
    currentPage: page,
    total: filteredArticles.length
  });
});

app.get('/api/articles/latest', (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  const latestArticles = articles
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, limit)
    .map(article => ({
      ...article,
      category: findCategoryById(article.category)
    }));

  res.json(latestArticles);
});

app.get('/api/articles/category/:categorySlug', (req, res) => {
  const { categorySlug } = req.params;
  const limit = parseInt(req.query.limit) || 6;

  const category = findCategoryBySlug(categorySlug);
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }

  const categoryArticles = articles
    .filter(article => article.category === category._id)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, limit)
    .map(article => ({
      ...article,
      category: findCategoryById(article.category)
    }));

  res.json(categoryArticles);
});

app.get('/api/articles/:slug', (req, res) => {
  const article = findArticleBySlug(req.params.slug);
  if (!article) {
    return res.status(404).json({ message: 'Article not found' });
  }

  // Increment view count
  article.views += 1;

  const articleWithCategory = {
    ...article,
    category: findCategoryById(article.category)
  };

  res.json(articleWithCategory);
});

app.get('/api/articles/:slug/related', (req, res) => {
  const article = findArticleBySlug(req.params.slug);
  if (!article) {
    return res.status(404).json({ message: 'Article not found' });
  }

  const relatedArticles = articles
    .filter(a => a.category === article.category && a._id !== article._id)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, 4)
    .map(a => ({
      ...a,
      category: findCategoryById(a.category)
    }));

  res.json(relatedArticles);
});

app.post('/api/articles', upload.array('images', 10), (req, res) => {
  const {
    title,
    metaDescription,
    description,
    content,
    authorName,
    authorEmail,
    categoryId,
    featured
  } = req.body;

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');

  const images = req.files ? req.files.map(file => ({
    url: `/uploads/${file.filename}`,
    alt: file.originalname,
    caption: ''
  })) : [];

  const newArticle = {
    _id: (articles.length + 1).toString(),
    title,
    slug,
    metaDescription,
    description,
    content,
    images,
    author: {
      name: authorName,
      email: authorEmail
    },
    category: categoryId,
    publishedAt: new Date(),
    updatedAt: new Date(),
    featured: featured === 'true',
    views: 0
  };

  articles.push(newArticle);
  saveData();
  
  const articleWithCategory = {
    ...newArticle,
    category: findCategoryById(newArticle.category)
  };

  res.status(201).json(articleWithCategory);
});

app.get('/api/search', (req, res) => {
  const { q, limit = 10 } = req.query;
  
  if (!q || q.trim() === '') {
    return res.json([]);
  }

  const searchRegex = new RegExp(q.trim(), 'i');
  
  const searchResults = articles
    .filter(article => 
      searchRegex.test(article.title) ||
      searchRegex.test(article.description) ||
      searchRegex.test(article.content) ||
      searchRegex.test(article.author.name)
    )
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, parseInt(limit))
    .map(article => ({
      ...article,
      category: findCategoryById(article.category)
    }));

  res.json(searchResults);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    database: 'File-based (fallback)',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Using file-based database (fallback)`);
});









