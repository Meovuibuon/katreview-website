import React from 'react';
import { Link } from 'react-router-dom';

const ArticleCard = ({ article }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="article-card">
      <div className="article-image">
        {article.images && article.images.length > 0 ? (
          <img
            src={article.images[0].url}
            alt={article.images[0].alt || article.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span>400 x 200</span>
        )}
      </div>
      <div className="article-content">
        <h3 className="article-title">{article.title}</h3>
        <p className="article-description">{article.description}</p>
        <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#6c757d' }}>
          <span>{article.author.name}</span> • <span>{formatDate(article.publishedAt)}</span>
        </div>
        <Link to={`/article/${article.slug}`} className="read-more-link">
          Đọc thêm →
        </Link>
      </div>
    </div>
  );
};

export default ArticleCard;
