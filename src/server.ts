import express from 'express';
import dotenv from 'dotenv';
import { initializeDatabase } from './db/index.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
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
