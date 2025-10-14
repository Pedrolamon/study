import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  SkipForward, 
  Settings,
  Timer as TimerIcon
} from 'lucide-react';
import { useTimer } from '../hooks/useTimer';

const Timer: React.FC = () => {
  const timer = useTimer();
  const [showSettings, setShowSettings] = useState(false);
  const [subject, setSubject] = useState('');

  const timerModes = [
    {
      id: 'pomodoro',
      name: 'Pomodoro',
      description: '25min estudo, 5min pausa',
      color: 'blue'
    },
    {
      id: 'flowtime',
      name: 'Flowtime',
      description: 'Estudo contínuo sem pausas',
      color: 'green'
    },
    {
      id: 'custom',
      name: 'Personalizado',
      description: 'Configure seus próprios intervalos',
      color: 'purple'
    }
  ];

  const getPhaseColor = () => {
    if (timer.phase === 'work') return 'text-blue-600';
    if (timer.phase === 'break') return 'text-green-600';
    if (timer.phase === 'longBreak') return 'text-purple-600';
    return 'text-gray-600';
  };

  const getPhaseName = () => {
    if (timer.phase === 'work') return 'Estudo';
    if (timer.phase === 'break') return 'Pausa Curta';
    if (timer.phase === 'longBreak') return 'Pausa Longa';
    return 'Aguardando';
  };

  const handleStartTimer = (mode: 'pomodoro' | 'flowtime' | 'custom') => {
    timer.startTimer(mode, subject);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Timer de Estudo</h1>
          <p className="text-gray-600">Gerencie seu tempo de estudo de forma eficiente</p>
        </div>
        
        <button
          onClick={() => setShowSettings(true)}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Settings className="h-4 w-4 mr-2" />
          Configurações
        </button>
      </div>

      {/* Timer Modes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {timerModes.map((mode) => (
          <div
            key={mode.id}
            className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all hover:shadow-lg ${
              timer.mode === mode.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => handleStartTimer(mode.id as 'pomodoro' | 'flowtime' | 'custom')}
          >
            <div className="text-center">
              <TimerIcon className={`h-8 w-8 mx-auto mb-3 text-${mode.color}-600`} />
              <h3 className="text-lg font-semibold text-gray-900">{mode.name}</h3>
              <p className="text-sm text-gray-600 mt-2">{mode.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Timer Display */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="text-center">
            {/* Phase Info */}
            <div className="mb-6">
              <h2 className={`text-2xl font-bold ${getPhaseColor()}`}>
                {getPhaseName()}
              </h2>
                             <p className="text-gray-600 mt-2">
                 Ciclo {timer.cycles + 1} de {timer.settings.pomodoroCycles}
               </p>
            </div>

            {/* Timer */}
            <div className="mb-8">
              <div className="text-8xl font-bold text-gray-900 mb-4">
                {timer.getFormattedTime()}
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${timer.getProgress()}%` }}
                />
              </div>
              
              <p className="text-sm text-gray-500">
                {Math.round(timer.timeLeft / 60)} minutos restantes
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              {timer.isRunning ? (
                <>
                  <button
                    onClick={timer.pauseTimer}
                    className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Pause className="h-6 w-6 mr-2" />
                    Pausar
                  </button>
                  <button
                    onClick={timer.stopTimer}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <Square className="h-6 w-6 mr-2" />
                    Parar
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => timer.resumeTimer()}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Play className="h-6 w-6 mr-2" />
                    Continuar
                  </button>
                  <button
                    onClick={timer.resetTimer}
                    className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <RotateCcw className="h-6 w-6 mr-2" />
                    Reiniciar
                  </button>
                </>
              )}
            </div>

            {/* Skip Phase */}
            <button
              onClick={timer.skipPhase}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-600 bg-transparent hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <SkipForward className="h-4 w-4 mr-2" />
              Pular Fase
            </button>
          </div>
        </div>
      </div>

      {/* Subject Input */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Disciplina (Opcional)</h3>
        </div>
        <div className="p-6">
          <input
            type="text"
            placeholder="Ex: Português, Direito Administrativo..."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Configurações do Timer</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Pomodoro Settings */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Pomodoro</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tempo de Estudo (min)</label>
                                          <input
                        type="number"
                        value={timer.settings.pomodoroWork}
                        onChange={(e) => timer.updateTimerSettings({ pomodoroWork: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pausa Curta (min)</label>
                      <input
                        type="number"
                        value={timer.settings.pomodoroBreak}
                        onChange={(e) => timer.updateTimerSettings({ pomodoroBreak: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pausa Longa (min)</label>
                      <input
                        type="number"
                        value={timer.settings.pomodoroLongBreak}
                        onChange={(e) => timer.updateTimerSettings({ pomodoroLongBreak: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ciclos até Pausa Longa</label>
                      <input
                        type="number"
                        value={timer.settings.pomodoroCycles}
                        onChange={(e) => timer.updateTimerSettings({ pomodoroCycles: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                  </div>
                </div>
              </div>

              {/* Custom Settings */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Personalizado</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tempo de Trabalho (min)</label>
                                          <input
                        type="number"
                        value={timer.settings.customWork}
                        onChange={(e) => timer.updateTimerSettings({ customWork: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tempo de Pausa (min)</label>
                      <input
                        type="number"
                        value={timer.settings.customBreak}
                        onChange={(e) => timer.updateTimerSettings({ customBreak: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Current Session Info */}
      {timer.currentSession && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Sessão Atual</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-500">Modo</p>
                <p className="font-semibold text-gray-900 capitalize">{timer.currentSession.mode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Disciplina</p>
                <p className="font-semibold text-gray-900">{timer.currentSession.subject || 'Não especificada'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Início</p>
                <p className="font-semibold text-gray-900">
                  {timer.currentSession.startTime ? new Date(timer.currentSession.startTime).toLocaleTimeString() : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Duração</p>
                <p className="font-semibold text-gray-900">
                  {timer.currentSession.duration ? `${Math.round(timer.currentSession.duration / 60)}min` : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timer; 