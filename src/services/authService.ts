import api from './api';

export interface User {
  _id: string;
  name: string;
  email: string;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  createdAt: string;
  updatedAt: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post('/api/auth/login', data);
    const { user, token } = response.data;
    
    // Salvar no localStorage
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { user, token };
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post('/api/auth/register', data);
    const { user, token } = response.data;
    
    // Salvar no localStorage
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { user, token };
  }

  async getProfile(): Promise<User> {
    const response = await api.get('/api/auth/profile');
    return response.data;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put('/api/auth/profile', data);
    const updatedUser = response.data;
    
    // Atualizar no localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    return updatedUser;
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export default new AuthService(); 