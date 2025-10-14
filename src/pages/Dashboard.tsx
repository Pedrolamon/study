import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Target, 
  TrendingUp, 
  BookOpen, 
  Trophy,
  Play,
  Pause,
  Square
} from 'lucide-react';
import { calculateTimeRemaining } from '../utils/helpers';
import { storageService } from '../services/storage';
import { useTimer } from '../hooks/useTimer';
import { useTasks } from '../hooks/useTasks';
import { useAppointments } from '../hooks/useAppointments';

const Dashboard: React.FC = () => {
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [examDate, setExamDate] = useState<string>('');
  const [userStats, setUserStats] = useState({
    totalStudyTime: 0,
    totalSessions: 0,
    totalTasksCompleted: 0,
    totalExamsTaken: 0,
    averageScore: 0,
    currentStreak: 0,
    level: 1,
    experience: 0,
    experienceToNextLevel: 100,
  });

  const timer = useTimer();
  const tasks = useTasks();
  const appointments = useAppointments();

  // Load exam date and stats
  useEffect(() => {
    const settings = storageService.getSettings();
    setExamDate(settings.examDate || '');
    
    const stats = storageService.getUserStats();
    setUserStats(stats);
  }, []);

  // Update countdown timer
  useEffect(() => {
    if (!examDate) return;

    const updateCountdown = () => {
      const remaining = calculateTimeRemaining(examDate);
      setTimeRemaining(remaining);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [examDate]);

  // Get today's tasks and appointments
  const todayTasks = tasks.getTodayTasks();
  const todayAppointments = appointments.getAppointmentsForDate(
    new Date().toISOString().split('T')[0]
  );



  const formatTime = (value: number): string => {
    return value.toString().padStart(2, '0');
  };

  const getProgressPercentage = (current: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((current / total) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Bem-vindo ao EstudaConcurso!</p>
        </div>
        
        {/* Quick Timer Controls */}
        <div className="flex items-center space-x-2">
          {timer.isRunning ? (
            <>
              <button
                onClick={timer.pauseTimer}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Pause className="h-4 w-4 mr-2" />
                Pausar
              </button>
              <button
                onClick={timer.stopTimer}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Square className="h-4 w-4 mr-2" />
                Parar
              </button>
            </>
          ) : (
                          <button
                onClick={() => timer.startTimer('pomodoro')}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Play className="h-4 w-4 mr-2" />
                Iniciar Timer
              </button>
          )}
        </div>
      </div>

      {/* Countdown to Exam */}
      {examDate && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Contagem Regressiva</h2>
              <p className="text-blue-100">Para o dia da prova</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-200" />
          </div>
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{formatTime(timeRemaining.days)}</div>
              <div className="text-sm text-blue-200">Dias</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{formatTime(timeRemaining.hours)}</div>
              <div className="text-sm text-blue-200">Horas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{formatTime(timeRemaining.minutes)}</div>
              <div className="text-sm text-blue-200">Minutos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{formatTime(timeRemaining.seconds)}</div>
              <div className="text-sm text-blue-200">Segundos</div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tempo de Estudo</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(userStats.totalStudyTime / 60)}h
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Target className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tarefas Concluídas</p>
              <p className="text-2xl font-bold text-gray-900">
                {userStats.totalTasksCompleted}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpen className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Simulados Realizados</p>
              <p className="text-2xl font-bold text-gray-900">
                {userStats.totalExamsTaken}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Trophy className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Nível Atual</p>
              <p className="text-2xl font-bold text-gray-900">
                {userStats.level}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Experience Progress */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Progresso de Experiência</h3>
          <span className="text-sm text-gray-500">
            {userStats.experience} / {userStats.experienceToNextLevel} XP
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000"
            style={{ width: `${getProgressPercentage(userStats.experience, userStats.experienceToNextLevel)}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {userStats.experienceToNextLevel - userStats.experience} XP restantes para o próximo nível
        </p>
      </div>

      {/* Average Score */}
      {userStats.averageScore > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Média de Acertos</h3>
              <p className="text-sm text-gray-600">Em simulados realizados</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-green-600">
                {userStats.averageScore.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Today's Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Tarefas de Hoje</h3>
          </div>
          <div className="p-6">
            {todayTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhuma tarefa para hoje</p>
            ) : (
              <div className="space-y-3">
                {todayTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => tasks.toggleTaskCompletion(task.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className={`flex-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {task.title}
                    </span>
                    {task.priority && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        task.priority === 'high' ? 'bg-red-100 text-red-800' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Compromissos de Hoje</h3>
          </div>
          <div className="p-6">
            {todayAppointments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum compromisso para hoje</p>
            ) : (
              <div className="space-y-3">
                {todayAppointments.slice(0, 5).map((appointment) => (
                  <div key={appointment.id} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {appointment.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {appointment.startTime} - {appointment.endTime}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <Target className="h-6 w-6 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Nova Tarefa</span>
          </button>
          <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <Calendar className="h-6 w-6 text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Novo Compromisso</span>
          </button>
          <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <BookOpen className="h-6 w-6 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Novo Simulado</span>
          </button>
          <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <TrendingUp className="h-6 w-6 text-orange-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Ver Relatórios</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
