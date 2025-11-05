const { pool } = require('../config');

const User = {
  // Create users table
  async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'editor') DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL,
        INDEX idx_username (username),
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    try {
      const connection = await pool.getConnection();
      await connection.query(query);
      connection.release();
      console.log('✅ Users table created/verified');
    } catch (error) {
      console.error('❌ Error creating users table:', error);
      throw error;
    }
  },

  // Create a new user
  async create({ username, email, password, role = 'admin' }) {
    const query = `
      INSERT INTO users (username, email, password, role)
      VALUES (?, ?, ?, ?)
    `;
    
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.query(query, [username, email, password, role]);
      connection.release();
      
      return {
        id: result.insertId,
        username,
        email,
        role
      };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Username or email already exists');
      }
      throw error;
    }
  },

  // Find user by username
  async findByUsername(username) {
    const query = `
      SELECT id, username, email, password, role, created_at, last_login
      FROM users
      WHERE username = ?
    `;
    
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.query(query, [username]);
      connection.release();
      
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  },

  // Find user by email
  async findByEmail(email) {
    const query = `
      SELECT id, username, email, password, role, created_at, last_login
      FROM users
      WHERE email = ?
    `;
    
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.query(query, [email]);
      connection.release();
      
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  },

  // Find user by ID
  async findById(id) {
    const query = `
      SELECT id, username, email, role, created_at, last_login
      FROM users
      WHERE id = ?
    `;
    
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.query(query, [id]);
      connection.release();
      
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  },

  // Update last login
  async updateLastLogin(id) {
    const query = `
      UPDATE users
      SET last_login = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    try {
      const connection = await pool.getConnection();
      await connection.query(query, [id]);
      connection.release();
    } catch (error) {
      throw error;
    }
  },

  // Get all users (for admin management)
  async getAll() {
    const query = `
      SELECT id, username, email, role, created_at, last_login
      FROM users
      ORDER BY created_at DESC
    `;
    
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.query(query);
      connection.release();
      
      return rows;
    } catch (error) {
      throw error;
    }
  },

  // Update user
  async update(id, updates) {
    const allowedFields = ['email', 'role'];
    const fields = [];
    const values = [];
    
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });
    
    if (fields.length === 0) {
      return;
    }
    
    values.push(id);
    
    const query = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = ?
    `;
    
    try {
      const connection = await pool.getConnection();
      await connection.query(query, values);
      connection.release();
    } catch (error) {
      throw error;
    }
  },

  // Delete user
  async delete(id) {
    const query = 'DELETE FROM users WHERE id = ?';
    
    try {
      const connection = await pool.getConnection();
      await connection.query(query, [id]);
      connection.release();
    } catch (error) {
      throw error;
    }
  }
};

module.exports = User;

