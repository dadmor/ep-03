// src/pages/auth/login/services/loginService.ts

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

// Funkcja pomocnicza do parsowania błędów
const parseLoginError = (error: any): string => {
  if (!error) return 'Nieznany błąd';
  
  // Sprawdź dokładne dopasowanie po code
  if (error.code && LOGIN_ERRORS[error.code]) {
    return LOGIN_ERRORS[error.code];
  }
  
  // Sprawdź czy message zawiera znany błąd
  if (error.message) {
    for (const [key, value] of Object.entries(LOGIN_ERRORS)) {
      if (error.message.includes(key)) {
        return value;
      }
    }
  }
  
  // Zwróć oryginalny message lub domyślny
  return error.message || 'Błąd logowania';
};

export const loginService = {
  login: async (email: string, password: string) => {
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      
      if (error) {
        console.log('Login error:', error);
        throw new Error(parseLoginError(error));
      }

      if (!data.session) {
        throw new Error('Nie udało się utworzyć sesji');
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

  checkAuth: async () => {
    const { data: { session } } = await supabaseClient.auth.getSession();
    return !!session;
  }
};