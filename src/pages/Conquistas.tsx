import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Star,
  Award,
  Target,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  Zap,
  Crown,
  Medal,
  BarChart3
} from 'lucide-react';
import gamificationService from '../services/gamificationService';
import type { UserStats, Achievement, Badge, LeaderboardEntry } from '../services/gamificationService';

const Conquistas: React.FC = () => {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'badges' | 'leaderboard'>('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [stats, achievementsData, badgesData, leaderboardData] = await Promise.all([
        gamificationService.getUserStats(),
        gamificationService.getAchievements(),
        gamificationService.getBadges(),
        gamificationService.getLeaderboard()
      ]);

      setUserStats(stats);
      setAchievements(achievementsData);
      setBadges(badgesData);
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Erro ao carregar dados de gamificação:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return <Star className="h-4 w-4" />;
      case 'rare': return <Award className="h-4 w-4" />;
      case 'epic': return <Crown className="h-4 w-4" />;
      case 'legendary': return <Trophy className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };



  const getProgressPercentage = (current: number, required: number) => {
    return Math.min((current / required) * 100, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!userStats) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Erro ao carregar dados de gamificação</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Conquistas</h1>
          <p className="text-gray-600">Acompanhe seu progresso e desbloqueie conquistas</p>
        </div>
      </div>

      {/* Level Progress */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Nível {userStats.level}</h2>
            <p className="text-blue-100">Continue estudando para subir de nível!</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{userStats.experience}</p>
            <p className="text-blue-100">XP Total</p>
          </div>
        </div>
        
        <div className="mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span>Progresso para o próximo nível</span>
            <span>{userStats.experience} / {userStats.experience + userStats.experienceToNextLevel} XP</span>
          </div>
          <div className="w-full bg-blue-700 rounded-full h-3">
            <div 
              className="bg-yellow-400 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(userStats.experience / (userStats.experience + userStats.experienceToNextLevel)) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Trophy className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total de Pontos</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.totalPoints}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Sequência Atual</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.streak} dias</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Award className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Conquistas</p>
              <p className="text-2xl font-bold text-gray-900">
                {userStats.achievements.filter(a => a.completed).length} / {userStats.achievements.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Medal className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Insígnias</p>
              <p className="text-2xl font-bold text-gray-900">
                {userStats.badges.filter(b => b.unlocked).length} / {userStats.badges.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Visão Geral', icon: BarChart3 },
              { id: 'achievements', name: 'Conquistas', icon: Trophy },
              { id: 'badges', name: 'Insígnias', icon: Medal },
              { id: 'leaderboard', name: 'Ranking', icon: Users }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Achievements */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Conquistas Recentes</h3>
                  <div className="space-y-3">
                    {userStats.achievements
                      .filter(a => a.completed)
                      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
                      .slice(0, 5)
                      .map((achievement) => (
                        <div key={achievement._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className={`p-2 rounded-full ${getRarityColor(achievement.rarity)}`}>
                            {getRarityIcon(achievement.rarity)}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{achievement.name}</p>
                            <p className="text-sm text-gray-600">{achievement.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">+{achievement.points} XP</p>
                            <p className="text-xs text-gray-500">
                              {new Date(achievement.completedAt!).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Activity Stats */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas de Atividade</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">Tempo de Estudo</span>
                      </div>
                      <span className="text-lg font-bold">{Math.round(userStats.totalStudyTime / 60)}h</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-medium">Tarefas Concluídas</span>
                      </div>
                      <span className="text-lg font-bold">{userStats.totalTasksCompleted}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Target className="h-5 w-5 text-purple-600" />
                        <span className="font-medium">Simulados Realizados</span>
                      </div>
                      <span className="text-lg font-bold">{userStats.totalExamsTaken}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Zap className="h-5 w-5 text-yellow-600" />
                        <span className="font-medium">Flashcards Revisados</span>
                      </div>
                      <span className="text-lg font-bold">{userStats.totalFlashcardsReviewed}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map((achievement) => (
                  <div key={achievement._id} className={`border rounded-lg p-6 ${
                    achievement.completed ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'
                  }`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-full ${getRarityColor(achievement.rarity)}`}>
                        {getRarityIcon(achievement.rarity)}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">+{achievement.points} XP</p>
                        {achievement.completed && (
                          <p className="text-xs text-green-600">Conquistado!</p>
                        )}
                      </div>
                    </div>
                    
                    <h4 className="font-semibold text-gray-900 mb-2">{achievement.name}</h4>
                    <p className="text-sm text-gray-600 mb-4">{achievement.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progresso</span>
                        <span>{achievement.currentProgress} / {achievement.requirement}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            achievement.completed ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${getProgressPercentage(achievement.currentProgress, achievement.requirement)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {achievement.completed && achievement.completedAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        Conquistado em {new Date(achievement.completedAt).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Badges Tab */}
          {activeTab === 'badges' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {badges.map((badge) => (
                  <div key={badge._id} className={`border rounded-lg p-6 text-center ${
                    badge.unlocked ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                      badge.unlocked ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <Medal className="h-8 w-8" />
                    </div>
                    
                    <h4 className="font-semibold text-gray-900 mb-2">{badge.name}</h4>
                    <p className="text-sm text-gray-600 mb-4">{badge.description}</p>
                    
                    <div className="text-xs text-gray-500">
                      <p className="mb-2">{badge.requirement}</p>
                      {badge.unlocked && badge.unlockedAt && (
                        <p>Desbloqueado em {new Date(badge.unlockedAt).toLocaleDateString('pt-BR')}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === 'leaderboard' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Ranking Geral</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {leaderboard.map((entry, index) => (
                    <div key={entry.userId} className="px-6 py-4 flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {index === 0 && <Crown className="h-6 w-6 text-yellow-500" />}
                        {index === 1 && <Medal className="h-6 w-6 text-gray-400" />}
                        {index === 2 && <Medal className="h-6 w-6 text-yellow-600" />}
                        {index > 2 && (
                          <div className="w-6 h-6 flex items-center justify-center text-sm font-medium text-gray-500">
                            {index + 1}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{entry.userName}</p>
                        <p className="text-sm text-gray-500">Nível {entry.level}</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{entry.totalPoints} pontos</p>
                        <p className="text-sm text-gray-500">{entry.experience} XP</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Conquistas;
