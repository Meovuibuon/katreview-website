import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-social">
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
        <div className="footer-copyright">
          <p>&copy; 2024 KatReview. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
