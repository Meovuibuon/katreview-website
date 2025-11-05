import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { articlesAPI, categoriesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState('articles');
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Article form state with SEO-friendly structure
  const [articleForm, setArticleForm] = useState({
    title: '', // H1 - Main title
    slug: '', // URL slug
    metaDescription: '', // Meta description for SEO
    description: '', // Short description/excerpt
    contentSections: [], // Array of content sections
    authorName: '',
    authorEmail: '',
    categoryId: '',
    featured: false,
    coverImage: null, // Main cover image
    coverImagePreview: null
  });

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: ''
  });

  // Editing states
  const [editingArticle, setEditingArticle] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  // Generate slug from title
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

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

  // Convert structured content to HTML for backend
  const convertToHTML = () => {
    let html = '';
    articleForm.contentSections.forEach(section => {
      if (section.type === 'heading') {
        html += `<h2>${section.content}</h2>`;
      } else if (section.type === 'paragraph') {
        html += `<p>${section.content}</p>`;
      } else if (section.type === 'image' && section.imagePreview) {
        html += `<figure style="margin: 2rem 0;">
          <img src="${section.imagePreview}" alt="${section.alt || ''}" style="width: 100%; height: auto; border-radius: 8px;" />
          ${section.caption ? `<figcaption style="text-align: center; font-style: italic; margin-top: 0.5rem; color: #6c757d;">${section.caption}</figcaption>` : ''}
        </figure>`;
      }
    });
    return html;
  };

  const handleArticleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', articleForm.title);
      formData.append('slug', articleForm.slug);
      formData.append('metaDescription', articleForm.metaDescription);
      formData.append('description', articleForm.description);
      formData.append('content', convertToHTML());
      formData.append('authorName', articleForm.authorName);
      formData.append('authorEmail', articleForm.authorEmail);
      formData.append('categoryId', articleForm.categoryId);
      formData.append('featured', articleForm.featured);

      // Add cover image
      if (articleForm.coverImage) {
        formData.append('images', articleForm.coverImage);
      }

      // Add section images
      articleForm.contentSections.forEach((section, index) => {
        if (section.type === 'image' && section.imageFile) {
          formData.append('images', section.imageFile);
          formData.append(`imageMetadata[${index}]`, JSON.stringify({
            alt: section.alt,
            caption: section.caption
          }));
        }
      });

      if (editingArticle) {
        await articlesAPI.update(editingArticle._id, formData);
      } else {
        await articlesAPI.create(formData);
      }

      // Reset form
      resetArticleForm();
      fetchArticles();
      alert('Bài viết đã được lưu thành công!');
    } catch (error) {
      console.error('Error saving article:', error);
      alert('Có lỗi xảy ra khi lưu bài viết: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const resetArticleForm = () => {
    setArticleForm({
      title: '',
      slug: '',
      metaDescription: '',
      description: '',
      contentSections: [],
      authorName: '',
      authorEmail: '',
      categoryId: '',
      featured: false,
      coverImage: null,
      coverImagePreview: null
    });
    setEditingArticle(null);
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

  // Content section management
  const addSection = (type) => {
    const newSection = {
      id: Date.now(),
      type,
      content: type === 'paragraph' ? '' : type === 'heading' ? '' : '',
      ...(type === 'image' && {
        imageFile: null,
        imagePreview: null,
        alt: '',
        caption: ''
      })
    };
    setArticleForm(prev => ({
      ...prev,
      contentSections: [...prev.contentSections, newSection]
    }));
  };

  const updateSection = (id, field, value) => {
    setArticleForm(prev => ({
      ...prev,
      contentSections: prev.contentSections.map(section =>
        section.id === id ? { ...section, [field]: value } : section
      )
    }));
  };

  const removeSection = (id) => {
    setArticleForm(prev => ({
      ...prev,
      contentSections: prev.contentSections.filter(section => section.id !== id)
    }));
  };

  const moveSectionUp = (index) => {
    if (index === 0) return;
    setArticleForm(prev => {
      const newSections = [...prev.contentSections];
      [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
      return { ...prev, contentSections: newSections };
    });
  };

  const moveSectionDown = (index) => {
    if (index === articleForm.contentSections.length - 1) return;
    setArticleForm(prev => {
      const newSections = [...prev.contentSections];
      [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
      return { ...prev, contentSections: newSections };
    });
  };

  const handleSectionImageChange = (sectionId, e) => {
    const file = e.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      updateSection(sectionId, 'imageFile', file);
      updateSection(sectionId, 'imagePreview', preview);
    }
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setArticleForm(prev => ({
        ...prev,
        coverImage: file,
        coverImagePreview: preview
      }));
    }
  };


  const editArticle = (article) => {
    // Parse existing HTML content back to sections (simplified)
    // This is a basic parser - you may want to enhance it
    const parser = new DOMParser();
    const doc = parser.parseFromString(article.content, 'text/html');
    const sections = [];
    
    doc.body.childNodes.forEach((node, index) => {
      if (node.nodeName === 'H2') {
        sections.push({
          id: Date.now() + index,
          type: 'heading',
          content: node.textContent
        });
      } else if (node.nodeName === 'P') {
        sections.push({
          id: Date.now() + index,
          type: 'paragraph',
          content: node.textContent
        });
      } else if (node.nodeName === 'FIGURE') {
        const img = node.querySelector('img');
        const caption = node.querySelector('figcaption');
        if (img) {
          sections.push({
            id: Date.now() + index,
            type: 'image',
            imageFile: null,
            imagePreview: `http://localhost:5000${img.src}`,
            alt: img.alt || '',
            caption: caption ? caption.textContent : ''
          });
        }
      }
    });

    setArticleForm({
      title: article.title,
      slug: article.slug || generateSlug(article.title),
      metaDescription: article.metaDescription || '',
      description: article.description,
      contentSections: sections,
      authorName: article.author.name,
      authorEmail: article.author.email,
      categoryId: article.category._id,
      featured: article.featured,
      coverImage: null,
      coverImagePreview: article.images?.[0]?.url ? `http://localhost:5000${article.images[0].url}` : null
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h1 className="admin-title">Quản trị viên</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ color: '#6c757d' }}>
                👤 <strong>{user?.username}</strong>
              </span>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(245, 87, 108, 0.2)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(245, 87, 108, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(245, 87, 108, 0.2)';
                }}
              >
                🚪 Đăng xuất
              </button>
            </div>
          </div>
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
              {/* SEO Section */}
              <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>🔍 Thông tin SEO</h3>
                
                <div className="form-group">
                  <label className="form-label">Tiêu đề chính (H1) *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={articleForm.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setArticleForm(prev => ({ 
                        ...prev, 
                        title: newTitle,
                        slug: generateSlug(newTitle)
                      }));
                    }}
                    placeholder="Tiêu đề chính của bài viết (quan trọng cho SEO)"
                    required
                  />
                  <small style={{ color: '#6c757d', display: 'block', marginTop: '0.25rem' }}>
                    Nên có 50-60 ký tự, chứa từ khóa chính
                  </small>
                </div>

                <div className="form-group">
                  <label className="form-label">Đường dẫn URL (Slug) *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={articleForm.slug}
                    onChange={(e) => setArticleForm(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="duong-dan-url-cua-bai-viet"
                    required
                  />
                  <small style={{ color: '#6c757d', display: 'block', marginTop: '0.25rem' }}>
                    URL: /article/{articleForm.slug || 'duong-dan-url'}
                  </small>
                </div>

                <div className="form-group">
                  <label className="form-label">Meta Description *</label>
                  <textarea
                    className="form-input"
                    value={articleForm.metaDescription}
                    onChange={(e) => setArticleForm(prev => ({ ...prev, metaDescription: e.target.value }))}
                    rows="2"
                    placeholder="Mô tả ngắn gọn xuất hiện trong kết quả tìm kiếm"
                    maxLength="160"
                    required
                  />
                  <small style={{ color: '#6c757d', display: 'block', marginTop: '0.25rem' }}>
                    {articleForm.metaDescription.length}/160 ký tự - Nên có 150-160 ký tự
                  </small>
                </div>

                <div className="form-group">
                  <label className="form-label">Mô tả ngắn (Excerpt) *</label>
                  <textarea
                    className="form-input"
                    value={articleForm.description}
                    onChange={(e) => setArticleForm(prev => ({ ...prev, description: e.target.value }))}
                    rows="3"
                    placeholder="Tóm tắt nội dung bài viết (hiển thị trong danh sách bài viết)"
                    required
                  />
                </div>
              </div>

              {/* Cover Image */}
              <div className="form-group">
                <label className="form-label">Ảnh đại diện *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className="form-input"
                />
                {articleForm.coverImagePreview && (
                  <div className="image-preview-container">
                    <div className="image-preview-header">
                      <span className="image-preview-label">Ảnh hiện tại:</span>
                      <button
                        type="button"
                        className="image-delete-btn"
                        onClick={() => {
                          setArticleForm(prev => ({
                            ...prev,
                            coverImage: null,
                            coverImagePreview: null
                          }));
                        }}
                      >
                        🗑️ Xóa ảnh
                      </button>
                    </div>
                    <img 
                      src={articleForm.coverImagePreview} 
                      alt="Cover preview" 
                      className="image-preview-img"
                    />
                    <p className="image-help-text">
                      💡 Để thay đổi ảnh, chọn file mới ở trên
                    </p>
                  </div>
                )}
              </div>

              {/* Content Sections */}
              <div style={{ marginTop: '2rem', marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>📝 Nội dung bài viết</h3>
                
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <button 
                    type="button" 
                    onClick={() => addSection('heading')}
                    style={{ padding: '0.5rem 1rem', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    + Tiêu đề phụ (H2)
                  </button>
                  <button 
                    type="button" 
                    onClick={() => addSection('paragraph')}
                    style={{ padding: '0.5rem 1rem', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    + Đoạn văn
                  </button>
                  <button 
                    type="button" 
                    onClick={() => addSection('image')}
                    style={{ padding: '0.5rem 1rem', background: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    + Hình ảnh
                  </button>
                </div>

                {/* Render content sections */}
                {articleForm.contentSections.map((section, index) => (
                  <div 
                    key={section.id} 
                    style={{ 
                      background: 'white', 
                      border: '2px solid #e9ecef', 
                      borderRadius: '8px', 
                      padding: '1rem', 
                      marginBottom: '1rem' 
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <strong style={{ color: '#2c3e50' }}>
                        {section.type === 'heading' && '📌 Tiêu đề phụ (H2)'}
                        {section.type === 'paragraph' && '📄 Đoạn văn'}
                        {section.type === 'image' && '🖼️ Hình ảnh'}
                      </strong>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          type="button" 
                          onClick={() => moveSectionUp(index)}
                          disabled={index === 0}
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                        >
                          ↑
                        </button>
                        <button 
                          type="button" 
                          onClick={() => moveSectionDown(index)}
                          disabled={index === articleForm.contentSections.length - 1}
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                        >
                          ↓
                        </button>
                        <button 
                          type="button" 
                          onClick={() => removeSection(section.id)}
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', color: 'red' }}
                        >
                          Xóa
                        </button>
                      </div>
                    </div>

                    {section.type === 'heading' && (
                      <input
                        type="text"
                        className="form-input"
                        value={section.content}
                        onChange={(e) => updateSection(section.id, 'content', e.target.value)}
                        placeholder="Nhập tiêu đề phụ..."
                        style={{ fontSize: '1.2rem', fontWeight: 'bold' }}
                      />
                    )}

                    {section.type === 'paragraph' && (
                      <textarea
                        className="form-input"
                        value={section.content}
                        onChange={(e) => updateSection(section.id, 'content', e.target.value)}
                        placeholder="Nhập nội dung đoạn văn..."
                        rows="5"
                        style={{ lineHeight: '1.8' }}
                      />
                    )}

                    {section.type === 'image' && (
                      <div>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleSectionImageChange(section.id, e)}
                            className="form-input"
                          />
                        </div>
                        {section.imagePreview && (
                          <div className="section-image-preview">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                              <span style={{ fontSize: '0.85rem', color: '#6c757d', fontWeight: '500' }}>
                                Ảnh hiện tại
                              </span>
                              <button
                                type="button"
                                className="section-image-delete-btn"
                                onClick={() => {
                                  updateSection(section.id, 'imageFile', null);
                                  updateSection(section.id, 'imagePreview', null);
                                }}
                              >
                                🗑️ Xóa ảnh
                              </button>
                            </div>
                            <img 
                              src={section.imagePreview} 
                              alt="Preview" 
                              className="image-preview-img"
                            />
                            <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#6c757d', fontStyle: 'italic', marginBottom: 0 }}>
                              💡 Để thay đổi ảnh, chọn file mới ở trên
                            </p>
                          </div>
                        )}
                        <input
                          type="text"
                          className="form-input"
                          value={section.alt || ''}
                          onChange={(e) => updateSection(section.id, 'alt', e.target.value)}
                          placeholder="Alt text (mô tả hình ảnh cho SEO và accessibility)"
                          style={{ marginBottom: '0.5rem' }}
                        />
                        <input
                          type="text"
                          className="form-input"
                          value={section.caption || ''}
                          onChange={(e) => updateSection(section.id, 'caption', e.target.value)}
                          placeholder="Chú thích hình ảnh (tùy chọn)"
                        />
                      </div>
                    )}
                  </div>
                ))}

                {articleForm.contentSections.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '2rem', background: '#f8f9fa', borderRadius: '8px', color: '#6c757d' }}>
                    Chưa có nội dung. Nhấn các nút bên trên để thêm tiêu đề, đoạn văn hoặc hình ảnh.
                  </div>
                )}
              </div>

              {/* Author and Category Info */}
              <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>👤 Thông tin tác giả & phân loại</h3>
                
                <div className="form-group">
                  <label className="form-label">Tên tác giả *</label>
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
                  <label className="form-label">Danh mục *</label>
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
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={articleForm.featured}
                      onChange={(e) => setArticleForm(prev => ({ ...prev, featured: e.target.checked }))}
                    />
                    <span>⭐ Bài viết nổi bật</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Đang lưu...' : (editingArticle ? 'Cập nhật bài viết' : 'Xuất bản bài viết')}
                </button>
                {editingArticle && (
                  <button 
                    type="button" 
                    className="cancel-btn" 
                    onClick={resetArticleForm}
                  >
                    Hủy chỉnh sửa
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
