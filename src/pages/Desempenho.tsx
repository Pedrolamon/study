import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Target, 
  Award,
  Download,
  Filter
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface StudyData {
  date: string;
  studyTime: number;
  tasksCompleted: number;
  sessions: number;
}

interface SubjectData {
  name: string;
  time: number;
  color: string;
}

const Desempenho: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [studyData, setStudyData] = useState<StudyData[]>([]);
  const [subjectData, setSubjectData] = useState<SubjectData[]>([]);

  // Dados simulados para demonstração
  useEffect(() => {
    const generateMockData = () => {
      const data: StudyData[] = [];
      const subjects: SubjectData[] = [
        { name: 'Português', time: 45, color: '#3B82F6' },
        { name: 'Matemática', time: 30, color: '#EF4444' },
        { name: 'Direito', time: 25, color: '#10B981' },
        { name: 'História', time: 20, color: '#F59E0B' },
        { name: 'Geografia', time: 15, color: '#8B5CF6' }
      ];

      const days = selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 365;
      const today = new Date();

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        data.push({
          date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          studyTime: Math.floor(Math.random() * 8) + 1, // 1-8 horas
          tasksCompleted: Math.floor(Math.random() * 10) + 1, // 1-10 tarefas
          sessions: Math.floor(Math.random() * 5) + 1 // 1-5 sessões
        });
      }

      setStudyData(data);
      setSubjectData(subjects);
    };

    generateMockData();
  }, [selectedPeriod]);

  const totalStudyTime = studyData.reduce((sum, day) => sum + day.studyTime, 0);
  const totalTasks = studyData.reduce((sum, day) => sum + day.tasksCompleted, 0);
  const totalSessions = studyData.reduce((sum, day) => sum + day.sessions, 0);
  const averageStudyTime = totalStudyTime / studyData.length;

  const getProgressColor = (value: number, max: number) => {
    const percentage = (value / max) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const exportJSON = () => {
    const payload = {
      period: selectedPeriod,
      totals: { totalStudyTime, totalTasks, totalSessions, averageStudyTime },
      studyData,
      subjectData,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `desempenho-${selectedPeriod}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const header = 'data,horas,tarefas,sessoes\n';
    const rows = studyData.map(d => `${d.date},${d.studyTime},${d.tasksCompleted},${d.sessions}`).join('\n');
    const csv = header + rows;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `desempenho-${selectedPeriod}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Desempenho</h1>
          <p className="text-gray-600 dark:text-gray-300">Acompanhe seu progresso e estatísticas de estudo</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month' | 'year')}
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="week">Última semana</option>
              <option value="month">Último mês</option>
              <option value="year">Último ano</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <button onClick={exportCSV} className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </button>
            <button onClick={exportJSON} className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Download className="h-4 w-4 mr-2" />
              Exportar JSON
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tempo Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalStudyTime}h</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Média: {averageStudyTime.toFixed(1)}h/dia
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Target className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tarefas Concluídas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalTasks}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {((totalTasks / (studyData.length * 5)) * 100).toFixed(0)}% da meta
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sessões de Estudo</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalSessions}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Média: {(totalSessions / studyData.length).toFixed(1)}/dia
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Eficiência</p>
              <p className={`text-2xl font-bold ${getProgressColor(totalTasks, studyData.length * 10)}`}>
                {((totalTasks / (studyData.length * 10)) * 100).toFixed(0)}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Baseado em metas diárias
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Study Time Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Tempo de Estudo Diário</h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={studyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="studyTime" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Horas"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tasks Completed Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Tarefas Concluídas</h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={studyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tasksCompleted" fill="#10B981" name="Tarefas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Subject Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Distribuição por Disciplina</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={subjectData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="time"
                >
                  {subjectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Detalhes por Disciplina</h4>
              {subjectData.map((subject, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: subject.color }}
                    />
                    <span className="font-medium text-gray-900 dark:text-gray-100">{subject.name}</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">{subject.time}h</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Goals */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Metas Semanais</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tempo de Estudo</span>
                <span className="text-sm text-gray-600 dark:text-gray-300">35h / 40h</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '87.5%' }}></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">87.5% concluído</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tarefas</span>
                <span className="text-sm text-gray-600 dark:text-gray-300">42 / 50</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '84%' }}></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">84% concluído</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sessões</span>
                <span className="text-sm text-gray-600 dark:text-gray-300">28 / 35</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '80%' }}></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">80% concluído</p>
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Insights e Recomendações</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Progresso Positivo</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Seu tempo de estudo aumentou 15% em relação à semana passada. Continue assim!
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Target className="h-5 w-5 text-blue-600 mt-0.5" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Foco em Matemática</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Você dedicou apenas 20% do tempo a Matemática. Considere aumentar para 30%.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Calendar className="h-5 w-5 text-yellow-600 mt-0.5" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Consistência</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Você estudou 6 dos 7 dias da semana. Excelente consistência!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Desempenho;
