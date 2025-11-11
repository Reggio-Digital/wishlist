import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase } from './db/index.js';
import authRoutes from './auth/routes.js';
import wishlistRoutes from './wishlists/routes.js';
import itemRoutes from './items/routes.js';

// Load environment variables
dotenv.config();

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Homepage (must come before /:slug route)
app.get('/', (_req, res) => {
  res.render('index', { title: 'Home - Wishlist App' });
});

// Item routes (must come before wishlist routes for proper route matching)
app.use(itemRoutes);

// Wishlist routes (/:slug route must come after other routes)
app.use(wishlistRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).render('index', { title: '404 - Not Found' });
});

// Initialize database and start server
try {
  initializeDatabase();
  console.log('✅ Database initialized successfully');

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  });
} catch (error) {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
}
