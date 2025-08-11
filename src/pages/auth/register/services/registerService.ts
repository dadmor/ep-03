//src/pages/auth/register/services/registerService.ts
import { supabaseClient } from '@/utility';

const REGISTER_ERRORS: Record<string, string> = {
  'user_already_exists': 'Konto z tym adresem email już istnieje',
  'User already registered': 'Konto z tym adresem email już istnieje',
  'already exists': 'Konto z tym adresem email już istnieje',
  'weak_password': 'Hasło musi mieć co najmniej 6 znaków',
  'Password should be at least': 'Hasło musi mieć co najmniej 6 znaków',
  'Password cannot be longer than 72': 'Hasło nie może być dłuższe niż 72 znaki',
  'invalid_email': 'Nieprawidłowy format adresu email',
  'Invalid email': 'Nieprawidłowy format adresu email',
  'over_email_send_rate_limit': 'Za szybko! Poczekaj 2 sekundy przed ponowną próbą',
};

export const registerService = {
  register: async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: name.trim(),
            role: 'student'
          },
          emailRedirectTo: `${window.location.origin}/login?verified=true`
        }
      });

      if (error) {
        const errorMessage = Object.entries(REGISTER_ERRORS)
          .find(([key]) => error.message.includes(key))?.[1] || 
          error.message;
        
        throw new Error(errorMessage);
      }

      if (!data.user) {
        throw new Error('Rejestracja nie powiodła się');
      }

      return { 
        success: true,
        needsEmailConfirmation: !data.session
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
};