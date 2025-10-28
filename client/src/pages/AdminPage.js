import React, { useState, useEffect } from 'react';
import { articlesAPI, categoriesAPI } from '../services/api';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('articles');
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Article form state
  const [articleForm, setArticleForm] = useState({
    title: '',
    metaDescription: '',
    description: '',
    content: '',
    authorName: '',
    authorEmail: '',
    categoryId: '',
    featured: false,
    images: []
  });

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: ''
  });

  // Editing states
  const [editingArticle, setEditingArticle] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchArticles();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchArticles = async () => {
    try {
      const response = await articlesAPI.getAll(1, 50);
      setArticles(response.data.articles);
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  const handleArticleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingArticle) {
        await articlesAPI.update(editingArticle._id, articleForm);
      } else {
        await articlesAPI.create(articleForm);
      }

      setArticleForm({
        title: '',
        metaDescription: '',
        description: '',
        content: '',
        authorName: '',
        authorEmail: '',
        categoryId: '',
        featured: false,
        images: []
      });
      setEditingArticle(null);
      fetchArticles();
    } catch (error) {
      console.error('Error saving article:', error);
      alert('Có lỗi xảy ra khi lưu bài viết');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingCategory) {
        await categoriesAPI.update(editingCategory._id, categoryForm);
      } else {
        await categoriesAPI.create(categoryForm);
      }

      setCategoryForm({ name: '', description: '' });
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Có lỗi xảy ra khi lưu danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setArticleForm(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const editArticle = (article) => {
    setArticleForm({
      title: article.title,
      metaDescription: article.metaDescription,
      description: article.description,
      content: article.content,
      authorName: article.author.name,
      authorEmail: article.author.email,
      categoryId: article.category._id,
      featured: article.featured,
      images: []
    });
    setEditingArticle(article);
  };

  const editCategory = (category) => {
    setCategoryForm({
      name: category.name,
      description: category.description
    });
    setEditingCategory(category);
  };

  const deleteArticle = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      try {
        await articlesAPI.delete(id);
        fetchArticles();
      } catch (error) {
        console.error('Error deleting article:', error);
        alert('Có lỗi xảy ra khi xóa bài viết');
      }
    }
  };

  const deleteCategory = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      try {
        await categoriesAPI.delete(id);
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Có lỗi xảy ra khi xóa danh mục');
      }
    }
  };

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
        <h1 className="admin-title">Quản trị viên</h1>
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'articles' ? 'active' : ''}`}
            onClick={() => setActiveTab('articles')}
          >
            Quản lý bài viết
          </button>
          <button
            className={`admin-tab ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            Quản lý danh mục
          </button>
        </div>
      </div>

      {activeTab === 'articles' && (
        <div>
          <div className="admin-form">
            <h2>{editingArticle ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}</h2>
            <form onSubmit={handleArticleSubmit}>
              <div className="form-group">
                <label className="form-label">Tiêu đề</label>
                <input
                  type="text"
                  className="form-input"
                  value={articleForm.title}
                  onChange={(e) => setArticleForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mô tả meta</label>
                <input
                  type="text"
                  className="form-input"
                  value={articleForm.metaDescription}
                  onChange={(e) => setArticleForm(prev => ({ ...prev, metaDescription: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mô tả ngắn</label>
                <textarea
                  className="form-textarea"
                  value={articleForm.description}
                  onChange={(e) => setArticleForm(prev => ({ ...prev, description: e.target.value }))}
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nội dung</label>
                <textarea
                  className="form-textarea"
                  value={articleForm.content}
                  onChange={(e) => setArticleForm(prev => ({ ...prev, content: e.target.value }))}
                  rows="10"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tên tác giả</label>
                <input
                  type="text"
                  className="form-input"
                  value={articleForm.authorName}
                  onChange={(e) => setArticleForm(prev => ({ ...prev, authorName: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email tác giả</label>
                <input
                  type="email"
                  className="form-input"
                  value={articleForm.authorEmail}
                  onChange={(e) => setArticleForm(prev => ({ ...prev, authorEmail: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Danh mục</label>
                <select
                  className="form-select"
                  value={articleForm.categoryId}
                  onChange={(e) => setArticleForm(prev => ({ ...prev, categoryId: e.target.value }))}
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Hình ảnh</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={articleForm.featured}
                    onChange={(e) => setArticleForm(prev => ({ ...prev, featured: e.target.checked }))}
                  />
                  Bài viết nổi bật
                </label>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Đang lưu...' : (editingArticle ? 'Cập nhật' : 'Tạo bài viết')}
              </button>
            </form>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <h3>Danh sách bài viết</h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {articles.map(article => (
                <div key={article._id} style={{ 
                  padding: '1rem', 
                  border: '1px solid #e9ecef', 
                  marginBottom: '0.5rem',
                  borderRadius: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h4>{article.title}</h4>
                    <p style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                      {article.category.name} • {new Date(article.publishedAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div>
                    <button onClick={() => editArticle(article)} style={{ marginRight: '0.5rem' }}>
                      Sửa
                    </button>
                    <button onClick={() => deleteArticle(article._id)} style={{ color: 'red' }}>
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div>
          <div className="admin-form">
            <h2>{editingCategory ? 'Chỉnh sửa danh mục' : 'Tạo danh mục mới'}</h2>
            <form onSubmit={handleCategorySubmit}>
              <div className="form-group">
                <label className="form-label">Tên danh mục</label>
                <input
                  type="text"
                  className="form-input"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mô tả</label>
                <textarea
                  className="form-textarea"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                  rows="3"
                />
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Đang lưu...' : (editingCategory ? 'Cập nhật' : 'Tạo danh mục')}
              </button>
            </form>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <h3>Danh sách danh mục</h3>
            <div>
              {categories.map(category => (
                <div key={category._id} style={{ 
                  padding: '1rem', 
                  border: '1px solid #e9ecef', 
                  marginBottom: '0.5rem',
                  borderRadius: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h4>{category.name}</h4>
                    <p style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                      {category.description}
                    </p>
                  </div>
                  <div>
                    <button onClick={() => editCategory(category)} style={{ marginRight: '0.5rem' }}>
                      Sửa
                    </button>
                    <button onClick={() => deleteCategory(category._id)} style={{ color: 'red' }}>
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AdminPage;
