// utility/auth/authProvider.ts

import { AuthBindings } from "@refinedev/core";
import { supabaseClient } from "..";
import { parseSupabaseError, getErrorMessage, AuthError } from "./authErrors";

// Typ użytkownika z tabeli public.users
export interface User {
  id: string;
  email: string;
  full_name: string;
  vendor_id: number;
  role: 'student' | 'teacher' | 'admin';
  is_active: boolean;
  created_at: string;
}

export const authProvider: AuthBindings = {
  login: async ({ email, password, providerName }) => {
    try {
      // OAuth login
      if (providerName) {
        const { data, error } = await supabaseClient.auth.signInWithOAuth({
          provider: providerName,
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          }
        });
        
        if (error) {
          return { success: false, error: parseSupabaseError(error) };
        }
        
        return { success: true, redirectTo: data?.url };
      }

      // Email/password login
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Login error:", error);
        
        // Specjalna obsługa dla niepotwierdzonych emaili
        if (error.message?.includes("Email not confirmed")) {
          return { 
            success: false, 
            error: new AuthError(
              "Konto nie zostało potwierdzone. Sprawdź swoją skrzynkę email i kliknij link aktywacyjny.",
              "email_not_confirmed",
              403
            )
          };
        }
        
        return { success: false, error: parseSupabaseError(error) };
      }

      // Pobierz użytkownika z public.users
      const { data: userData, error: userError } = await supabaseClient
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userError) {
        console.error("Error fetching user data:", userError);
        // Użytkownik zalogowany ale brak w public.users - może być problem z triggerem
        return { 
          success: false, 
          error: new AuthError(
            "Konto wymaga dokończenia konfiguracji. Skontaktuj się z administratorem.",
            "user_setup_incomplete",
            500
          )
        };
      }

      // Określ ścieżkę przekierowania na podstawie roli
      let redirectTo = "/";
      switch (userData?.role) {
        case 'admin':
          redirectTo = "/admin";
          break;
        case 'teacher':
          redirectTo = "/teacher";
          break;
        case 'student':
          redirectTo = "/student";
          break;
        default:
          redirectTo = "/dashboard";
      }

      return { 
        success: true, 
        redirectTo 
      };
    } catch (error) {
      console.error("Login exception:", error);
      return { success: false, error: parseSupabaseError(error) };
    }
  },

  register: async ({ email, password, name }) => {
    try {
      console.log("Starting registration for:", email);

      // Walidacja danych
      if (!email || !password || !name) {
        return {
          success: false,
          error: new AuthError(
            "Wszystkie pola są wymagane",
            "validation_error",
            400
          ),
        };
      }

      // Walidacja hasła
      if (password.length < 6) {
        return {
          success: false,
          error: new AuthError(
            getErrorMessage('password_too_short'),
            "password_too_short",
            422
          ),
        };
      }

      if (password.length > 72) {
        return {
          success: false,
          error: new AuthError(
            getErrorMessage('password_too_long'),
            "password_too_long",
            422
          ),
        };
      }

      // Rejestracja w Supabase Auth
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: { 
          data: { 
            full_name: name,
            name: name, // dla kompatybilności
            role: 'student', // domyślna rola
            vendor_id: 1 // domyślny vendor
          },
          emailRedirectTo: `${window.location.origin}/login?verified=true`
        },
      });

      if (error) {
        console.error("Supabase signUp error:", error);
        return { success: false, error: parseSupabaseError(error) };
      }
      
      if (!data?.user) {
        return {
          success: false,
          error: new AuthError(
            getErrorMessage('registration_failed'),
            "registration_failed",
            400
          ),
        };
      }

      // Sprawdź czy to nowy użytkownik (Supabase zwraca null dla istniejących)
      const isNewUser = data.user.identities && data.user.identities.length > 0;
      
      if (!isNewUser) {
        return {
          success: false,
          error: new AuthError(
            getErrorMessage('user_already_exists'),
            "user_already_exists",
            409
          ),
        };
      }

      console.log("Registration successful for:", email);

      // Opcjonalnie: Możesz od razu utworzyć rekord w public.users
      // jeśli trigger nie zadziała automatycznie
      if (data.session) {
        try {
          const { error: insertError } = await supabaseClient
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email!,
              full_name: name,
              vendor_id: 1,
              role: 'student'
            });

          if (insertError) {
            console.error("Error creating user record:", insertError);
            // Nie przerywaj rejestracji - trigger może to obsłużyć
          }

          // Utwórz też user_stats
          await supabaseClient
            .from('user_stats')
            .insert({
              user_id: data.user.id
            });
        } catch (err) {
          console.error("Error in post-registration setup:", err);
          // Nie przerywaj - trigger powinien to obsłużyć
        }
      }

      return { 
        success: true, 
        user: data.user, 
        session: data.session 
      };
    } catch (error) {
      console.error("Registration exception:", error);
      return { success: false, error: parseSupabaseError(error) };
    }
  },

  forgotPassword: async ({ email }) => {
    try {
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      
      if (error) {
        return { success: false, error: parseSupabaseError(error) };
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: parseSupabaseError(error) };
    }
  },

  updatePassword: async ({ password }) => {
    try {
      // Walidacja hasła
      if (!password || password.length < 6) {
        return {
          success: false,
          error: new AuthError(
            getErrorMessage('password_too_short'),
            "password_too_short",
            422
          ),
        };
      }

      if (password.length > 72) {
        return {
          success: false,
          error: new AuthError(
            getErrorMessage('password_too_long'),
            "password_too_long",
            422
          ),
        };
      }

      const { error } = await supabaseClient.auth.updateUser({ password });
      
      if (error) {
        return { success: false, error: parseSupabaseError(error) };
      }
      
      return { success: true, redirectTo: "/login?passwordChanged=true" };
    } catch (error) {
      return { success: false, error: parseSupabaseError(error) };
    }
  },

  logout: async () => {
    try {
      const { error } = await supabaseClient.auth.signOut();
      
      if (error) {
        return { success: false, error: parseSupabaseError(error) };
      }
      
      return { 
        success: true, 
        redirectTo: "/login"
      };
    } catch (error) {
      return { success: false, error: parseSupabaseError(error) };
    }
  },

  onError: async (error) => {
    console.error("Auth error:", error);
    
    // Sprawdź czy to błąd autoryzacji
    if (error?.statusCode === 401 || error?.code === "PGRST301") {
      return { 
        error: new AuthError(
          "Sesja wygasła. Zaloguj się ponownie.",
          "session_expired",
          401
        ),
        logout: true,
        redirectTo: "/login"
      };
    }
    
    return { error: parseSupabaseError(error) };
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

      // Opcjonalnie: Sprawdź czy użytkownik istnieje w public.users
      const { data: userData, error: userError } = await supabaseClient
        .from('users')
        .select('id, is_active')
        .eq('id', data.session.user.id)
        .single();

      if (userError || !userData) {
        console.error("User not found in public.users:", userError);
        return { 
          authenticated: false,
          error: new AuthError(
            "Konto wymaga konfiguracji",
            "setup_required",
            403
          ),
          redirectTo: "/setup-required"
        };
      }

      if (!userData.is_active) {
        return { 
          authenticated: false,
          error: new AuthError(
            "Konto zostało dezaktywowane",
            "account_disabled",
            403
          ),
          redirectTo: "/account-disabled"
        };
      }

      return { authenticated: true };
    } catch (error) {
      console.error("Check error:", error);
      return { 
        authenticated: false, 
        error: parseSupabaseError(error),
        redirectTo: "/login"
      };
    }
  },

  getPermissions: async () => {
    try {
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
      
      if (authError || !user) {
        console.error("Error getting auth user:", authError);
        return null;
      }
      
      // Pobierz rolę z tabeli public.users
      const { data: userData, error: userError } = await supabaseClient
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
        
      if (userError) {
        console.error("Error getting user role:", userError);
        return null;
      }
      
      return userData?.role || null;
    } catch (error) {
      console.error("Error in getPermissions:", error);
      return null;
    }
  },

  getIdentity: async () => {
    try {
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
      
      if (authError || !user) {
        console.error("Error getting auth user:", authError);
        return null;
      }
      
      // Pobierz pełne dane użytkownika z public.users
      const { data: userData, error: userError } = await supabaseClient
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (userError) {
        console.error("Error getting user data:", userError);
        
        // Jeśli użytkownik nie istnieje w public.users, zwróć podstawowe dane
        return {
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email!.split('@')[0],
          role: 'student' as const,
          vendor_id: 1,
          is_active: true,
          created_at: user.created_at,
          _timestamp: Date.now()
        };
      }
      
      // Dodaj timestamp żeby React Query wiedział że to nowe dane
      return {
        ...userData,
        _timestamp: Date.now()
      } as User & { _timestamp: number };
    } catch (error) {
      console.error("Error in getIdentity:", error);
      return null;
    }
  },
};