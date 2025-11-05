import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { articlesAPI } from '../services/api';

const ArticlePage = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const [articleRes, relatedRes] = await Promise.all([
          articlesAPI.getBySlug(slug),
          articlesAPI.getRelated(slug)
        ]);

        setArticle(articleRes.data);
        setRelatedArticles(relatedRes.data);
      } catch (error) {
        console.error('Error fetching article:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Đang tải bài viết...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Không tìm thấy bài viết</h2>
        <Link to="/" className="read-more-btn" style={{ marginTop: '1rem', display: 'inline-block' }}>
          Về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="article-page">
      <article className="article-main">
        <header className="article-header">
          <h1>{article.title}</h1>
          <div className="article-meta">
            <span>Tác giả: {article.author.name}</span> • 
            <span> Ngày đăng: {formatDate(article.publishedAt)}</span> • 
            <span> Danh mục: {article.category.name}</span> • 
            <span> Lượt xem: {article.views}</span>
          </div>
        </header>

        {article.images && article.images.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <img
              src={article.images[0].url}
              alt={article.images[0].alt || article.title}
              style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
            />
            {article.images[0].caption && (
              <p style={{ textAlign: 'center', fontStyle: 'italic', marginTop: '0.5rem', color: '#6c757d' }}>
                {article.images[0].caption}
              </p>
            )}
          </div>
        )}

        <div className="article-content-text">
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>
      </article>

      <aside className="sidebar">
        <h3 className="sidebar-title">Bài viết liên quan</h3>
        {relatedArticles.length > 0 ? (
          relatedArticles.map((relatedArticle) => (
            <div key={relatedArticle._id} className="related-article">
              <Link to={`/article/${relatedArticle.slug}`}>
                {relatedArticle.title}
              </Link>
            </div>
          ))
        ) : (
          <p>Không có bài viết liên quan.</p>
        )}
      </aside>
    </div>
  );
};

export default ArticlePage;
