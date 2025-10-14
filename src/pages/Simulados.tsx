import React, { useState, useEffect } from 'react';
import {
  Plus,
  Play,
  Clock,
  BookOpen,
  Target,
  BarChart3,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Search
} from 'lucide-react';
import simulatedExamService from '../services/simulatedExamService';
import type { SimulatedExam, ExamResult } from '../services/simulatedExamService';

const Simulados: React.FC = () => {
  const [exams, setExams] = useState<SimulatedExam[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<SimulatedExam | null>(null);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [newExam, setNewExam] = useState({
    title: '',
    description: '',
    subject: '',
    duration: 60,
    passingScore: 70
  });

  useEffect(() => {
    loadExams();
    loadResults();
  }, []);

  const loadExams = async () => {
    try {
      const data = await simulatedExamService.getExams();
      setExams(data);
    } catch (error) {
      console.error('Erro ao carregar simulados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadResults = async () => {
    try {
      const data = await simulatedExamService.getExamResults();
      setResults(data);
    } catch (error) {
      console.error('Erro ao carregar resultados:', error);
    }
  };

  const handleCreateExam = async () => {
    if (newExam.title && newExam.subject) {
      try {
        await simulatedExamService.createExam(newExam);
        setNewExam({
          title: '',
          description: '',
          subject: '',
          duration: 60,
          passingScore: 70
        });
        setShowCreateModal(false);
        loadExams();
      } catch (error) {
        console.error('Erro ao criar simulado:', error);
      }
    }
  };

  const handleStartExam = (exam: SimulatedExam) => {
    setSelectedExam(exam);
    setShowExamModal(true);
  };

  const handleDeleteExam = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este simulado?')) {
      try {
        await simulatedExamService.deleteExam(id);
        loadExams();
      } catch (error) {
        console.error('Erro ao excluir simulado:', error);
      }
    }
  };

  const getExamResult = (examId: string) => {
    return results.find(result => result.examId === examId);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 70) return <CheckCircle className="h-5 w-5 text-green-600" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  const filteredExams = exams.filter(exam => {
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'completed' && getExamResult(exam._id)) ||
      (filter === 'pending' && !getExamResult(exam._id));
    
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const subjects = ['Português', 'Matemática', 'Direito', 'História', 'Geografia', 'Atualidades'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Simulados</h1>
          <p className="text-gray-600">Pratique com simulados e acompanhe seu desempenho</p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Simulado
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{exams.length}</p>
            <p className="text-sm text-gray-600">Total de Simulados</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{results.length}</p>
            <p className="text-sm text-gray-600">Simulados Realizados</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {results.length > 0 
                ? Math.round(results.reduce((sum, result) => sum + result.score, 0) / results.length)
                : 0}%
            </p>
            <p className="text-sm text-gray-600">Média de Acertos</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {results.length > 0 
                ? Math.round(results.reduce((sum, result) => sum + result.timeSpent, 0) / 60)
                : 0}h
            </p>
            <p className="text-sm text-gray-600">Tempo Total</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar simulados..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`inline-flex items-center px-3 py-2 border text-sm leading-4 font-medium rounded-md ${
                  filter === 'all' 
                    ? 'border-blue-500 text-blue-700 bg-blue-50' 
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`inline-flex items-center px-3 py-2 border text-sm leading-4 font-medium rounded-md ${
                  filter === 'completed' 
                    ? 'border-blue-500 text-blue-700 bg-blue-50' 
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                Realizados
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`inline-flex items-center px-3 py-2 border text-sm leading-4 font-medium rounded-md ${
                  filter === 'pending' 
                    ? 'border-blue-500 text-blue-700 bg-blue-50' 
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                Pendentes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Exams List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {filter === 'all' ? 'Todos os Simulados' :
             filter === 'completed' ? 'Simulados Realizados' :
             'Simulados Pendentes'} ({filteredExams.length})
          </h3>
        </div>
        <div className="p-6">
          {filteredExams.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum simulado encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExams.map((exam) => {
                const result = getExamResult(exam._id);
                return (
                  <div key={exam._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">{exam.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{exam.subject}</p>
                        {exam.description && (
                          <p className="text-sm text-gray-500 mb-3">{exam.description}</p>
                        )}
                      </div>
                      {result && getScoreIcon(result.score)}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        {exam.duration} minutos
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Target className="h-4 w-4 mr-2" />
                        {exam.totalQuestions} questões
                      </div>
                      {result && (
                        <div className="flex items-center text-sm">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          <span className={`font-medium ${getScoreColor(result.score)}`}>
                            {result.score}% de acerto
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      {result ? (
                        <button
                          onClick={() => {/* Ver detalhes do resultado */}}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Resultado
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartExam(exam)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Iniciar
                        </button>
                      )}

                      <div className="flex items-center space-x-2">
                        <button className="text-gray-400 hover:text-blue-600">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteExam(exam._id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Exam Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Novo Simulado</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input
                  type="text"
                  value={newExam.title}
                  onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Título do simulado"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={newExam.description}
                  onChange={(e) => setNewExam({ ...newExam, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 min-h-[100px] resize-vertical"
                  placeholder="Descrição do simulado"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Disciplina *</label>
                <select
                  value={newExam.subject}
                  onChange={(e) => setNewExam({ ...newExam, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione uma disciplina</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duração (min) *</label>
                  <input
                    type="number"
                    value={newExam.duration}
                    onChange={(e) => setNewExam({ ...newExam, duration: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nota Mínima (%) *</label>
                  <input
                    type="number"
                    value={newExam.passingScore}
                    onChange={(e) => setNewExam({ ...newExam, passingScore: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateExam}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Criar Simulado
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exam Modal */}
      {showExamModal && selectedExam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{selectedExam.title}</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  Duração: {selectedExam.duration} minutos
                </div>
                <div className="flex items-center justify-center text-sm text-gray-600">
                  <Target className="h-4 w-4 mr-2" />
                  {selectedExam.totalQuestions} questões
                </div>
                <div className="flex items-center justify-center text-sm text-gray-600">
                  <BookOpen className="h-4 w-4 mr-2" />
                  {selectedExam.subject}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Instruções:</strong> Você terá {selectedExam.duration} minutos para responder todas as questões. 
                  Certifique-se de ter um ambiente tranquilo para fazer o simulado.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowExamModal(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setShowExamModal(false);
                    // Aqui você redirecionaria para a página de execução do simulado
                    // navigate(`/simulados/${selectedExam._id}/executar`);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Começar Agora
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Simulados;
