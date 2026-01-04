import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { syncDatabase } from './models/index.js';
import { errorHandler } from './utils/errors.js';

// Import routes
import authRoutes from './routes/auth.js';
import problemRoutes from './routes/problems.js';
import submissionRoutes from './routes/submissions.js';
import courseRoutes from './routes/courses.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Coding Platform API is running' });
});

// Routes
app.use('/auth', authRoutes);
app.use('/problems', problemRoutes);
app.use('/submissions', submissionRoutes);
app.use('/courses', courseRoutes);
app.use('/admin', adminRoutes);

// 404 handler (must come before error handler)
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Sync database (non-blocking - won't crash if it fails)
    syncDatabase().catch(err => {
      console.warn('Database sync warning (server will continue):', err.message);
    });

    // Start listening
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    // In production, try to continue running
    if (process.env.NODE_ENV === 'production') {
      console.error('Server error in production - attempting to continue...');
    } else {
      process.exit(1);
    }
  }
};

// Handle unhandled promise rejections - log but don't crash
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Log error but continue running - don't crash the server
  // In production, we want the server to stay up
});

// Handle uncaught exceptions - log but try to continue
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Log error but try to continue - only exit in development for debugging
  if (process.env.NODE_ENV === 'development') {
    process.exit(1);
  }
  // In production, log and continue
});

startServer();

