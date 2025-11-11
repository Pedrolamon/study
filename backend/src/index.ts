import app from './app';
import dotenv from 'dotenv';
import { SchedulerService } from './services/schedulerService';
import { GamificationService } from './services/gamificationService';

// Load environment variables
dotenv.config();

const PORT: number = parseInt(process.env['PORT'] ?? '3001', 10);

const server = app.listen(PORT, () => {
  console.log(`🚀 Study App API server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
  
  // Inicializar agendadores
  SchedulerService.initializeSchedulers();
  
  // Inicializar badges padrão
  GamificationService.initializeDefaultBadges();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  SchedulerService.stopAllSchedulers();
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  SchedulerService.stopAllSchedulers();
  server.close(() => {
    console.log('Process terminated');
  });
});

export default server; 