import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Carousel from '../components/Carousel';
import ArticleCard from '../components/ArticleCard';
import { articlesAPI } from '../services/api';

const HomePage = () => {
  const [categoryArticles, setCategoryArticles] = useState({
    review: [],
    'so-sanh': [],
    'tin-tuc': []
  });

  useEffect(() => {
    const fetchCategoryArticles = async () => {
      try {
        const [reviewRes, soSanhRes, tinTucRes] = await Promise.all([
          articlesAPI.getByCategory('review', 6),
          articlesAPI.getByCategory('so-sanh', 6),
          articlesAPI.getByCategory('tin-tuc', 6)
        ]);

        setCategoryArticles({
          review: reviewRes.data,
          'so-sanh': soSanhRes.data,
          'tin-tuc': tinTucRes.data
        });
      } catch (error) {
        console.error('Error fetching category articles:', error);
      }
    };

    fetchCategoryArticles();
  }, []);

  const CategorySection = ({ title, articles, categorySlug }) => (
    <section className="category-section">
      <div className="category-header">
        <h2 className="category-title">{title}</h2>
        <Link to={`/category/${categorySlug}`} className="read-more-btn">
          Đọc thêm các bài viết của chủ đề này
        </Link>
      </div>
      <div className="articles-grid">
        {articles.map((article) => (
          <ArticleCard key={article._id} article={article} />
        ))}
      </div>
    </section>
  );

  return (
    <div className="homepage">
      <Carousel />
      
      <div className="container">
        <CategorySection
          title="Review"
          articles={categoryArticles.review.slice(0, 6)}
          categorySlug="review"
        />
        
        <CategorySection
          title="So Sánh"
          articles={categoryArticles['so-sanh'].slice(0, 6)}
          categorySlug="so-sanh"
        />
        
        <CategorySection
          title="Tin Tức"
          articles={categoryArticles['tin-tuc'].slice(0, 6)}
          categorySlug="tin-tuc"
        />
      </div>
    </div>
  );
};

export default HomePage;
