const { pool } = require('../config');

class Article {
  // Get all articles with pagination
  static async getAll(page = 1, limit = 10, categoryFilter = null) {
    try {
      const offset = (page - 1) * limit;
      const limitInt = parseInt(limit);
      const offsetInt = parseInt(offset);
      
      let query = `
        SELECT a.*, c.name as category_name, c.slug as category_slug 
        FROM articles a 
        LEFT JOIN categories c ON a.category_id = c.id
      `;
      let params = [];

      if (categoryFilter) {
        const isNumeric = /^\d+$/.test(String(categoryFilter));
        if (isNumeric) {
          query += ' WHERE a.category_id = ?';
          params.push(categoryFilter);
        } else {
          query += ' WHERE c.slug = ?';
          params.push(categoryFilter);
        }
      }

      query += ` ORDER BY a.published_at DESC LIMIT ${limitInt} OFFSET ${offsetInt}`;

      const [rows] = await pool.execute(query, params);

      // Get total count
      let countQuery = `
        SELECT COUNT(*) as total 
        FROM articles a 
        LEFT JOIN categories c ON a.category_id = c.id
      `;
      let countParams = [];
      if (categoryFilter) {
        const isNumeric = /^\d+$/.test(String(categoryFilter));
        if (isNumeric) {
          countQuery += ' WHERE a.category_id = ?';
          countParams.push(categoryFilter);
        } else {
          countQuery += ' WHERE c.slug = ?';
          countParams.push(categoryFilter);
        }
      }

      const [countResult] = await pool.execute(countQuery, countParams);
      const total = countResult[0].total;

      return {
        articles: rows,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      };
    } catch (error) {
      console.error('Error fetching articles:', error);
      throw error;
    }
  }

  // Get latest articles
  static async getLatest(limit = 5) {
    try {
      const limitInt = parseInt(limit);
      console.log('Fetching latest articles with limit:', limitInt);
      const [rows] = await pool.execute(`
        SELECT a.*, c.name as category_name, c.slug as category_slug 
        FROM articles a 
        LEFT JOIN categories c ON a.category_id = c.id
        ORDER BY a.published_at DESC 
        LIMIT ${limitInt}
      `);
      console.log('Latest articles result:', rows.length, 'articles found');
      return rows;
    } catch (error) {
      console.error('Error fetching latest articles:', error);
      throw error;
    }
  }

  // Get articles by category
  static async getByCategory(categorySlug, limit = 6) {
    try {
      const limitInt = parseInt(limit);
      const [rows] = await pool.execute(`
        SELECT a.*, c.name as category_name, c.slug as category_slug 
        FROM articles a 
        LEFT JOIN categories c ON a.category_id = c.id
        WHERE c.slug = ?
        ORDER BY a.published_at DESC 
        LIMIT ${limitInt}
      `, [categorySlug]);
      return rows;
    } catch (error) {
      console.error('Error fetching articles by category:', error);
      throw error;
    }
  }

  // Get article by slug
  static async getBySlug(slug) {
    try {
      const [rows] = await pool.execute(`
        SELECT a.*, c.name as category_name, c.slug as category_slug 
        FROM articles a 
        LEFT JOIN categories c ON a.category_id = c.id
        WHERE a.slug = ?
      `, [slug]);
      return rows[0] || null;
    } catch (error) {
      console.error('Error fetching article by slug:', error);
      throw error;
    }
  }

  // Get related articles
  static async getRelated(articleId, categoryId, limit = 4) {
    try {
      const limitInt = parseInt(limit);
      const [rows] = await pool.execute(`
        SELECT a.*, c.name as category_name, c.slug as category_slug 
        FROM articles a 
        LEFT JOIN categories c ON a.category_id = c.id
        WHERE a.category_id = ? AND a.id != ?
        ORDER BY a.published_at DESC 
        LIMIT ${limitInt}
      `, [categoryId, articleId]);
      return rows;
    } catch (error) {
      console.error('Error fetching related articles:', error);
      throw error;
    }
  }

  // Create new article
  static async create(articleData) {
    try {
      const {
        title, slug, metaDescription, description, content,
        authorName, authorEmail, categoryId, featured
      } = articleData;

      const [result] = await pool.execute(`
        INSERT INTO articles (title, slug, meta_description, description, content, 
                            author_name, author_email, category_id, featured)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [title, slug, metaDescription, description, content, 
          authorName, authorEmail, categoryId, featured]);

      return { id: result.insertId, ...articleData };
    } catch (error) {
      console.error('Error creating article:', error);
      throw error;
    }
  }

  // Update article
  static async update(id, articleData) {
    try {
      const {
        title, slug, metaDescription, description, content,
        authorName, authorEmail, categoryId, featured
      } = articleData;

      await pool.execute(`
        UPDATE articles SET 
          title = ?, slug = ?, meta_description = ?, description = ?, 
          content = ?, author_name = ?, author_email = ?, 
          category_id = ?, featured = ?
        WHERE id = ?
      `, [title, slug, metaDescription, description, content, 
          authorName, authorEmail, categoryId, featured, id]);

      return { id, ...articleData };
    } catch (error) {
      console.error('Error updating article:', error);
      throw error;
    }
  }

  // Delete article
  static async delete(id) {
    try {
      await pool.execute('DELETE FROM articles WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('Error deleting article:', error);
      throw error;
    }
  }

  // Increment view count
  static async incrementViews(id) {
    try {
      await pool.execute('UPDATE articles SET views = views + 1 WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('Error incrementing views:', error);
      throw error;
    }
  }

  // Search articles
  static async search(query, limit = 10) {
    try {
      const limitInt = parseInt(limit);
      const searchTerm = `%${query}%`;
      const [rows] = await pool.execute(`
        SELECT a.*, c.name as category_name, c.slug as category_slug 
        FROM articles a 
        LEFT JOIN categories c ON a.category_id = c.id
        WHERE a.title LIKE ? OR a.description LIKE ? OR a.content LIKE ?
        ORDER BY a.published_at DESC 
        LIMIT ${limitInt}
      `, [searchTerm, searchTerm, searchTerm]);
      return rows;
    } catch (error) {
      console.error('Error searching articles:', error);
      throw error;
    }
  }
}

module.exports = Article;









