import { apiRequest } from "./queryClient";
import type { User } from "@shared/schema";

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  nip: string;
  password: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export class AuthService {
  async login(credentials: LoginCredentials): Promise<User> {
    const response = await apiRequest("POST", "/api/auth/login", credentials);
    const data = await response.json();
    return data.user;
  }

  async logout(): Promise<void> {
    await apiRequest("POST", "/api/auth/logout");
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiRequest("GET", "/api/auth/me");
      const data = await response.json();
      return data.user;
    } catch (error) {
      // If 401, user is not authenticated
      if (error instanceof Error && error.message.includes("401")) {
        return null;
      }
      throw error;
    }
  }

  async changePassword(payload: ChangePasswordPayload): Promise<string> {
    const response = await apiRequest("POST", "/api/auth/change-password", payload);
    const data = await response.json();
    return data.message ?? "Senha atualizada com sucesso";
  }
}

export const authService = new AuthService();
