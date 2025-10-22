import dotenv from 'dotenv';
import { prisma } from '../config/database';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Connect to test database
beforeAll(async () => {
  try {
    await prisma.$connect();
    console.log('✅ Connected to test database');
  } catch (error) {
    console.error('❌ Failed to connect to test database:', error);
    throw error;
  }
});

// Clear database between tests
beforeEach(async () => {
  // Delete all data in reverse order of dependencies
  await prisma.achievement.deleteMany();
  await prisma.userPoints.deleteMany();
  await prisma.studyReport.deleteMany();
  await prisma.appSettings.deleteMany();
  await prisma.focusTools.deleteMany();
  await prisma.blockedSite.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.simulatedExam.deleteMany();
  await prisma.studyMaterial.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.task.deleteMany();
  await prisma.flashcard.deleteMany();
  await prisma.studySession.deleteMany();
  await prisma.user.deleteMany();
});

// Disconnect from database after all tests
afterAll(async () => {
  try {
    await prisma.$disconnect();
    console.log('✅ Disconnected from test database');
  } catch (error) {
    console.error('❌ Error disconnecting from test database:', error);
  }
});