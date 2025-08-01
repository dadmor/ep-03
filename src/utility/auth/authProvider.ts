// utility/auth/authProvider.ts - POPRAWIONA WERSJA

import { AuthBindings } from "@refinedev/core";
import { supabaseClient } from "..";
import { parseSupabaseError } from "./authErrors";

// Export typu User
export interface User {
  id: string;
  email: string;
  full_name: string;
  vendor_id: number;
  role: 'student' | 'teacher' | 'admin';
  is_active?: boolean;
  created_at?: string;
}

// Cache dla danych użytkownika
let userCache: User | null = null;
let lastFetch = 0;
const CACHE_DURATION = 60000; // 60 sekund

export const authProvider: AuthBindings = {
  login: async ({ email, password }) => {
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        return { 
          success: false, 
          error: parseSupabaseError(error)
        };
      }

      // Wyczyść cache po logowaniu
      userCache = null;
      lastFetch = 0;
      
      return { 
        success: true, 
        redirectTo: "/dashboard/overview"
      };
    } catch (error) {
      return { 
        success: false, 
        error: parseSupabaseError(error)
      };
    }
  },

  logout: async () => {
    try {
      const { error } = await supabaseClient.auth.signOut();
      
      // Wyczyść cache
      userCache = null;
      lastFetch = 0;
      
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
      return { 
        success: false, 
        error: parseSupabaseError(error)
      };
    }
  },

  check: async () => {
    try {
      const { data } = await supabaseClient.auth.getSession();
      
      if (!data?.session) {
        return { 
          authenticated: false,
          redirectTo: "/login"
        };
      }

      return { authenticated: true };
    } catch (error) {
      return { 
        authenticated: false,
        redirectTo: "/login"
      };
    }
  },

  getIdentity: async (): Promise<User | null> => {
    try {
      // Używaj cache aby uniknąć ciągłych zapytań
      const now = Date.now();
      if (userCache && (now - lastFetch) < CACHE_DURATION) {
        return userCache;
      }

      const { data: { session } } = await supabaseClient.auth.getSession();
      
      if (!session) {
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
        // Fallback jeśli nie udało się pobrać danych
        return {
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || 'User',
          vendor_id: 1,
          role: 'student' // Domyślnie student, nie admin
        };
      }

      // Użyj danych z bazy
      const user: User = {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        vendor_id: userData.vendor_id,
        role: userData.role,
        is_active: userData.is_active,
        created_at: userData.created_at
      };

      // Zapisz w cache
      userCache = user;
      lastFetch = now;

      return user;
    } catch (error) {
      console.error("Error in getIdentity:", error);
      return null;
    }
  },

  register: async ({ email, password, name }) => {
    try {
      console.log("🚀 Starting registration:", { email, name });

      // Walidacja danych wejściowych
      if (!email || !password) {
        return {
          success: false,
          error: parseSupabaseError({
            message: "Email i hasło są wymagane",
            code: "validation_error"
          })
        };
      }

      // Walidacja hasła
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

      // Rejestracja użytkownika w Supabase
      const { data, error } = await supabaseClient.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name || email.split('@')[0],
            role: 'student' // Domyślnie rejestrujemy jako student
          },
          emailRedirectTo: `${window.location.origin}/login?verified=true`
        }
      });

      if (error) {
        console.error("❌ Registration error:", error);
        return {
          success: false,
          error: parseSupabaseError(error)
        };
      }

      if (!data.user) {
        return {
          success: false,
          error: parseSupabaseError({
            message: "Rejestracja nie powiodła się - brak danych użytkownika",
            code: "registration_failed"
          })
        };
      }

      console.log("✅ Registration successful:", data.user.id);

      return {
        success: true,
        successNotification: {
          message: "Rejestracja udana! Sprawdź swoją skrzynkę email.",
          description: "Wysłaliśmy link aktywacyjny na podany adres email."
        }
      };

    } catch (error: any) {
      console.error("❌ Unexpected registration error:", error);
      return {
        success: false,
        error: parseSupabaseError(error)
      };
    }
  },

  forgotPassword: async ({ email }) => {
    try {
      const { error } = await supabaseClient.auth.resetPasswordForEmail(
        email,
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
      return {
        success: false,
        error: parseSupabaseError(error)
      };
    }
  },

  updatePassword: async ({ password }) => {
    try {
      const { error } = await supabaseClient.auth.updateUser({
        password: password,
      });

      if (error) {
        return {
          success: false,
          error: parseSupabaseError(error)
        };
      }

      return {
        success: true,
        redirectTo: "/login?passwordChanged=true"
      };
    } catch (error) {
      return {
        success: false,
        error: parseSupabaseError(error)
      };
    }
  },

  getPermissions: async () => {
    try {
      // Użyj tej samej logiki co w getIdentity
      const now = Date.now();
      if (userCache && (now - lastFetch) < CACHE_DURATION) {
        return userCache.role;
      }

      const { data: { session } } = await supabaseClient.auth.getSession();
      
      if (!session) {
        return null;
      }

      // Pobierz rolę z bazy danych
      const { data: userData, error } = await supabaseClient
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (error || !userData) {
        console.error("Error fetching user permissions:", error);
        return 'student'; // Domyślnie student
      }

      return userData.role;
    } catch {
      return null;  
    }
  },

  onError: async (error) => {
    console.error("Auth error:", error);
    
    if (error?.statusCode === 401) {
      return {
        redirectTo: "/login",
        logout: true,
        error
      };
    }

    return { error };
  },
};