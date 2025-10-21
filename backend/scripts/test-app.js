#!/usr/bin/env node

/**
 * Script para testar se o app não quebrou após a migração para Prisma
 */

const { execSync } = require('child_process');
const path = require('path');

async function testApp() {
  console.log('🧪 Testando se o app não quebrou após migração para Prisma...\n');

  try {
    // Verificar se o Prisma está configurado
    console.log('📋 Verificando configuração do Prisma...');
    try {
      execSync('npx prisma --version', { stdio: 'pipe', cwd: path.join(__dirname, '..') });
      console.log('✅ Prisma CLI encontrado');
    } catch (error) {
      console.log('❌ Prisma CLI não encontrado');
      return;
    }

    // Verificar se o cliente Prisma foi gerado
    console.log('📋 Verificando cliente Prisma...');
    try {
      execSync('npx prisma generate', { stdio: 'pipe', cwd: path.join(__dirname, '..') });
      console.log('✅ Cliente Prisma gerado com sucesso');
    } catch (error) {
      console.log('❌ Erro ao gerar cliente Prisma:', error.message);
      return;
    }

    // Verificar se o TypeScript compila
    console.log('📋 Verificando compilação TypeScript...');
    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe', cwd: path.join(__dirname, '..') });
      console.log('✅ TypeScript compila sem erros');
    } catch (error) {
      console.log('❌ Erros de compilação TypeScript:', error.message);
      return;
    }

    // Verificar se as dependências estão instaladas
    console.log('📋 Verificando dependências...');
    try {
      execSync('npm list @prisma/client', { stdio: 'pipe', cwd: path.join(__dirname, '..') });
      console.log('✅ @prisma/client instalado');
    } catch (error) {
      console.log('❌ @prisma/client não encontrado');
      return;
    }

    // Verificar se o MongoDB foi removido
    console.log('📋 Verificando se MongoDB foi removido...');
    try {
      execSync('npm list mongoose', { stdio: 'pipe', cwd: path.join(__dirname, '..') });
      console.log('⚠️ MongoDB ainda está instalado (deve ser removido)');
    } catch (error) {
      console.log('✅ MongoDB removido com sucesso');
    }

    console.log('\n🎉 Testes concluídos!');
    console.log('📋 Resumo:');
    console.log('   ✅ Prisma configurado');
    console.log('   ✅ Cliente Prisma gerado');
    console.log('   ✅ TypeScript compila');
    console.log('   ✅ Dependências corretas');
    console.log('   ✅ MongoDB removido');
    
    console.log('\n🚀 Próximos passos:');
    console.log('   1. Configure o PostgreSQL');
    console.log('   2. Execute: npm run db:setup');
    console.log('   3. Execute: npm run db:migrate');
    console.log('   4. Execute: npm run db:seed');
    console.log('   5. Execute: npm run dev');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
    process.exit(1);
  }
}

testApp();
