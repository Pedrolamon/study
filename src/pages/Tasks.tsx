import React, { useState } from 'react';
import {
  Plus,
  Search,
  Calendar,
  CheckCircle,
  Circle,
  Trash2,
  Target,
  AlertCircle
} from 'lucide-react';
import { useTasks } from '../hooks/useTasks';

const Tasks: React.FC = () => {
  const tasks = useTasks();
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: ''
  });

  const handleAddTask = () => {
    if (newTask.title.trim()) {
      tasks.addTask({
        ...newTask,
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        completed: false
      });
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: ''
      });
      setShowModal(false);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      tasks.deleteTask(taskId);
    }
  };

  const filteredTasks = tasks.tasks.filter(task => {
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'pending' && !task.completed) ||
      (filter === 'completed' && task.completed) ||
      (filter === 'overdue' && !task.completed && task.dueDate && new Date(task.dueDate) < new Date());
    
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tarefas</h1>
          <p className="text-gray-600">Gerencie suas tarefas e atividades diárias</p>
        </div>
        
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Tarefa
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{tasks.tasks.length}</p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{tasks.getPendingTasks().length}</p>
            <p className="text-sm text-gray-600">Pendentes</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{tasks.getCompletedTasks().length}</p>
            <p className="text-sm text-gray-600">Concluídas</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{tasks.getOverdueTasks().length}</p>
            <p className="text-sm text-gray-600">Atrasadas</p>
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
                  placeholder="Buscar tarefas..."
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
                Todas
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
              <button
                onClick={() => setFilter('completed')}
                className={`inline-flex items-center px-3 py-2 border text-sm leading-4 font-medium rounded-md ${
                  filter === 'completed' 
                    ? 'border-blue-500 text-blue-700 bg-blue-50' 
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                Concluídas
              </button>
              <button
                onClick={() => setFilter('overdue')}
                className={`inline-flex items-center px-3 py-2 border text-sm leading-4 font-medium rounded-md ${
                  filter === 'overdue' 
                    ? 'border-blue-500 text-blue-700 bg-blue-50' 
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                Atrasadas
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {filter === 'all' ? 'Todas as Tarefas' :
             filter === 'pending' ? 'Tarefas Pendentes' :
             filter === 'completed' ? 'Tarefas Concluídas' :
             'Tarefas Atrasadas'} ({filteredTasks.length})
          </h3>
        </div>
        <div className="p-6">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma tarefa encontrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    task.completed 
                      ? 'bg-gray-50 border-gray-200' 
                      : isOverdue(task.dueDate || '')
                      ? 'bg-red-50 border-red-200'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <button
                      onClick={() => tasks.toggleTaskCompletion(task.id)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {task.completed ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>
                    
                    <div className="flex-1">
                      <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className={`text-sm ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-2 mt-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className={`text-xs ${
                          isOverdue(task.dueDate || '') && !task.completed
                            ? 'text-red-600 font-medium'
                            : 'text-gray-500'
                        }`}>
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString('pt-BR') : 'Sem prazo'}
                        </span>
                        {isOverdue(task.dueDate || '') && !task.completed && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Atrasada
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {getPriorityText(task.priority)}
                    </span>
                    
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Nova Tarefa</h3>
              <button
                onClick={() => setShowModal(false)}
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
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Digite o título da tarefa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 min-h-[100px] resize-vertical"
                  placeholder="Digite a descrição da tarefa (opcional)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Vencimento</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddTask}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Adicionar Tarefa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
