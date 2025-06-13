
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { User, AuthMethod, AppNotification } from './types';
import { MockAuthService } from './services';
import { MOCK_USER } from './constants';

interface AppContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (method: AuthMethod, credentials?: { email?: string; password?: string }) => Promise<void>;
  logout: () => Promise<void>;
  register: (details: { email: string; password?: string, name: string }) => Promise<void>;
  notifications: AppNotification[];
  addNotification: (message: string, type: AppNotification['type']) => void;
  removeNotification: (id: string) => void;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const addNotification = useCallback((message: string, type: AppNotification['type']) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeNotification(id), 5000); // Auto-remove after 5s
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const login = useCallback(async (method: AuthMethod, credentials?: { email?: string; password?: string }) => {
    setIsLoading(true);
    try {
      let response;
      if (method === AuthMethod.EMAIL && credentials?.email && credentials?.password) {
        response = await MockAuthService.loginWithEmail(credentials.email, credentials.password);
      } else if (method === AuthMethod.WALLET) {
        response = await MockAuthService.loginWithWallet();
      } else {
        throw new Error("Invalid login method or missing credentials.");
      }

      if (response.success && response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        addNotification('Login successful!', 'success');
      } else {
        throw new Error(response.error || "Login failed.");
      }
    } catch (error: any) {
      addNotification(error.message || 'Login failed. Please try again.', 'error');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);
  
  const register = useCallback(async (details: { email: string; password?: string, name: string }) => {
    setIsLoading(true);
    try {
      const response = await MockAuthService.registerWithEmail(details.email, details.password || '', details.name);
      if (response.success && response.user) {
        setUser(response.user);
        setIsAuthenticated(true); // Auto-login after registration
        addNotification('Registration successful! You are now logged in.', 'success');
      } else {
        throw new Error(response.error || "Registration failed.");
      }
    } catch (error: any) {
      addNotification(error.message || 'Registration failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    await MockAuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
    addNotification('Logged out successfully.', 'info');
    setIsLoading(false);
  }, [addNotification]);
  
  // Simulate initial auth check (e.g. if a token was stored)
  // For this demo, let's auto-login the mock user for easier testing of other features.
  // In a real app, this would check localStorage/sessionStorage for a token.
  React.useEffect(() => {
    const autoLogin = async () => {
        setIsLoading(true);
        // setUser(MOCK_USER);
        // setIsAuthenticated(true);
        // addNotification('Welcome back, Demo User!', 'info');
        // Simulate a small delay for realism
        // await new Promise(resolve => setTimeout(resolve, 500));
        setIsLoading(false);
    };
    // autoLogin(); // Comment out if you want to start at login screen
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <AppContext.Provider value={{ isAuthenticated, user, login, logout, register, notifications, addNotification, removeNotification, isLoading }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
