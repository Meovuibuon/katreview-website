import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { articlesAPI } from '../services/api';

const Carousel = () => {
  const [articles, setArticles] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchLatestArticles = async () => {
      try {
        const response = await articlesAPI.getLatest(5);
        setArticles(response.data);
      } catch (error) {
        console.error('Error fetching latest articles:', error);
      }
    };

    fetchLatestArticles();
  }, []);

  useEffect(() => {
    if (articles.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % articles.length);
      }, 6000);

      return () => clearInterval(interval);
    }
  }, [articles]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + articles.length) % articles.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % articles.length);
  };

  if (articles.length === 0) {
    return (
      <div className="carousel-container">
        <div className="carousel-slide active">
          <div className="carousel-content">
            <h2 className="carousel-title">NATURE FOR ALL</h2>
            <p className="carousel-description">
              Chào mừng bạn đến với KatReview - nơi chia sẻ những đánh giá và tin tức chất lượng
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="carousel-container">
      {articles.map((article, index) => (
        <div
          key={article._id}
          className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
          style={{
            backgroundImage: article.images && article.images.length > 0 
              ? `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${article.images[0].url})`
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="carousel-content">
            <h2 className="carousel-title">{article.title}</h2>
            <p className="carousel-description">{article.description}</p>
            <Link
              to={`/article/${article.slug}`}
              className="read-more-btn"
              style={{ marginTop: '1rem', display: 'inline-block' }}
            >
              Đọc thêm
            </Link>
          </div>
        </div>
      ))}

      <button className="carousel-nav prev" onClick={goToPrevious}>
        ‹
      </button>
      <button className="carousel-nav next" onClick={goToNext}>
        ›
      </button>

      <div className="carousel-dots">
        {articles.map((_, index) => (
          <button
            key={index}
            className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
