import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { initDatabase } from './database/init.js';
import authRoutes from './routes/authRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import statsRoutes from './routes/statsRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure upload directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Path to React production build
const clientDistPath = path.join(__dirname, '../client/dist');

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files
app.use('/uploads', express.static(uploadsDir));

// Serve React production build static files
app.use(express.static(clientDistPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/impact', statsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'Green Campus Reporting & Sustainability Management System',
    timestamp: new Date().toISOString()
  });
});

// 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// Serve React production frontend for all non-API GET requests (SPA routing)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }

  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'An unexpected error occurred. Please try again later.'
  });
});

// Initialize DB and start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` Green Campus Backend Server running on port ${PORT}`);
    console.log(` API Health: http://localhost:${PORT}/api/health`);
    console.log(` Uploads:    http://localhost:${PORT}/uploads`);
    console.log(`=======================================================`);
  });
}).catch(err => {
  console.error('Failed to initialize database on startup:', err);
  process.exit(1);
});
