const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const { testConnection, initializeDatabase } = require('./database/config');
const Category = require('./database/models/Category');
const Article = require('./database/models/Article');
const { processMultipleImages } = require('./utils/imageProcessor');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});
app.use('/uploads', express.static('uploads'));

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
const formatArticleResponse = (article, images = []) => {
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
    images
  };
};

const formatCategoryResponse = (category) => {
  return {
    _id: category.id?.toString(),
    name: category.name,
    slug: category.slug,
    description: category.description,
    createdAt: category.created_at,
    updatedAt: category.updated_at
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

const safeParseJSON = (value, fallback) => {
  try {
    if (typeof value !== 'string') return fallback;
    return JSON.parse(value);
  } catch (_) {
    return fallback;
  }
};

// Routes
// Categories API
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.getAll();
    const formatted = categories.map(formatCategoryResponse);
    res.json(formatted);
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
    res.json(formatCategoryResponse(category));
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
    const formattedArticles = await Promise.all(
      result.articles.map(async (a) => {
        let images = [];
        try {
          images = await Article.getImages(a.id);
        } catch (_) {
          images = [];
        }
        return formatArticleResponse(a, images);
      })
    );

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

app.get('/api/articles/latest', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const latestArticles = await Article.getLatest(limit);
    const formattedArticles = await Promise.all(
      latestArticles.map(async (a) => {
        let images = [];
        try {
          images = await Article.getImages(a.id);
        } catch (_) {
          images = [];
        }
        return formatArticleResponse(a, images);
      })
    );
    res.json(formattedArticles);
  } catch (error) {
    console.error('Error fetching latest articles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/articles/category/:categorySlug', async (req, res) => {
  try {
    const { categorySlug } = req.params;
    const limit = parseInt(req.query.limit) || 6;

    const categoryArticles = await Article.getByCategory(categorySlug, limit);
    const formattedArticles = await Promise.all(
      categoryArticles.map(async (a) => {
        let images = [];
        try {
          images = await Article.getImages(a.id);
        } catch (_) {
          images = [];
        }
        return formatArticleResponse(a, images);
      })
    );

    res.json(formattedArticles);
  } catch (error) {
    console.error('Error fetching category articles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/articles/:slug', async (req, res) => {
  try {
    const article = await Article.getBySlug(req.params.slug);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Increment view count
    await Article.incrementViews(article.id);

    let images = [];
    try { images = await Article.getImages(article.id); } catch (_) { images = []; }
    const formattedArticle = formatArticleResponse(article, images);
    res.json(formattedArticle);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/articles/:slug/related', async (req, res) => {
  try {
    const article = await Article.getBySlug(req.params.slug);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const relatedArticles = await Article.getRelated(article.id, article.category_id, 4);
    const formattedArticles = relatedArticles.map(formatArticleResponse);

    res.json(formattedArticles);
  } catch (error) {
    console.error('Error fetching related articles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/articles', upload.array('images', 10), async (req, res) => {
  try {
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

    const newArticle = await Article.create({
      title,
      slug,
      metaDescription,
      description,
      content,
      authorName,
      authorEmail,
      categoryId,
      featured: featured === 'true'
    });

    if (req.files && req.files.length > 0) {
      // Process images to 3:2 ratio
      console.log('Processing uploaded images...');
      const processedImages = await processMultipleImages(req.files);
      
      const coverIndex = req.body.coverIndex !== undefined ? parseInt(req.body.coverIndex) : null;
      const order = safeParseJSON(req.body.imageOrder, []);
      const images = processedImages.map((file, idx) => {
        let sort = idx;
        if (Array.isArray(order) && order.length > 0) {
          const pos = order.indexOf(idx);
          sort = pos !== -1 ? pos : (order.length + idx);
        }
        if (!Number.isNaN(coverIndex) && coverIndex === idx) sort = -1;
        return {
          url: `/uploads/${file.filename}`,
          alt: req.files[idx].originalname,
          caption: '',
          sort_order: sort
        };
      });
      await Article.addImages(newArticle.id, images);
    }

    const images = await Article.getImages(newArticle.id);
    const formattedArticle = formatArticleResponse({ ...newArticle, id: newArticle.id }, images);
    res.status(201).json(formattedArticle);
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ message: error.message || 'Internal server error', detail: String(error.stack || error) });
  }
});

// Update article (Admin)
app.put('/api/articles/:id', upload.array('images', 10), async (req, res) => {
  try {
    const { id } = req.params;
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

    const slug = String(title || '')
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    const updatedArticle = await Article.update(id, {
      title,
      slug,
      metaDescription,
      description,
      content,
      authorName,
      authorEmail,
      categoryId,
      featured: featured === 'true'
    });

    if (!updatedArticle) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Handle image updates
    const replaceImages = req.body.replaceImages === 'true';
    const keptImageUrls = safeParseJSON(req.body.keptImageUrls, []);
    
    console.log('=== DEBUG: Backend update images ===');
    console.log('replaceImages:', replaceImages);
    console.log('keptImageUrls:', keptImageUrls);
    
    if (replaceImages) {
      // Get current images
      const currentImages = await Article.getImages(id);
      console.log('Current images in DB:', currentImages.map(i => i.url));
      
      // Delete images that are not in the kept list
      for (const img of currentImages) {
        if (!keptImageUrls.includes(img.url)) {
          console.log('Deleting image:', img.url);
          await Article.deleteImageByUrl(id, img.url);
        } else {
          console.log('Keeping image:', img.url);
        }
      }
    }
    
    // Add new images if any
    if (req.files && req.files.length > 0) {
      // Process images to 3:2 ratio
      console.log('Processing uploaded images for update...');
      const processedImages = await processMultipleImages(req.files);
      
      const coverIndex = req.body.coverIndex !== undefined ? parseInt(req.body.coverIndex) : null;
      const order = safeParseJSON(req.body.imageOrder, []);
      const images = processedImages.map((file, idx) => {
        let sort = idx;
        if (Array.isArray(order) && order.length > 0) {
          const pos = order.indexOf(idx);
          sort = pos !== -1 ? pos : (order.length + idx);
        }
        if (!Number.isNaN(coverIndex) && coverIndex === idx) sort = -1;
        return {
          url: `/uploads/${file.filename}`,
          alt: req.files[idx].originalname,
          caption: '',
          sort_order: sort
        };
      });
      await Article.addImages(id, images);
      console.log('New images added:', images.map(i => i.url));
    }

    const images = await Article.getImages(id);
    console.log('Final images after update:', images.map(i => i.url));
    const formattedArticle = formatArticleResponse({ ...updatedArticle, id }, images);
    res.json(formattedArticle);
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ message: error.message || 'Internal server error', detail: String(error.stack || error) });
  }
});

// Delete article (Admin)
app.delete('/api/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Article.delete(id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update category (Admin)
app.put('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim('-');
    
    const updatedCategory = await Category.update(id, { name, slug, description });
    
    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete category (Admin)
app.delete('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Category.delete(id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Search API
app.get('/api/search', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    if (!q) {
      return res.json([]);
    }

    const searchResults = await Article.search(q, limit);
    const formattedResults = await Promise.all(
      searchResults.map(async (a) => {
        let images = [];
        try {
          images = await Article.getImages(a.id);
        } catch (_) {
          images = [];
        }
        return formatArticleResponse(a, images);
      })
    );

    res.json(formattedResults);
  } catch (error) {
    console.error('Error searching articles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    database: 'MySQL',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Using MySQL database`);
});