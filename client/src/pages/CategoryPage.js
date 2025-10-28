import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard';
import { articlesAPI, categoriesAPI } from '../services/api';

const CategoryPage = () => {
  const { categorySlug } = useParams();
  const [articles, setArticles] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [articlesRes, categoryRes] = await Promise.all([
          articlesAPI.getAll(page, 12, categorySlug),
          categoriesAPI.getBySlug(categorySlug)
        ]);

        if (page === 1) {
          setArticles(articlesRes.data.articles);
        } else {
          setArticles(prev => [...prev, ...articlesRes.data.articles]);
        }

        setCategory(categoryRes.data);
        setHasMore(page < articlesRes.data.totalPages);
      } catch (error) {
        console.error('Error fetching category data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categorySlug, page]);

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  const getCategoryTitle = (slug) => {
    const titles = {
      'review': 'Review',
      'so-sanh': 'So Sánh',
      'tin-tuc': 'Tin Tức'
    };
    return titles[slug] || slug;
  };

  if (loading && page === 1) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="category-page">
      <div className="container">
        <div className="category-header">
          <h1 className="category-title">
            {category ? category.name : getCategoryTitle(categorySlug)}
          </h1>
        </div>

        {articles.length > 0 ? (
          <>
            <div className="articles-grid">
              {articles.map((article) => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>

            {hasMore && (
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button
                  onClick={loadMore}
                  className="read-more-btn"
                  disabled={loading}
                >
                  {loading ? 'Đang tải...' : 'Tải thêm bài viết'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p>Chưa có bài viết nào trong danh mục này.</p>
            <Link to="/" className="read-more-btn" style={{ marginTop: '1rem', display: 'inline-block' }}>
              Về trang chủ
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
