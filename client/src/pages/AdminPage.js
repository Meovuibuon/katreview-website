import React, { useState, useEffect, useMemo } from 'react';
import { articlesAPI, categoriesAPI } from '../services/api';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

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
    images: [],
    coverIndex: 0,
    imageOrder: []
  });

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: ''
  });

  // Editing states
  const [editingArticle, setEditingArticle] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [hasModifiedImages, setHasModifiedImages] = useState(false);
  const [keptImageUrls, setKeptImageUrls] = useState([]);

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
        await articlesAPI.update(editingArticle._id, {
          ...articleForm,
          replaceImages: hasModifiedImages,
          keptImageUrls: keptImageUrls
        });
      } else {
        await articlesAPI.create(articleForm);
      }

      // Reset form and previews
      setArticleForm({
        title: '',
        metaDescription: '',
        description: '',
        content: '',
        authorName: '',
        authorEmail: '',
        categoryId: '',
        featured: false,
        images: [],
        coverIndex: 0,
        imageOrder: []
      });
      setImagePreviews([]);
      setHasModifiedImages(false);
      setKeptImageUrls([]);
      setEditingArticle(null);
      fetchArticles();
      alert('Bài viết đã được lưu thành công!');
    } catch (error) {
      console.error('Error saving article:', error);
      alert('Có lỗi xảy ra khi lưu bài viết: ' + (error.response?.data?.message || error.message));
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

  const [imagePreviews, setImagePreviews] = useState([]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map((file) => ({ 
      file, 
      url: URL.createObjectURL(file), 
      name: file.name,
      existing: false 
    }));
    setImagePreviews(prev => [...prev, ...newPreviews]);
    setArticleForm(prev => ({
      ...prev,
      images: [...prev.images, ...files],
      imageOrder: [...Array(prev.images.length + files.length).keys()],
      coverIndex: prev.coverIndex ?? 0
    }));
    
    // Mark that images have been modified when editing
    if (editingArticle) {
      setHasModifiedImages(true);
    }
  };

  const moveImage = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= imagePreviews.length) return;
    const newPreviews = [...imagePreviews];
    [newPreviews[index], newPreviews[target]] = [newPreviews[target], newPreviews[index]];
    setImagePreviews(newPreviews);

    const newOrder = [...articleForm.imageOrder];
    [newOrder[index], newOrder[target]] = [newOrder[target], newOrder[index]];
    setArticleForm(prev => ({ ...prev, imageOrder: newOrder, coverIndex: prev.coverIndex === index ? target : (prev.coverIndex === target ? index : prev.coverIndex) }));
  };

  const removeImage = (index) => {
    const removedImg = imagePreviews[index];
    
    // Remove from previews
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(newPreviews);
    
    // If it's an existing image, remove from kept list
    if (editingArticle && removedImg.existing && removedImg.originalUrl) {
      setKeptImageUrls(prev => prev.filter(url => url !== removedImg.originalUrl));
      setHasModifiedImages(true);
    }
    
    // Only remove from images array if it's a new image (not existing)
    if (!removedImg.existing) {
      const newImages = articleForm.images.filter((_, i) => i !== index);
      setArticleForm(prev => ({
        ...prev,
        images: newImages,
        imageOrder: [...Array(newImages.length).keys()],
        coverIndex: Math.max(0, Math.min(prev.coverIndex, newImages.length - 1))
      }));
    }
  };

  const quillModules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ align: [] }],
      ['link', 'blockquote', 'code-block'],
      ['clean']
    ]
  }), []);

  const quillFormats = useMemo(() => (
    [
      'header',
      'bold', 'italic', 'underline', 'strike',
      'list', 'bullet', 'indent', 'align',
      'link', 'blockquote', 'code-block'
    ]
  ), []);

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
      images: [],
      coverIndex: 0,
      imageOrder: []
    });
    
    // Load existing images for preview
    if (article.images && article.images.length > 0) {
      const existingPreviews = article.images.map((img, idx) => ({
        url: `http://localhost:5000${img.url}`,
        name: img.alt || `Image ${idx + 1}`,
        existing: true,
        originalUrl: img.url // Store original URL (without localhost prefix)
      }));
      setImagePreviews(existingPreviews);
      
      // Initially, all existing images are kept
      setKeptImageUrls(article.images.map(img => img.url));
    } else {
      setImagePreviews([]);
      setKeptImageUrls([]);
    }
    
    setHasModifiedImages(false);
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
                <div className="form-textarea" style={{ padding: 0, border: 'none' }}>
                  <ReactQuill
                    theme="snow"
                    value={articleForm.content}
                    onChange={(value) => setArticleForm(prev => ({ ...prev, content: value }))}
                    modules={quillModules}
                    formats={quillFormats}
                  />
                </div>
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
                {imagePreviews.length > 0 && (
                  <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
                    {imagePreviews.map((img, idx) => (
                      <div key={idx} style={{ 
                        border: img.existing ? '2px solid #17a2b8' : '1px solid #e9ecef', 
                        borderRadius: 6, 
                        padding: 8,
                        position: 'relative'
                      }}>
                        {img.existing && (
                          <span style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            background: '#17a2b8',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: 3,
                            fontSize: '0.75rem',
                            fontWeight: 'bold'
                          }}>
                            Đã có
                          </span>
                        )}
                        <img src={img.url} alt={img.name} style={{ width: '100%', height: 90, objectFit: 'cover', borderRadius: 4 }} />
                        <div style={{ fontSize: '0.8rem', marginTop: 4, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {img.name}
                        </div>
                        {!img.existing && (
                          <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                              <button type="button" onClick={() => moveImage(idx, -1)} disabled={idx === 0} style={{ fontSize: '0.8rem', padding: '4px 8px' }}>↑</button>
                              <button type="button" onClick={() => moveImage(idx, 1)} disabled={idx === imagePreviews.length - 1} style={{ fontSize: '0.8rem', padding: '4px 8px' }}>↓</button>
                            </div>
                            <div style={{ marginTop: 6 }}>
                              <label style={{ fontSize: '0.85rem' }}>
                                <input
                                  type="radio"
                                  name="coverImage"
                                  checked={articleForm.coverIndex === idx}
                                  onChange={() => setArticleForm(prev => ({ ...prev, coverIndex: idx }))}
                                /> Ảnh đại diện
                              </label>
                            </div>
                          </>
                        )}
                        <div style={{ marginTop: 6 }}>
                          <button 
                            type="button" 
                            onClick={() => removeImage(idx)} 
                            style={{ 
                              color: 'white', 
                              background: '#dc3545',
                              border: 'none',
                              padding: '4px 8px',
                              borderRadius: 3,
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              width: '100%'
                            }}
                          >
                            {img.existing ? 'Bỏ chọn' : 'Xoá'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Đang lưu...' : (editingArticle ? 'Cập nhật' : 'Tạo bài viết')}
                </button>
                {editingArticle && (
                  <button 
                    type="button" 
                    className="cancel-btn" 
                    onClick={() => {
                      setEditingArticle(null);
                      setImagePreviews([]);
                      setHasModifiedImages(false);
                      setKeptImageUrls([]);
                      setArticleForm({
                        title: '',
                        metaDescription: '',
                        description: '',
                        content: '',
                        authorName: '',
                        authorEmail: '',
                        categoryId: '',
                        featured: false,
                        images: [],
                        coverIndex: 0,
                        imageOrder: []
                      });
                    }}
                  >
                    Hủy
                  </button>
                )}
              </div>
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
