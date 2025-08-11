// ============================================
// src/utility/auth/authProvider.ts
// KOMPLETNY ZOPTYMALIZOWANY AUTH PROVIDER
// ============================================

import { AuthBindings } from "@refinedev/core";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { parseSupabaseError } from "./authErrors";
import { supabaseClient } from "../supabaseClient";

// ============================================
// TYPY
// ============================================

export interface User {
  id: string;
  email: string;
  full_name: string;
  vendor_id: number;
  role: 'student' | 'teacher' | 'admin';
  is_active?: boolean;
  created_at?: string;
}

// ============================================
// CACHE UŻYTKOWNIKA
// ============================================

class UserCache {
  private cache: User | null = null;
  private lastFetch = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minut
  private fetchPromise: Promise<User | null> | null = null;

  async get(forceFetch = false): Promise<User | null> {
    const now = Date.now();
    
    // Jeśli mamy cache i nie minął czas
    if (!forceFetch && this.cache && (now - this.lastFetch) < this.CACHE_DURATION) {
      return this.cache;
    }

    // Jeśli już trwa pobieranie, czekaj na nie
    if (this.fetchPromise) {
      return this.fetchPromise;
    }

    // Rozpocznij nowe pobieranie
    this.fetchPromise = this.fetchUser();
    const user = await this.fetchPromise;
    this.fetchPromise = null;
    
    return user;
  }

  private async fetchUser(): Promise<User | null> {
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      
      if (!session?.user) {
        this.clear();
        return null;
      }

      // Pobierz dane użytkownika z tabeli users
      const { data: userData, error } = await supabaseClient
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error || !userData) {
        console.error("Error fetching user data:", error);
        // Fallback do danych z sesji
        const fallbackUser: User = {
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          vendor_id: 1,
          role: 'student'
        };
        this.set(fallbackUser);
        return fallbackUser;
      }

      const user: User = {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        vendor_id: userData.vendor_id,
        role: userData.role,
        is_active: userData.is_active,
        created_at: userData.created_at
      };

      this.set(user);
      return user;
    } catch (error) {
      console.error("Error in fetchUser:", error);
      this.clear();
      return null;
    }
  }

  set(user: User): void {
    this.cache = user;
    this.lastFetch = Date.now();
  }

  clear(): void {
    this.cache = null;
    this.lastFetch = 0;
    this.fetchPromise = null;
  }
}

// Instancja cache
const userCache = new UserCache();

// ============================================
// LISTENER DLA ZMIAN SESJI
// ============================================

supabaseClient.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
  if (event === 'SIGNED_OUT' || !session) {
    userCache.clear();
  } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    // Wymuś odświeżenie cache po zalogowaniu lub odświeżeniu tokena
    userCache.get(true);
  }
});

// ============================================
// AUTH PROVIDER
// ============================================

export const authProvider: AuthBindings = {
  // ==========================================
  // LOGIN
  // ==========================================
  login: async ({ email, password }) => {
    try {
      // Walidacja podstawowa
      if (!email || !password) {
        return {
          success: false,
          error: parseSupabaseError({
            message: "Email i hasło są wymagane",
            code: "validation_error"
          })
        };
      }

      // Próba logowania
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email.trim().toLowerCase(), // Normalizacja emaila
        password,
      });
      
      if (error) {
        return { 
          success: false, 
          error: parseSupabaseError(error)
        };
      }

      if (!data.session) {
        return {
          success: false,
          error: parseSupabaseError({
            message: "Nie udało się utworzyć sesji",
            code: "session_error"
          })
        };
      }

      // Wyczyść cache i pobierz świeże dane
      await userCache.get(true);
      
      // Pobierz rolę użytkownika do przekierowania
      const user = await userCache.get();
      const redirectTo = user?.role === 'student' 
        ? "/student/dashboard" 
        : "/dashboard/overview";
      
      return { 
        success: true, 
        redirectTo
      };
    } catch (error) {
      console.error("Login error:", error);
      return { 
        success: false, 
        error: parseSupabaseError(error)
      };
    }
  },

  // ==========================================
  // LOGOUT
  // ==========================================
  logout: async () => {
    try {
      // Wyczyść cache przed wylogowaniem
      userCache.clear();
      
      const { error } = await supabaseClient.auth.signOut();
      
      if (error) {
        return { 
          success: false, 
          error: parseSupabaseError(error)
        };
      }
      
      return { 
        success: true, 
        redirectTo: "/login"
      };
    } catch (error) {
      console.error("Logout error:", error);
      return { 
        success: false, 
        error: parseSupabaseError(error)
      };
    }
  },

  // ==========================================
  // CHECK
  // ==========================================
  check: async () => {
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      
      if (!session) {
        return { 
          authenticated: false,
          redirectTo: "/login"
        };
      }

      // Sprawdź czy token nie wygasł
      const expiresAt = session.expires_at;
      if (expiresAt && expiresAt * 1000 < Date.now()) {
        return {
          authenticated: false,
          redirectTo: "/login"
        };
      }

      return { authenticated: true };
    } catch (error) {
      console.error("Check auth error:", error);
      return { 
        authenticated: false,
        redirectTo: "/login"
      };
    }
  },

  // ==========================================
  // GET IDENTITY
  // ==========================================
  getIdentity: async (): Promise<User | null> => {
    return userCache.get();
  },

  // ==========================================
  // GET PERMISSIONS
  // ==========================================
  getPermissions: async () => {
    try {
      const user = await userCache.get();
      return user?.role || null;
    } catch (error) {
      console.error("Get permissions error:", error);
      return null;  
    }
  },

  // ==========================================
  // REGISTER
  // ==========================================
  register: async ({ email, password, name }) => {
    try {
      // Walidacja
      if (!email || !password) {
        return {
          success: false,
          error: parseSupabaseError({
            message: "Email i hasło są wymagane",
            code: "validation_error"
          })
        };
      }

      if (password.length < 6) {
        return {
          success: false,
          error: parseSupabaseError({
            message: "Password should be at least 6 characters",
            code: "weak_password"
          })
        };
      }

      if (password.length > 72) {
        return {
          success: false,
          error: parseSupabaseError({
            message: "Password cannot be longer than 72 characters",
            code: "password_too_long"
          })
        };
      }

      // Normalizacja danych
      const normalizedEmail = email.trim().toLowerCase();
      const fullName = name?.trim() || normalizedEmail.split('@')[0];

      // Rejestracja
      const { data, error } = await supabaseClient.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'student'
          },
          emailRedirectTo: `${window.location.origin}/login?verified=true`
        }
      });

      if (error) {
        return {
          success: false,
          error: parseSupabaseError(error)
        };
      }

      if (!data.user) {
        return {
          success: false,
          error: parseSupabaseError({
            message: "Rejestracja nie powiodła się",
            code: "registration_failed"
          })
        };
      }

      // Sprawdź czy email wymaga potwierdzenia
      const needsEmailConfirmation = !data.session;

      return {
        success: true,
        successNotification: needsEmailConfirmation ? {
          message: "Rejestracja udana!",
          description: "Sprawdź email aby potwierdzić konto."
        } : {
          message: "Rejestracja udana!",
          description: "Możesz się teraz zalogować."
        }
      };

    } catch (error: any) {
      console.error("Registration error:", error);
      return {
        success: false,
        error: parseSupabaseError(error)
      };
    }
  },

  // ==========================================
  // FORGOT PASSWORD
  // ==========================================
  forgotPassword: async ({ email }) => {
    try {
      if (!email) {
        return {
          success: false,
          error: parseSupabaseError({
            message: "Email jest wymagany",
            code: "validation_error"
          })
        };
      }

      const { error } = await supabaseClient.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/update-password`,
        }
      );

      if (error) {
        return {
          success: false,
          error: parseSupabaseError(error)
        };
      }

      return {
        success: true,
        successNotification: {
          message: "Email wysłany!",
          description: "Sprawdź swoją skrzynkę odbiorczą"
        }
      };
    } catch (error) {
      console.error("Forgot password error:", error);
      return {
        success: false,
        error: parseSupabaseError(error)
      };
    }
  },

  // ==========================================
  // UPDATE PASSWORD
  // ==========================================
  updatePassword: async ({ password }) => {
    try {
      if (!password || password.length < 6) {
        return {
          success: false,
          error: parseSupabaseError({
            message: "Hasło musi mieć co najmniej 6 znaków",
            code: "weak_password"
          })
        };
      }

      if (password.length > 72) {
        return {
          success: false,
          error: parseSupabaseError({
            message: "Hasło nie może być dłuższe niż 72 znaki",
            code: "password_too_long"
          })
        };
      }

      const { error } = await supabaseClient.auth.updateUser({
        password: password,
      });

      if (error) {
        return {
          success: false,
          error: parseSupabaseError(error)
        };
      }

      // Wyczyść cache po zmianie hasła
      userCache.clear();

      return {
        success: true,
        redirectTo: "/login?passwordChanged=true"
      };
    } catch (error) {
      console.error("Update password error:", error);
      return {
        success: false,
        error: parseSupabaseError(error)
      };
    }
  },

  // ==========================================
  // ON ERROR
  // ==========================================
  onError: async (error) => {
    console.error("Auth error:", error);
    
    // Jeśli błąd 401, wyczyść cache i wyloguj
    if (error?.statusCode === 401) {
      userCache.clear();
      return {
        redirectTo: "/login",
        logout: true,
        error
      };
    }

    return { error };
  },
};