import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { connectDatabase } from './config/database';
import { errorHandler, notFound } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';
import studySessionRoutes from './routes/studySessions';
import notificationRoutes from './routes/notifications';
import flashcardRoutes from './routes/flashcards';
import studyMaterialRoutes from './routes/studyMaterials';
import reportRoutes from './routes/reports';
import gamificationRoutes from './routes/gamification';
import simulatedExamRoutes from './routes/simulatedExams';
import studyPlanRoutes from './routes/studyPlans';
import focusToolsRoutes from './routes/focusTools';
import advancedFeaturesRoutes from './routes/advancedFeatures';

// Load environment variables
dotenv.config();

const app = express();

// Connect to database
connectDatabase();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env['CORS_ORIGIN'] || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: Number(process.env['RATE_LIMIT_WINDOW_MS']) || 15 * 60 * 1000, // 15 minutes
  max: Number(process.env['RATE_LIMIT_MAX_REQUESTS']) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Study App API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/study-sessions', studySessionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/study-materials', studyMaterialRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/simulated-exams', simulatedExamRoutes);
app.use('/api/study-plans', studyPlanRoutes);
app.use('/api/focus-tools', focusToolsRoutes);
app.use('/api/advanced-features', advancedFeaturesRoutes);

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

export default app;
