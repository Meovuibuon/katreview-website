const express = require('express');
const router = express.Router();
const Article = require('../models/Article');

// Search articles
router.get('/', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.trim() === '') {
      return res.json([]);
    }

    const searchRegex = new RegExp(q.trim(), 'i');
    
    const articles = await Article.find({
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { content: searchRegex },
        { 'author.name': searchRegex }
      ]
    })
      .populate('category', 'name slug')
      .select('title slug description author category publishedAt')
      .sort({ publishedAt: -1 })
      .limit(parseInt(limit));

    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
