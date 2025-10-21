import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  try {
    // Criar usuário admin
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@studyapp.com' },
      update: {},
      create: {
        email: 'admin@studyapp.com',
        password: hashedPassword,
        name: 'Administrador',
        avatar: null,
        studyStreak: 0,
        isActive: true,
      },
    });

    console.log('✅ Usuário admin criado:', adminUser.email);

    // Criar badges iniciais
    const badges = [
      {
        name: 'Primeiro Passo',
        description: 'Complete sua primeira sessão de estudo',
        icon: '🎯',
        category: 'STUDY',
        pointsReward: 10,
        requirements: {
          type: 'study_time',
          value: 1
        }
      },
      {
        name: 'Maratonista',
        description: 'Estude por 4 horas em um dia',
        icon: '🏃‍♂️',
        category: 'STUDY',
        pointsReward: 50,
        requirements: {
          type: 'study_time',
          value: 240
        }
      },
      {
        name: 'Organizador',
        description: 'Complete 10 tarefas',
        icon: '📋',
        category: 'ACHIEVEMENT',
        pointsReward: 30,
        requirements: {
          type: 'tasks_completed',
          value: 10
        }
      },
      {
        name: 'Flashcard Master',
        description: 'Revise 100 flashcards',
        icon: '🃏',
        category: 'STUDY',
        pointsReward: 40,
        requirements: {
          type: 'flashcards_reviewed',
          value: 100
        }
      },
      {
        name: 'Streak Master',
        description: 'Mantenha uma sequência de 7 dias',
        icon: '🔥',
        category: 'ACHIEVEMENT',
        pointsReward: 100,
        requirements: {
          type: 'streak_days',
          value: 7
        }
      }
    ];

    for (const badge of badges) {
      // Verificar se o badge já existe
      const existingBadge = await prisma.badge.findFirst({
        where: { name: badge.name }
      });
      
      if (!existingBadge) {
        await prisma.badge.create({
          data: {
            ...badge,
            category: badge.category as any, // Cast para o enum
          },
        });
      }
    }

    console.log('✅ Badges criados');

    // Criar configurações do app para o admin
    await prisma.appSettings.upsert({
      where: { userId: adminUser.id },
      update: {},
      create: {
        userId: adminUser.id,
        examDate: null,
        notifications: true,
        soundEnabled: true,
        theme: 'AUTO',
        timerSettings: {
          pomodoroWork: 25,
          pomodoroBreak: 5,
          pomodoroLongBreak: 15,
          pomodoroCycles: 4,
          customWork: 45,
          customBreak: 10
        }
      },
    });

    console.log('✅ Configurações do app criadas');

    // Criar pontos do usuário
    await prisma.userPoints.upsert({
      where: { userId: adminUser.id },
      update: {},
      create: {
        userId: adminUser.id,
        totalPoints: 0,
        level: 1,
        experience: 0,
        experienceToNextLevel: 100,
        pointsHistory: []
      },
    });

    console.log('✅ Pontos do usuário criados');

    // Criar algumas tarefas de exemplo
    const tasks = [
      {
        userId: adminUser.id,
        title: 'Revisar flashcards de matemática',
        description: 'Revisar 20 flashcards sobre álgebra',
        priority: 'HIGH' as const,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      {
        userId: adminUser.id,
        title: 'Estudar capítulo 3 do livro',
        description: 'Ler e fazer exercícios do capítulo 3',
        priority: 'MEDIUM' as const,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      {
        userId: adminUser.id,
        title: 'Preparar apresentação',
        description: 'Criar slides para apresentação da próxima semana',
        priority: 'LOW' as const,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    ];

    for (const task of tasks) {
      await prisma.task.create({
        data: task,
      });
    }

    console.log('✅ Tarefas de exemplo criadas');

    // Criar alguns flashcards de exemplo
    const flashcards = [
      {
        userId: adminUser.id,
        question: 'Qual é a fórmula da área do círculo?',
        answer: 'A = πr²',
        category: 'Matemática',
        difficulty: 'EASY' as const,
        tags: ['geometria', 'área', 'círculo']
      },
      {
        userId: adminUser.id,
        question: 'O que é a fotossíntese?',
        answer: 'Processo pelo qual plantas convertem luz solar em energia química',
        category: 'Biologia',
        difficulty: 'MEDIUM' as const,
        tags: ['biologia', 'plantas', 'energia']
      },
      {
        userId: adminUser.id,
        question: 'Quem escreveu "Dom Casmurro"?',
        answer: 'Machado de Assis',
        category: 'Literatura',
        difficulty: 'EASY' as const,
        tags: ['literatura', 'brasileira', 'romance']
      }
    ];

    for (const flashcard of flashcards) {
      await prisma.flashcard.create({
        data: flashcard,
      });
    }

    console.log('✅ Flashcards de exemplo criados');

    console.log('\n🎉 Seed concluído com sucesso!');
    console.log('📋 Dados criados:');
    console.log('   - 1 usuário admin (admin@studyapp.com / admin123)');
    console.log('   - 5 badges');
    console.log('   - 3 tarefas de exemplo');
    console.log('   - 3 flashcards de exemplo');
    console.log('   - Configurações do app');
    console.log('   - Sistema de pontos');

  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    // process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
