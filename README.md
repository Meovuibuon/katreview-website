# KatReview Website

A Vietnamese review and news website built with React frontend and Node.js/Express backend.

## Features

- **Homepage**: Carousel banner with latest articles, category sections
- **Category Pages**: Review, So Sánh, Tin Tức with article listings
- **Article Pages**: Full article view with related articles sidebar
- **Admin Panel**: Create and manage articles and categories
- **Search Functionality**: Real-time search with dropdown results
- **Responsive Design**: Mobile-friendly layout

## Tech Stack

### Frontend
- React 18
- React Router DOM
- Axios for API calls
- CSS3 with responsive design

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Multer for file uploads

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd katreview-website
npm run install-all
```

2. **Set up environment variables:**
Create a `.env` file in the `server` directory:
```
MONGODB_URI=mongodb://localhost:27017/katreview
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
NODE_ENV=development
```

3. **Start the development servers:**
```bash
npm run dev
```

This will start both the backend server (port 5000) and frontend development server (port 3000).

### Database Setup

The application will automatically create the necessary collections when you first run it. You can also seed some initial data:

1. **Create default categories:**
```javascript
// Run this in MongoDB shell or through the admin panel
db.categories.insertMany([
  { name: "Review", slug: "review", description: "Đánh giá sản phẩm và dịch vụ" },
  { name: "So Sánh", slug: "so-sanh", description: "So sánh các sản phẩm" },
  { name: "Tin Tức", slug: "tin-tuc", description: "Tin tức công nghệ và đời sống" }
]);
```

## Project Structure

```
katreview-website/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── App.js
│   └── package.json
├── server/                 # Node.js backend
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── uploads/           # File uploads
│   └── index.js
└── package.json           # Root package.json
```

## API Endpoints

### Articles
- `GET /api/articles` - Get all articles (with pagination)
- `GET /api/articles/latest` - Get latest articles for carousel
- `GET /api/articles/category/:slug` - Get articles by category
- `GET /api/articles/:slug` - Get single article
- `GET /api/articles/:slug/related` - Get related articles
- `POST /api/articles` - Create new article (Admin)
- `PUT /api/articles/:id` - Update article (Admin)
- `DELETE /api/articles/:id` - Delete article (Admin)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:slug` - Get single category
- `POST /api/categories` - Create new category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Search
- `GET /api/search?q=query` - Search articles

## Usage

### Admin Panel
Access the admin panel at `/admin` to:
- Create and manage articles
- Create and manage categories
- Upload images for articles

### Content Management
- Articles support rich text content (HTML)
- Images are automatically uploaded to the server
- SEO-friendly URLs with slugs
- Meta descriptions for better SEO

## Deployment

### Backend Deployment
1. Set `NODE_ENV=production`
2. Update MongoDB connection string
3. Deploy to your preferred platform (Heroku, Vercel, etc.)

### Frontend Deployment
1. Run `npm run build` in the client directory
2. Deploy the build folder to a static hosting service

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
