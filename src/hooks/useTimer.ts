import { useState, useEffect, useCallback, useRef } from 'react';
import type { StudySession, TimerSettings } from '../types';
import { storageService } from '../services/storage';
import { generateId, playNotificationSound, sendNotification } from '../utils/helpers';

export const useTimer = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [mode, setMode] = useState<'pomodoro' | 'flowtime' | 'custom'>('pomodoro');
  const [phase, setPhase] = useState<'work' | 'break' | 'longBreak'>('work');
  const [cycles, setCycles] = useState(0);
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [settings, setSettings] = useState<TimerSettings>(storageService.getSettings().timerSettings);
  
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Initialize timer settings
  useEffect(() => {
    const appSettings = storageService.getSettings();
    setSettings(appSettings.timerSettings);
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  // Handle timer completion
  const handleTimerComplete = useCallback(() => {
    setIsRunning(false);
    
    // Play sound and show notification
    playNotificationSound();
    sendNotification(
      phase === 'work' ? 'Tempo de estudo concluído!' : 'Pausa concluída!',
      {
        body: phase === 'work' ? 'Hora de fazer uma pausa.' : 'Hora de voltar aos estudos.',
        icon: '/favicon.ico',
      }
    );

    if (phase === 'work') {
      // Check if it's time for a long break
      const shouldTakeLongBreak = cycles % settings.pomodoroCycles === 0;
      if (shouldTakeLongBreak) {
        setPhase('longBreak');
        setTimeLeft(settings.pomodoroLongBreak * 60);
      } else {
        setPhase('break');
        setTimeLeft(settings.pomodoroBreak * 60);
      }
    } else {
      // Break completed, start work phase
      setPhase('work');
      setTimeLeft(settings.pomodoroWork * 60);
      setCycles(prev => prev + 1);
    }
  }, [phase, cycles, settings]);

  // Start timer
  const startTimer = useCallback((timerMode: 'pomodoro' | 'flowtime' | 'custom', subject?: string) => {
    setMode(timerMode);
    setIsRunning(true);
    startTimeRef.current = Date.now();

    let initialTime = 0;
    if (timerMode === 'pomodoro') {
      setPhase('work');
      setCycles(0);
      initialTime = settings.pomodoroWork * 60;
    } else if (timerMode === 'custom') {
      setPhase('work');
      initialTime = settings.customWork * 60;
    } else {
      // Flowtime mode - start with 25 minutes as default
      initialTime = 25 * 60;
    }

    setTimeLeft(initialTime);

    // Create new study session
    const newSession: StudySession = {
      id: generateId(),
      mode: timerMode,
      subject,
      startTime: new Date().toISOString(),
      duration: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    setCurrentSession(newSession);
    storageService.addStudySession(newSession);
  }, [settings]);

  // Pause timer
  const pauseTimer = useCallback(() => {
    setIsRunning(false);
    
    // Update current session
    if (currentSession) {
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60);
      const updatedSession = {
        ...currentSession,
        duration,
        isActive: false,
      };
      
      setCurrentSession(updatedSession);
      storageService.updateStudySession(updatedSession);
    }
  }, [currentSession]);

  // Resume timer
  const resumeTimer = useCallback(() => {
    if (currentSession) {
      setIsRunning(true);
      startTimeRef.current = Date.now() - (currentSession.duration * 60 * 1000);
      
      const updatedSession = {
        ...currentSession,
        isActive: true,
      };
      
      setCurrentSession(updatedSession);
      storageService.updateStudySession(updatedSession);
    }
  }, [currentSession]);

  // Stop timer
  const stopTimer = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(0);
    setPhase('work');
    setCycles(0);
    
    // Update current session
    if (currentSession) {
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60);
      const updatedSession = {
        ...currentSession,
        endTime: new Date().toISOString(),
        duration,
        isActive: false,
      };
      
      setCurrentSession(updatedSession);
      storageService.updateStudySession(updatedSession);
      setCurrentSession(null);
    }
  }, [currentSession]);

  // Reset timer
  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(0);
    setPhase('work');
    setCycles(0);
    setCurrentSession(null);
  }, []);

  // Skip current phase
  const skipPhase = useCallback(() => {
    if (phase === 'work') {
      setPhase('break');
      setTimeLeft(settings.pomodoroBreak * 60);
    } else {
      setPhase('work');
      setTimeLeft(settings.pomodoroWork * 60);
      setCycles(prev => prev + 1);
    }
  }, [phase, settings]);

  // Update timer settings
  const updateTimerSettings = useCallback((newSettings: Partial<TimerSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    // Update app settings
    const appSettings = storageService.getSettings();
    appSettings.timerSettings = updatedSettings;
    storageService.saveSettings(appSettings);
  }, [settings]);

  // Get formatted time
  const getFormattedTime = useCallback(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [timeLeft]);

  // Get progress percentage
  const getProgress = useCallback(() => {
    let totalTime = 0;
    if (mode === 'pomodoro') {
      totalTime = settings.pomodoroWork * 60;
    } else if (mode === 'custom') {
      totalTime = settings.customWork * 60;
    } else {
      totalTime = 25 * 60; // Default for flowtime
    }
    
    return totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;
  }, [timeLeft, mode, settings]);

  return {
    isRunning,
    timeLeft,
    mode,
    phase,
    cycles,
    currentSession,
    settings,
    getFormattedTime,
    getProgress,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    skipPhase,
    updateTimerSettings,
  };
}; 