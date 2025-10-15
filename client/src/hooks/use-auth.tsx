import { createContext, useContext, useEffect, useState } from "react";
import { authService, type AuthState, type LoginCredentials } from "@/lib/auth";
import type { User } from "@shared/schema";

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    // Check if user is already authenticated
    authService.getCurrentUser()
      .then(user => {
        setState({ user, isLoading: false, error: null });
      })
      .catch(error => {
        setState({ user: null, isLoading: false, error: error.message });
      });
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const user = await authService.login(credentials);
      setState({ user, isLoading: false, error: null });
    } catch (error) {
      setState({ 
        user: null, 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Erro no login" 
      });
      throw error;
    }
  };

  const logout = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      await authService.logout();
      setState({ user: null, isLoading: false, error: null });
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Erro no logout" 
      }));
    }
  };

  const isAdmin = state.user?.role === "admin";

  return (
    <AuthContext.Provider value={{ ...state, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
