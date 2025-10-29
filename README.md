# 🎬 KatReview Website

<div align="center">
  <img src="https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react" alt="React 18">
  <img src="https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js" alt="Node.js Express">
  <img src="https://img.shields.io/badge/MongoDB-Database-green?style=for-the-badge&logo=mongodb" alt="MongoDB">
  <img src="https://img.shields.io/badge/Responsive-Mobile%20First-orange?style=for-the-badge" alt="Responsive">
</div>

<div align="center">
  <h3>🌟 A modern Vietnamese review and news website</h3>
  <p>Built with React frontend and Node.js/Express backend</p>
</div>

## 📸 Screenshots

### 🏠 Homepage
![Homepage Desktop](screenshots/homepage-desktop.png)
*Clean and modern homepage with carousel banner and category sections*

### 📱 Mobile View
![Mobile Homepage](screenshots/homepage-mobile.png)
*Fully responsive design optimized for mobile devices*

### 📰 Article Page
![Article Page](screenshots/article-page.png)
*Rich article layout with sidebar for related content*

### ⚙️ Admin Panel
![Admin Panel](screenshots/admin-panel.png)
*Comprehensive admin interface for content management*

### 🔍 Search Functionality
![Search Feature](screenshots/search-feature.png)
*Real-time search with dropdown suggestions*

## ✨ Features

- 🏠 **Homepage**: Carousel banner with latest articles, category sections
- 📂 **Category Pages**: Review, So Sánh, Tin Tức with article listings  
- 📰 **Article Pages**: Full article view with related articles sidebar
- ⚙️ **Admin Panel**: Create and manage articles and categories
- 🔍 **Search Functionality**: Real-time search with dropdown results
- 📱 **Responsive Design**: Mobile-friendly layout
- 🎨 **Modern UI**: Clean and engaging user interface
- ⚡ **Fast Performance**: Optimized loading and smooth interactions

## 🛠️ Tech Stack

### Frontend
- ⚛️ **React 18** - Modern UI library
- 🧭 **React Router DOM** - Client-side routing
- 📡 **Axios** - HTTP client for API calls
- 🎨 **CSS3** - Responsive design with media queries
- 📱 **Mobile First** - Optimized for all devices

### Backend
- 🟢 **Node.js** - JavaScript runtime
- 🚀 **Express.js** - Web application framework
- 🍃 **MongoDB** - NoSQL database with Mongoose ODM
- 📁 **Multer** - File upload handling
- 🔐 **JWT** - Authentication and security

## 🚀 Quick Start

### Prerequisites
- 📦 **Node.js** (v14 or higher)
- 🍃 **MongoDB** (local or cloud)

### Installation

1. **📥 Clone and install dependencies:**
```bash
git clone https://github.com/yourusername/katreview-website.git
cd katreview-website
npm run install-all
```

2. **⚙️ Set up environment variables:**
Create a `.env` file in the `server` directory:
```env
MONGODB_URI=mongodb://localhost:27017/katreview
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
NODE_ENV=development
```

3. **🎬 Start the development servers:**
```bash
npm run dev
```

This will start both the backend server (port 5000) and frontend development server (port 3000).

### 🌐 Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Admin Panel**: http://localhost:3000/admin

### 🗄️ Database Setup

The application will automatically create the necessary collections when you first run it. You can also seed some initial data:

1. **📂 Create default categories:**
```javascript
// Run this in MongoDB shell or through the admin panel
db.categories.insertMany([
  { name: "Review", slug: "review", description: "Đánh giá sản phẩm và dịch vụ" },
  { name: "So Sánh", slug: "so-sanh", description: "So sánh các sản phẩm" },
  { name: "Tin Tức", slug: "tin-tuc", description: "Tin tức công nghệ và đời sống" }
]);
```

## 📁 Project Structure

```
katreview-website/
├── 📁 .github/                 # GitHub workflows and templates
│   ├── 📁 workflows/          # CI/CD automation
│   └── 📁 ISSUE_TEMPLATE/     # Issue templates
├── 📁 client/                 # React frontend
│   ├── 📁 public/            # Static assets
│   ├── 📁 src/
│   │   ├── 📁 components/     # Reusable components
│   │   ├── 📁 pages/         # Page components
│   │   ├── 📁 services/      # API services
│   │   └── 📄 App.js         # Main app component
│   └── 📄 package.json
├── 📁 server/                 # Node.js backend
│   ├── 📁 models/            # Database models
│   ├── 📁 routes/            # API routes
│   ├── 📁 uploads/           # File uploads
│   └── 📄 index.js           # Server entry point
├── 📁 screenshots/            # Project screenshots
├── 📄 LICENSE                # MIT License
└── 📄 package.json           # Root package.json
```

## 🔌 API Endpoints

### 📰 Articles
- `GET /api/articles` - Get all articles (with pagination)
- `GET /api/articles/latest` - Get latest articles for carousel
- `GET /api/articles/category/:slug` - Get articles by category
- `GET /api/articles/:slug` - Get single article
- `GET /api/articles/:slug/related` - Get related articles
- `POST /api/articles` - Create new article (Admin)
- `PUT /api/articles/:id` - Update article (Admin)
- `DELETE /api/articles/:id` - Delete article (Admin)

### 📂 Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:slug` - Get single category
- `POST /api/categories` - Create new category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

### 🔍 Search
- `GET /api/search?q=query` - Search articles

## 💡 Usage

### ⚙️ Admin Panel
Access the admin panel at `/admin` to:
- ✏️ Create and manage articles
- 📂 Create and manage categories
- 📁 Upload images for articles
- 📊 View analytics and statistics

### 📝 Content Management
- 📰 Articles support rich text content (HTML)
- 🖼️ Images are automatically uploaded to the server
- 🔗 SEO-friendly URLs with slugs
- 📄 Meta descriptions for better SEO
- 🏷️ Tag system for better organization

## 🚀 Deployment

### 🌐 Backend Deployment
1. Set `NODE_ENV=production`
2. Update MongoDB connection string
3. Deploy to your preferred platform (Heroku, Vercel, Railway, etc.)

### 🎨 Frontend Deployment
1. Run `npm run build` in the client directory
2. Deploy the build folder to a static hosting service (Netlify, Vercel, etc.)

### 🐳 Docker Deployment (Optional)
```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000 5000
CMD ["npm", "run", "dev"]
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. 🍴 Fork the repository
2. 🌿 Create a feature branch (`git checkout -b feature/amazing-feature`)
3. 💾 Commit your changes (`git commit -m 'Add some amazing feature'`)
4. 📤 Push to the branch (`git push origin feature/amazing-feature`)
5. 🔄 Open a Pull Request

### 📋 Development Guidelines
- 📝 Follow the existing code style
- ✅ Add tests for new features
- 📖 Update documentation as needed
- 🐛 Fix any linting errors

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- ⚛️ React team for the amazing framework
- 🟢 Node.js community for the robust backend platform
- 🍃 MongoDB for the flexible database solution
- 🎨 All contributors who help improve this project

## 📞 Support

If you have any questions or need help, please:
- 🐛 [Open an issue](https://github.com/yourusername/katreview-website/issues)
- 💬 [Start a discussion](https://github.com/yourusername/katreview-website/discussions)
- 📧 Contact us at support@katreview.com

---

<div align="center">
  <p>Made with ❤️ by the KatReview Team</p>
  <p>⭐ Star this repository if you found it helpful!</p>
</div>
