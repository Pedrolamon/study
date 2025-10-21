import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

// Singleton pattern para evitar múltiplas instâncias do Prisma Client
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

// Função para conectar ao banco de dados
export const connectDatabase = async (): Promise<void> => {
  try {
    const prismaClient = getPrismaClient();
    await prismaClient.$connect();
    console.log('✅ Connected to PostgreSQL with Prisma successfully');
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error);
    process.exit(1);
  }
};

// Função para desconectar do banco de dados
export const disconnectDatabase = async (): Promise<void> => {
  try {
    const prismaClient = getPrismaClient();
    await prismaClient.$disconnect();
    console.log('✅ Disconnected from PostgreSQL');
  } catch (error) {
    console.error('❌ PostgreSQL disconnection error:', error);
  }
};

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