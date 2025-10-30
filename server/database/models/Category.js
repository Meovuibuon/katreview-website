const { pool } = require('../config');

class Category {
  // Get all categories
  static async getAll() {
    try {
      const [rows] = await pool.execute('SELECT * FROM categories ORDER BY created_at ASC');
      return rows;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  // Get category by ID
  static async getById(id) {
    try {
      const [rows] = await pool.execute('SELECT * FROM categories WHERE id = ?', [id]);
      return rows[0] || null;
    } catch (error) {
      console.error('Error fetching category by ID:', error);
      throw error;
    }
  }

  // Get category by slug
  static async getBySlug(slug) {
    try {
      const [rows] = await pool.execute('SELECT * FROM categories WHERE slug = ?', [slug]);
      return rows[0] || null;
    } catch (error) {
      console.error('Error fetching category by slug:', error);
      throw error;
    }
  }

  // Create new category
  static async create(categoryData) {
    try {
      const { name, slug, description } = categoryData;
      const [result] = await pool.execute(
        'INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)',
        [name, slug, description]
      );
      return { id: result.insertId, ...categoryData };
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  // Update category
  static async update(id, categoryData) {
    try {
      const { name, slug, description } = categoryData;
      await pool.execute(
        'UPDATE categories SET name = ?, slug = ?, description = ? WHERE id = ?',
        [name, slug, description, id]
      );
      return { id, ...categoryData };
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  // Delete category
  static async delete(id) {
    try {
      await pool.execute('DELETE FROM categories WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
}

module.exports = Category;











