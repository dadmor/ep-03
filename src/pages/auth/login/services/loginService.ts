// ============================================
// src/pages/auth/login/services/loginService.ts
// KOMPLETNY SERWIS LOGIN Z WŁASNĄ OBSŁUGĄ BŁĘDÓW
// ============================================

import { supabaseClient } from '@/utility';

// Lokalne błędy tylko dla login
const LOGIN_ERRORS: Record<string, string> = {
  'invalid_credentials': 'Nieprawidłowy email lub hasło.',
  'Invalid login credentials': 'Nieprawidłowy email lub hasło.',
  'email_not_confirmed': 'Email nie został potwierdzony.',
  'Email not confirmed': 'Email nie został potwierdzony.',
  'user_not_found': 'Nie znaleziono użytkownika.',
  'User not found': 'Nie znaleziono użytkownika.',
  'network_error': 'Błąd połączenia z serwerem.',
  'Too many requests': 'Zbyt wiele prób. Spróbuj ponownie za chwilę.',
};

// Parser błędów dla modułu login
const parseLoginError = (error: any) => {
  if (!error) {
    return {
      message: 'Nieznany błąd',
      name: 'UnknownError',
      statusCode: 500
    };
  }
  
  const errorMessage = error.message || error.error_description || '';
  
  // Sprawdź znane błędy
  for (const [key, value] of Object.entries(LOGIN_ERRORS)) {
    if (errorMessage.includes(key)) {
      return {
        message: value,
        name: 'LoginError',
        statusCode: error.code === 'invalid_credentials' ? 401 : 400
      };
    }
  }
  
  return {
    message: errorMessage || 'Błąd logowania',
    name: 'LoginError',
    statusCode: 400
  };
};

export const loginService = {
  // Wersja dla komponentów (zwraca prosty obiekt)
  login: async (email: string, password: string) => {
    try {
      // Walidacja
      if (!email || !password) {
        return {
          success: false,
          error: "Email i hasło są wymagane"
        };
      }

      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      
      if (error) {
        console.log('Login error:', error);
        const parsed = parseLoginError(error);
        return {
          success: false,
          error: parsed.message
        };
      }

      if (!data.session) {
        return {
          success: false,
          error: 'Nie udało się utworzyć sesji'
        };
      }

      // Pobierz dane użytkownika
      const { data: userData } = await supabaseClient
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single();

      return {
        success: true,
        redirectTo: userData?.role ? `/${userData.role}` : '/profiles'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Nieznany błąd'
      };
    }
  },

  // Wersja dla Refine (zwraca format zgodny z AuthBindings)
  loginForRefine: async (email: string, password: string) => {
    const result = await loginService.login(email, password);
    
    if (!result.success) {
      return {
        success: false,
        error: {
          message: result.error,
          name: 'LoginError',
          statusCode: 400
        }
      };
    }
    
    return result;
  },

  checkAuth: async () => {
    const { data: { session } } = await supabaseClient.auth.getSession();
    return !!session;
  }
};