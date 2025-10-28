const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  metaDescription: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  images: [{
    url: String,
    alt: String,
    caption: String
  }],
  author: {
    name: {
      type: String,
      required: true
    },
    email: String
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  publishedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  featured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  }
});

// Update the updatedAt field before saving
articleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
