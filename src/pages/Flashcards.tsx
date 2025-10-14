import React, { useState, useEffect } from 'react';
import {
  Plus,
  RotateCcw,
  Check,
  X,
  Eye,
  Edit,
  Trash2,
  Search,
  BookOpen,
  Target,
  Clock,
  BarChart3
} from 'lucide-react';
import flashcardService, { type Flashcard } from '../services/flashcardService';

const Flashcards: React.FC = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCard, setCurrentCard] = useState<Flashcard | null>(null);
  const [showFront, setShowFront] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'due' | 'new'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [newFlashcard, setNewFlashcard] = useState({
    front: '',
    back: '',
    subject: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard'
  });

  useEffect(() => {
    loadFlashcards();
  }, []);

  const loadFlashcards = async () => {
    try {
      const data = await flashcardService.getFlashcards();
      setFlashcards(data);
    } catch (error) {
      console.error('Erro ao carregar flashcards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFlashcard = async () => {
    if (newFlashcard.front && newFlashcard.back && newFlashcard.subject) {
      try {
        await flashcardService.createFlashcard(newFlashcard);
        setNewFlashcard({
          front: '',
          back: '',
          subject: '',
          difficulty: 'medium'
        });
        setShowCreateModal(false);
        loadFlashcards();
      } catch (error) {
        console.error('Erro ao criar flashcard:', error);
      }
    }
  };

  const handleStartReview = () => {
    const dueCards = flashcards.filter(card => {
      if (!card.nextReview) return true; // Novos cards
      return new Date(card.nextReview) <= new Date();
    });

    if (dueCards.length > 0) {
      setCurrentCard(dueCards[0]);
      setShowFront(true);
      setShowReviewModal(true);
    }
  };

  const handleReview = async (isCorrect: boolean) => {
    if (!currentCard) return;

    try {
      await flashcardService.reviewFlashcard(currentCard._id!, isCorrect);
      
      // Encontrar próximo card para revisão
      const dueCards = flashcards.filter(card => {
        if (!card.nextReview) return true;
        return new Date(card.nextReview) <= new Date();
      });

      const currentIndex = dueCards.findIndex(card => card._id === currentCard._id);
      const nextCard = dueCards[currentIndex + 1];

      if (nextCard) {
        setCurrentCard(nextCard);
        setShowFront(true);
      } else {
        setShowReviewModal(false);
        setCurrentCard(null);
        loadFlashcards(); // Recarregar para atualizar estatísticas
      }
    } catch (error) {
      console.error('Erro ao revisar flashcard:', error);
    }
  };

  const handleDeleteFlashcard = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este flashcard?')) {
      try {
        await flashcardService.deleteFlashcard(id);
        loadFlashcards();
      } catch (error) {
        console.error('Erro ao excluir flashcard:', error);
      }
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Médio';
      case 'hard': return 'Difícil';
      default: return difficulty;
    }
  };

  const getAccuracy = (card: Flashcard) => {
    if (card.reviewCount === 0) return 0;
    return Math.round((card.correctCount / card.reviewCount) * 100);
  };

  const filteredFlashcards = flashcards.filter(card => {
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'due' && card.nextReview && new Date(card.nextReview) <= new Date()) ||
      (filter === 'new' && !card.nextReview);
    
    const matchesSearch = card.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.back.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const dueCards = flashcards.filter(card => {
    if (!card.nextReview) return true;
    return new Date(card.nextReview) <= new Date();
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
          <h1 className="text-3xl font-bold text-gray-900">Flashcards</h1>
          <p className="text-gray-600">Sistema de revisão espaçada para memorização</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleStartReview}
            disabled={dueCards.length === 0}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Revisar ({dueCards.length})
          </button>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Flashcard
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{flashcards.length}</p>
            <p className="text-sm text-gray-600">Total de Cards</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{dueCards.length}</p>
            <p className="text-sm text-gray-600">Para Revisar</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {flashcards.length > 0 
                ? Math.round(flashcards.reduce((sum, card) => sum + getAccuracy(card), 0) / flashcards.length)
                : 0}%
            </p>
            <p className="text-sm text-gray-600">Precisão Média</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {flashcards.reduce((sum, card) => sum + card.reviewCount, 0)}
            </p>
            <p className="text-sm text-gray-600">Revisões Totais</p>
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
                  placeholder="Buscar flashcards..."
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
                onClick={() => setFilter('due')}
                className={`inline-flex items-center px-3 py-2 border text-sm leading-4 font-medium rounded-md ${
                  filter === 'due' 
                    ? 'border-blue-500 text-blue-700 bg-blue-50' 
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                Para Revisar
              </button>
              <button
                onClick={() => setFilter('new')}
                className={`inline-flex items-center px-3 py-2 border text-sm leading-4 font-medium rounded-md ${
                  filter === 'new' 
                    ? 'border-blue-500 text-blue-700 bg-blue-50' 
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                Novos
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Flashcards List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {filter === 'all' ? 'Todos os Flashcards' :
             filter === 'due' ? 'Para Revisar' :
             'Novos Flashcards'} ({filteredFlashcards.length})
          </h3>
        </div>
        <div className="p-6">
          {filteredFlashcards.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum flashcard encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFlashcards.map((card) => (
                <div key={card._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {card.front}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">{card.subject}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(card.difficulty)}`}>
                      {getDifficultyText(card.difficulty)}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Target className="h-4 w-4 mr-2" />
                      {card.reviewCount} revisões
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      {getAccuracy(card)}% de acerto
                    </div>
                    {card.nextReview && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        Próxima revisão: {new Date(card.nextReview).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => {
                        setCurrentCard(card);
                        setShowFront(true);
                        setShowReviewModal(true);
                      }}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Revisar
                    </button>

                    <div className="flex items-center space-x-2">
                      <button className="text-gray-400 hover:text-blue-600">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteFlashcard(card._id!)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Flashcard Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Novo Flashcard</h3>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Frente *</label>
                <textarea
                  value={newFlashcard.front}
                  onChange={(e) => setNewFlashcard({ ...newFlashcard, front: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 min-h-[100px] resize-vertical"
                  placeholder="Pergunta ou conceito"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Verso *</label>
                <textarea
                  value={newFlashcard.back}
                  onChange={(e) => setNewFlashcard({ ...newFlashcard, back: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 min-h-[100px] resize-vertical"
                  placeholder="Resposta ou explicação"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Disciplina *</label>
                <select
                  value={newFlashcard.subject}
                  onChange={(e) => setNewFlashcard({ ...newFlashcard, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione uma disciplina</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dificuldade</label>
                <select
                  value={newFlashcard.difficulty}
                  onChange={(e) => setNewFlashcard({ ...newFlashcard, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="easy">Fácil</option>
                  <option value="medium">Médio</option>
                  <option value="hard">Difícil</option>
                </select>
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
                onClick={handleCreateFlashcard}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Criar Flashcard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && currentCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="text-center">
              <div className="mb-6">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(currentCard.difficulty)}`}>
                  {getDifficultyText(currentCard.difficulty)}
                </span>
                <span className="ml-3 text-sm text-gray-500">{currentCard.subject}</span>
              </div>

              <div className="bg-gray-50 rounded-lg p-8 mb-6 min-h-[200px] flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {showFront ? 'Frente' : 'Verso'}
                  </h3>
                  <p className="text-lg text-gray-700 whitespace-pre-wrap">
                    {showFront ? currentCard.front : currentCard.back}
                  </p>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                {showFront ? (
                  <button
                    onClick={() => setShowFront(false)}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Eye className="h-5 w-5 mr-2" />
                    Ver Resposta
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleReview(false)}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <X className="h-5 w-5 mr-2" />
                      Errei
                    </button>
                    <button
                      onClick={() => handleReview(true)}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <Check className="h-5 w-5 mr-2" />
                      Acertei
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={() => setShowReviewModal(false)}
                className="mt-4 text-sm text-gray-500 hover:text-gray-700"
              >
                Sair da Revisão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Flashcards;
