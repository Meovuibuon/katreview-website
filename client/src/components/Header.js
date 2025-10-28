import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { searchAPI } from '../services/api';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const searchArticles = async () => {
      if (searchQuery.trim().length > 2) {
        try {
          const response = await searchAPI.search(searchQuery, 5);
          setSearchResults(response.data);
          setShowResults(true);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    };

    const timeoutId = setTimeout(searchArticles, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    setSearchQuery('');
    setShowResults(false);
  }, [location]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleResultClick = () => {
    setShowResults(false);
    setSearchQuery('');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-top">
        <Link to="/" className="logo">
          KatReview
        </Link>
        <div className="social-icons">
          <a href="#" className="social-icon" aria-label="Facebook">
            <i className="fab fa-facebook-f"></i>
          </a>
          <a href="#" className="social-icon" aria-label="YouTube">
            <i className="fab fa-youtube"></i>
          </a>
          <a href="#" className="social-icon" aria-label="Instagram">
            <i className="fab fa-instagram"></i>
          </a>
          <a href="#" className="social-icon" aria-label="Twitter">
            <i className="fab fa-twitter"></i>
          </a>
        </div>
      </div>
      
      <div className="search-container">
        <input
          type="text"
          className="search-box"
          placeholder="Tìm kiếm bài viết..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
        {showResults && searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map((article) => (
              <div key={article._id} className="search-result-item">
                <Link
                  to={`/article/${article.slug}`}
                  onClick={handleResultClick}
                >
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      {article.title}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                      {article.description.substring(0, 100)}...
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <nav className="navigation">
        <ul className="nav-list">
          <li className="nav-item">
            <Link to="/" className={isActive('/') ? 'active' : ''}>
              Trang Chủ
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/category/review" className={isActive('/category/review') ? 'active' : ''}>
              Review
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/category/so-sanh" className={isActive('/category/so-sanh') ? 'active' : ''}>
              So Sánh
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/category/tin-tuc" className={isActive('/category/tin-tuc') ? 'active' : ''}>
              Tin Tức
            </Link>
          </li>
        </ul>
      </nav>
      </div>
    </header>
  );
};

export default Header;
