#!/usr/bin/env node

/**
 * Script para configurar o banco de dados PostgreSQL
 * Execute este script antes de rodar as migrações do Prisma
 */

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupDatabase() {
  console.log('🚀 Configurando banco de dados PostgreSQL para o Prisma...\n');

  try {
    // Verificar se PostgreSQL está instalado
    console.log('📋 Verificando se PostgreSQL está instalado...');
    try {
      execSync('psql --version', { stdio: 'pipe' });
      console.log('✅ PostgreSQL encontrado');
    } catch (error) {
      console.log('❌ PostgreSQL não encontrado. Por favor, instale o PostgreSQL primeiro.');
      console.log('📥 Download: https://www.postgresql.org/download/');
      process.exit(1);
    }

    // Solicitar informações do banco
    console.log('\n📝 Configure as informações do banco de dados:');
    
    const host = await question('Host (localhost): ') || 'localhost';
    const port = await question('Porta (5432): ') || '5432';
    const database = await question('Nome do banco (study_app): ') || 'study_app';
    const username = await question('Usuário (postgres): ') || 'postgres';
    const password = await question('Senha: ');

    if (!password) {
      console.log('❌ Senha é obrigatória');
      process.exit(1);
    }

    // Construir URL de conexão
    const databaseUrl = `postgresql://${username}:${password}@${host}:${port}/${database}?schema=public`;
    
    console.log('\n🔧 Configurando variáveis de ambiente...');
    
    // Atualizar arquivo .env
    const fs = require('fs');
    const path = require('path');
    
    const envPath = path.join(__dirname, '..', '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Adicionar ou atualizar DATABASE_URL
    if (envContent.includes('DATABASE_URL=')) {
      envContent = envContent.replace(/DATABASE_URL=.*/, `DATABASE_URL="${databaseUrl}"`);
    } else {
      envContent += `\nDATABASE_URL="${databaseUrl}"\n`;
    }
    
    // Adicionar USE_PRISMA=true
    if (!envContent.includes('USE_PRISMA=')) {
      envContent += 'USE_PRISMA=true\n';
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Arquivo .env atualizado');

    // Criar banco de dados
    console.log('\n🗄️ Criando banco de dados...');
    try {
      execSync(`createdb -h ${host} -p ${port} -U ${username} ${database}`, { stdio: 'pipe' });
      console.log('✅ Banco de dados criado com sucesso');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️ Banco de dados já existe');
      } else {
        console.log('⚠️ Erro ao criar banco de dados:', error.message);
        console.log('💡 Tente criar manualmente: createdb -U postgres study_app');
      }
    }

    // Executar migrações
    console.log('\n🔄 Executando migrações do Prisma...');
    try {
      execSync('npx prisma migrate dev --name init', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
      console.log('✅ Migrações executadas com sucesso');
    } catch (error) {
      console.log('❌ Erro ao executar migrações:', error.message);
      console.log('💡 Execute manualmente: npx prisma migrate dev --name init');
    }

    console.log('\n🎉 Configuração concluída!');
    console.log('📋 Próximos passos:');
    console.log('   1. Execute: npm run dev');
    console.log('   2. Acesse: http://localhost:3000');
    console.log('   3. Use o Prisma Studio: npx prisma studio');

  } catch (error) {
    console.error('❌ Erro durante a configuração:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

setupDatabase();
