import { PrismaClient } from '@prisma/client';

// Define o tipo 'prisma' na interface global para evitar erros de TypeScript
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Verifica se já existe uma instância e cria uma nova se não houver
// (Isso é feito para reutilizar a instância durante o hot-reloading)
const prisma = global.prisma || new PrismaClient();

// Se o ambiente NÃO for 'production', armazena a instância no objeto global
// para reutilização em futuras recargas (hot-reloading)
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;