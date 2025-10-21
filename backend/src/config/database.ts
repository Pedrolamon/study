import mongoose from 'mongoose';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

// Configuração do MongoDB (existente)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/study-app';

// Configuração do Prisma (PostgreSQL)
let prisma: PrismaClient | null = null;

// Função para obter instância do Prisma
export const getPrismaClient = (): PrismaClient => {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      errorFormat: 'pretty',
    });
  }
  return prisma;
};

// Função para conectar ao MongoDB (Mongoose)
export const connectMongoDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Função para conectar ao PostgreSQL (Prisma)
export const connectPostgreSQL = async (): Promise<void> => {
  try {
    const prismaClient = getPrismaClient();
    await prismaClient.$connect();
    console.log('✅ Connected to PostgreSQL with Prisma successfully');
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error);
    process.exit(1);
  }
};

// Função para desconectar do MongoDB
export const disconnectMongoDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ MongoDB disconnection error:', error);
  }
};

// Função para desconectar do PostgreSQL
export const disconnectPostgreSQL = async (): Promise<void> => {
  try {
    const prismaClient = getPrismaClient();
    await prismaClient.$disconnect();
    console.log('✅ Disconnected from PostgreSQL');
  } catch (error) {
    console.error('❌ PostgreSQL disconnection error:', error);
  }
};

// Função principal para conectar aos bancos
export const connectDatabase = async (): Promise<void> => {
  const usePrisma = process.env.USE_PRISMA === 'true';
  
  if (usePrisma) {
    await connectPostgreSQL();
  } else {
    await connectMongoDB();
  }
};

// Função principal para desconectar dos bancos
export const disconnectDatabase = async (): Promise<void> => {
  const usePrisma = process.env.USE_PRISMA === 'true';
  
  if (usePrisma) {
    await disconnectPostgreSQL();
  } else {
    await disconnectMongoDB();
  }
};

// Handle connection events para MongoDB
mongoose.connection.on('error', (error) => {
  console.error('❌ MongoDB connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDatabase();
  process.exit(0);
});

// Export do Prisma client para uso direto
export { getPrismaClient as prisma };