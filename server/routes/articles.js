const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const Category = require('../models/Category');
const multer = require('multer');
const path = require('path');

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

// Get all articles with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const skip = (page - 1) * limit;

    let query = {};
    if (category) {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      }
    }

    const articles = await Article.find(query)
      .populate('category', 'name slug')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Article.countDocuments(query);

    res.json({
      articles,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get latest articles for carousel
router.get('/latest', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const articles = await Article.find()
      .populate('category', 'name slug')
      .sort({ publishedAt: -1 })
      .limit(limit);

    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get articles by category
router.get('/category/:categorySlug', async (req, res) => {
  try {
    const { categorySlug } = req.params;
    const limit = parseInt(req.query.limit) || 6;

    const category = await Category.findOne({ slug: categorySlug });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const articles = await Article.find({ category: category._id })
      .populate('category', 'name slug')
      .sort({ publishedAt: -1 })
      .limit(limit);

    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single article by slug
router.get('/:slug', async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug })
      .populate('category', 'name slug');

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Increment view count
    article.views += 1;
    await article.save();

    res.json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get related articles
router.get('/:slug/related', async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug });
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const relatedArticles = await Article.find({
      category: article.category,
      _id: { $ne: article._id }
    })
      .populate('category', 'name slug')
      .sort({ publishedAt: -1 })
      .limit(4);

    res.json(relatedArticles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new article (Admin only)
router.post('/', upload.array('images', 10), async (req, res) => {
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

    // Create slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    // Handle uploaded images
    const images = req.files ? req.files.map(file => ({
      url: `/uploads/${file.filename}`,
      alt: file.originalname,
      caption: ''
    })) : [];

    const article = new Article({
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
      featured: featured === 'true'
    });

    await article.save();
    await article.populate('category', 'name slug');

    res.status(201).json(article);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update article (Admin only)
router.put('/:id', upload.array('images', 10), async (req, res) => {
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

    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Update fields
    article.title = title;
    article.metaDescription = metaDescription;
    article.description = description;
    article.content = content;
    article.author.name = authorName;
    article.author.email = authorEmail;
    article.category = categoryId;
    article.featured = featured === 'true';

    // Handle new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        url: `/uploads/${file.filename}`,
        alt: file.originalname,
        caption: ''
      }));
      article.images = [...article.images, ...newImages];
    }

    await article.save();
    await article.populate('category', 'name slug');

    res.json(article);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete article (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
