import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import hashtagRoutes from './routes/hashtagRoutes.js';
import imageRoutes from './routes/imageRoutes.js';
import { errorMiddleware } from './utils/errorHandler.js';  // Changed from './middleware/errorHandler.js'
import logger from './utils/logger.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for rate limiting
// app.set('trust proxy', 1);  // Commented out

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
// app.use('/api', apiRateLimiter);  // Commented out

// Routes
app.use('/api/auth', userRoutes);   // For auth routes (login, register)
// Remove this line to avoid conflicts:
app.use('/api/users', userRoutes);  // For user profile routes
app.use('/api/posts', postRoutes);
app.use('/api/hashtags', hashtagRoutes);
app.use('/api/images', imageRoutes);

// Add a simple test route
app.get('/api', (req, res) => {
    res.json({ message: 'Backend API is running!', timestamp: new Date().toISOString() });
});

// Error handling middleware (must be last)
app.use(errorMiddleware);  // This line is now correct

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection', { error: err.message, stack: err.stack });
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
  process.exit(1);
});