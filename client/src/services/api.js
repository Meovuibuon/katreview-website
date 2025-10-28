import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Articles API
export const articlesAPI = {
  // Get all articles with pagination
  getAll: (page = 1, limit = 10, category = null) => {
    const params = { page, limit };
    if (category) params.category = category;
    return api.get('/articles', { params });
  },

  // Get latest articles for carousel
  getLatest: (limit = 5) => {
    return api.get('/articles/latest', { params: { limit } });
  },

  // Get articles by category
  getByCategory: (categorySlug, limit = 6) => {
    return api.get(`/articles/category/${categorySlug}`, { params: { limit } });
  },

  // Get single article by slug
  getBySlug: (slug) => {
    return api.get(`/articles/${slug}`);
  },

  // Get related articles
  getRelated: (slug) => {
    return api.get(`/articles/${slug}/related`);
  },

  // Create new article (Admin)
  create: (articleData) => {
    const formData = new FormData();
    
    // Append text fields
    Object.keys(articleData).forEach(key => {
      if (key !== 'images' && articleData[key] !== null && articleData[key] !== undefined) {
        formData.append(key, articleData[key]);
      }
    });

    // Append images
    if (articleData.images && articleData.images.length > 0) {
      articleData.images.forEach(image => {
        if (image instanceof File) {
          formData.append('images', image);
        }
      });
    }

    return api.post('/articles', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Update article (Admin)
  update: (id, articleData) => {
    const formData = new FormData();
    
    // Append text fields
    Object.keys(articleData).forEach(key => {
      if (key !== 'images' && articleData[key] !== null && articleData[key] !== undefined) {
        formData.append(key, articleData[key]);
      }
    });

    // Append new images
    if (articleData.newImages && articleData.newImages.length > 0) {
      articleData.newImages.forEach(image => {
        if (image instanceof File) {
          formData.append('images', image);
        }
      });
    }

    return api.put(`/articles/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Delete article (Admin)
  delete: (id) => {
    return api.delete(`/articles/${id}`);
  },
};

// Categories API
export const categoriesAPI = {
  // Get all categories
  getAll: () => {
    return api.get('/categories');
  },

  // Get single category by slug
  getBySlug: (slug) => {
    return api.get(`/categories/${slug}`);
  },

  // Create new category (Admin)
  create: (categoryData) => {
    return api.post('/categories', categoryData);
  },

  // Update category (Admin)
  update: (id, categoryData) => {
    return api.put(`/categories/${id}`, categoryData);
  },

  // Delete category (Admin)
  delete: (id) => {
    return api.delete(`/categories/${id}`);
  },
};

// Search API
export const searchAPI = {
  // Search articles
  search: (query, limit = 10) => {
    return api.get('/search', { params: { q: query, limit } });
  },
};

export default api;
