import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/user';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (credentials: { email: string; password: string }) => Promise<void>;
  signOut: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load user from storage on app start
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user') as string | null;
        if (storedUser) {
          setUser(JSON.parse(storedUser) as User);
        }
      } catch (err) {
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const signIn = async (credentials: { email: string; password: string }) => {
    // Implement authentication logic
    try {
      // TODO: Implement actual authentication
      const mockUser: User = {
        id: '123',
        email: credentials.email,
        role: UserRole.RESTAURANT_OWNER,
        name: 'Test Restaurant',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUser(mockUser);
      await AsyncStorage.setItem('user', JSON.stringify(mockUser) as string);
    } catch (err) {
      setError('Authentication failed');
    }
  };

  const signOut = async () => {
    setUser(null);
    await AsyncStorage.removeItem('user');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
      AsyncStorage.setItem('user', JSON.stringify({ ...user, ...userData }) as string);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
