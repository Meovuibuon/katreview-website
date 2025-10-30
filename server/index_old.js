const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const { testConnection, initializeDatabase } = require('./database/config');
const Category = require('./database/models/Category');
const Article = require('./database/models/Article');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));

// Initialize MySQL database
const initializeApp = async () => {
  try {
    // Test database connection
    const connected = await testConnection();
    if (!connected) {
      console.log('❌ Failed to connect to MySQL database');
      console.log('💡 Please make sure MySQL is running and create the database');
      process.exit(1);
    }

    // Initialize database schema
    await initializeDatabase();
    console.log('✅ MySQL database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

// Initialize the app
initializeApp();

// Helper function to format article response
const formatArticleResponse = (article) => {
  return {
    _id: article.id.toString(),
    title: article.title,
    slug: article.slug,
    metaDescription: article.meta_description,
    description: article.description,
    content: article.content,
    author: {
      name: article.author_name,
      email: article.author_email
    },
    category: {
      _id: article.category_id?.toString(),
      name: article.category_name,
      slug: article.category_slug
    },
    publishedAt: article.published_at,
    updatedAt: article.updated_at,
    featured: Boolean(article.featured),
    views: article.views,
    images: [] // Will be populated separately if needed
  };
};

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
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.getAll();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/categories/:slug', async (req, res) => {
  try {
    const category = await Category.getBySlug(req.params.slug);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const { name, description } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim('-');
    
    const newCategory = await Category.create({ name, slug, description });
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Articles API
app.get('/api/articles', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;

    const result = await Article.getAll(page, limit, category);
    const formattedArticles = result.articles.map(formatArticleResponse);

    res.json({
      articles: formattedArticles,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
      total: result.total
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
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
  saveData(); // Save to file
  
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

// Serve static files from React build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Using in-memory database for demo purposes');
});