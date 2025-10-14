import React, { createContext, useContext, useState, useEffect } from 'react';
import type {ReactNode} from "react"
import authService from '../services/authService';
import type { User } from '../services/authService';


interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = authService.getCurrentUser();
          if (currentUser) {
            // Verificar se o token ainda é válido
            const updatedUser = await authService.getProfile();
            setUser(updatedUser);
          }
        }
      } catch (error) {
        // Token inválido, fazer logout
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const { user } = await authService.login({ email, password });
    setUser(user);
  };

  const register = async (name: string, email: string, password: string, confirmPassword: string) => {
    const { user } = await authService.register({ name, email, password, confirmPassword });
    setUser(user);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUser = async (data: Partial<User>) => {
    const updatedUser = await authService.updateProfile(data);
    setUser(updatedUser);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 