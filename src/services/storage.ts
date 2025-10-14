import type { 
  Appointment, 
  Task, 
  SimulatedExam, 
  StudySession, 
  Goal, 
  Achievement, 
  UserStats, 
  BlockedSite, 
  AppSettings 
} from '../types';

class StorageService {
  private readonly STORAGE_KEYS = {
    APPOINTMENTS: 'estudaconcurso_appointments',
    TASKS: 'estudaconcurso_tasks',
    SIMULATED_EXAMS: 'estudaconcurso_simulated_exams',
    STUDY_SESSIONS: 'estudaconcurso_study_sessions',
    GOALS: 'estudaconcurso_goals',
    ACHIEVEMENTS: 'estudaconcurso_achievements',
    USER_STATS: 'estudaconcurso_user_stats',
    BLOCKED_SITES: 'estudaconcurso_blocked_sites',
    SETTINGS: 'estudaconcurso_settings',
  };

  // Generic methods
  private getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
    }
  }

  // Appointments
  getAppointments(): Appointment[] {
    return this.getItem<Appointment[]>(this.STORAGE_KEYS.APPOINTMENTS) || [];
  }

  saveAppointments(appointments: Appointment[]): void {
    this.setItem(this.STORAGE_KEYS.APPOINTMENTS, appointments);
  }

  addAppointment(appointment: Appointment): void {
    const appointments = this.getAppointments();
    appointments.push(appointment);
    this.saveAppointments(appointments);
  }

  updateAppointment(updatedAppointment: Appointment): void {
    const appointments = this.getAppointments();
    const index = appointments.findIndex(a => a.id === updatedAppointment.id);
    if (index !== -1) {
      appointments[index] = updatedAppointment;
      this.saveAppointments(appointments);
    }
  }

  deleteAppointment(id: string): void {
    const appointments = this.getAppointments();
    const filtered = appointments.filter(a => a.id !== id);
    this.saveAppointments(filtered);
  }

  // Tasks
  getTasks(): Task[] {
    return this.getItem<Task[]>(this.STORAGE_KEYS.TASKS) || [];
  }

  saveTasks(tasks: Task[]): void {
    this.setItem(this.STORAGE_KEYS.TASKS, tasks);
  }

  addTask(task: Task): void {
    const tasks = this.getTasks();
    tasks.push(task);
    this.saveTasks(tasks);
  }

  updateTask(updatedTask: Task): void {
    const tasks = this.getTasks();
    const index = tasks.findIndex(t => t.id === updatedTask.id);
    if (index !== -1) {
      tasks[index] = updatedTask;
      this.saveTasks(tasks);
    }
  }

  deleteTask(id: string): void {
    const tasks = this.getTasks();
    const filtered = tasks.filter(t => t.id !== id);
    this.saveTasks(filtered);
  }

  // Simulated Exams
  getSimulatedExams(): SimulatedExam[] {
    return this.getItem<SimulatedExam[]>(this.STORAGE_KEYS.SIMULATED_EXAMS) || [];
  }

  saveSimulatedExams(exams: SimulatedExam[]): void {
    this.setItem(this.STORAGE_KEYS.SIMULATED_EXAMS, exams);
  }

  addSimulatedExam(exam: SimulatedExam): void {
    const exams = this.getSimulatedExams();
    exams.push(exam);
    this.saveSimulatedExams(exams);
  }

  updateSimulatedExam(updatedExam: SimulatedExam): void {
    const exams = this.getSimulatedExams();
    const index = exams.findIndex(e => e.id === updatedExam.id);
    if (index !== -1) {
      exams[index] = updatedExam;
      this.saveSimulatedExams(exams);
    }
  }

  deleteSimulatedExam(id: string): void {
    const exams = this.getSimulatedExams();
    const filtered = exams.filter(e => e.id !== id);
    this.saveSimulatedExams(filtered);
  }

  // Study Sessions
  getStudySessions(): StudySession[] {
    return this.getItem<StudySession[]>(this.STORAGE_KEYS.STUDY_SESSIONS) || [];
  }

  saveStudySessions(sessions: StudySession[]): void {
    this.setItem(this.STORAGE_KEYS.STUDY_SESSIONS, sessions);
  }

  addStudySession(session: StudySession): void {
    const sessions = this.getStudySessions();
    sessions.push(session);
    this.saveStudySessions(sessions);
  }

  updateStudySession(updatedSession: StudySession): void {
    const sessions = this.getStudySessions();
    const index = sessions.findIndex(s => s.id === updatedSession.id);
    if (index !== -1) {
      sessions[index] = updatedSession;
      this.saveStudySessions(sessions);
    }
  }

  // Goals
  getGoals(): Goal[] {
    return this.getItem<Goal[]>(this.STORAGE_KEYS.GOALS) || [];
  }

  saveGoals(goals: Goal[]): void {
    this.setItem(this.STORAGE_KEYS.GOALS, goals);
  }

  addGoal(goal: Goal): void {
    const goals = this.getGoals();
    goals.push(goal);
    this.saveGoals(goals);
  }

  updateGoal(updatedGoal: Goal): void {
    const goals = this.getGoals();
    const index = goals.findIndex(g => g.id === updatedGoal.id);
    if (index !== -1) {
      goals[index] = updatedGoal;
      this.saveGoals(goals);
    }
  }

  deleteGoal(id: string): void {
    const goals = this.getGoals();
    const filtered = goals.filter(g => g.id !== id);
    this.saveGoals(filtered);
  }

  // Achievements
  getAchievements(): Achievement[] {
    return this.getItem<Achievement[]>(this.STORAGE_KEYS.ACHIEVEMENTS) || [];
  }

  saveAchievements(achievements: Achievement[]): void {
    this.setItem(this.STORAGE_KEYS.ACHIEVEMENTS, achievements);
  }

  unlockAchievement(achievementId: string): void {
    const achievements = this.getAchievements();
    const achievement = achievements.find(a => a.id === achievementId);
    if (achievement && !achievement.isUnlocked) {
      achievement.isUnlocked = true;
      achievement.unlockedAt = new Date().toISOString();
      this.saveAchievements(achievements);
    }
  }

  // User Stats
  getUserStats(): UserStats {
    const defaultStats: UserStats = {
      totalStudyTime: 0,
      totalSessions: 0,
      totalTasksCompleted: 0,
      totalExamsTaken: 0,
      averageScore: 0,
      currentStreak: 0,
      level: 1,
      experience: 0,
      experienceToNextLevel: 100,
    };
    
    return this.getItem<UserStats>(this.STORAGE_KEYS.USER_STATS) || defaultStats;
  }

  saveUserStats(stats: UserStats): void {
    this.setItem(this.STORAGE_KEYS.USER_STATS, stats);
  }

  updateUserStats(updates: Partial<UserStats>): void {
    const stats = this.getUserStats();
    const updatedStats = { ...stats, ...updates };
    this.saveUserStats(updatedStats);
  }

  // Blocked Sites
  getBlockedSites(): BlockedSite[] {
    return this.getItem<BlockedSite[]>(this.STORAGE_KEYS.BLOCKED_SITES) || [];
  }

  saveBlockedSites(sites: BlockedSite[]): void {
    this.setItem(this.STORAGE_KEYS.BLOCKED_SITES, sites);
  }

  addBlockedSite(site: BlockedSite): void {
    const sites = this.getBlockedSites();
    sites.push(site);
    this.saveBlockedSites(sites);
  }

  updateBlockedSite(updatedSite: BlockedSite): void {
    const sites = this.getBlockedSites();
    const index = sites.findIndex(s => s.id === updatedSite.id);
    if (index !== -1) {
      sites[index] = updatedSite;
      this.saveBlockedSites(sites);
    }
  }

  deleteBlockedSite(id: string): void {
    const sites = this.getBlockedSites();
    const filtered = sites.filter(s => s.id !== id);
    this.saveBlockedSites(filtered);
  }

  // Settings
  getSettings(): AppSettings {
    const defaultSettings: AppSettings = {
      notifications: true,
      soundEnabled: true,
      theme: 'light',
      timerSettings: {
        pomodoroWork: 25,
        pomodoroBreak: 5,
        pomodoroLongBreak: 15,
        pomodoroCycles: 4,
        customWork: 45,
        customBreak: 10,
      },
    };
    
    return this.getItem<AppSettings>(this.STORAGE_KEYS.SETTINGS) || defaultSettings;
  }

  saveSettings(settings: AppSettings): void {
    this.setItem(this.STORAGE_KEYS.SETTINGS, settings);
  }

  updateSettings(updates: Partial<AppSettings>): void {
    const settings = this.getSettings();
    const updatedSettings = { ...settings, ...updates };
    this.saveSettings(updatedSettings);
  }

  // Clear all data (for testing or reset)
  clearAllData(): void {
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

export const storageService = new StorageService(); 