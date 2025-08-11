//src/pages/auth/forgot-password/services/forgotPasswordService.ts
import { supabaseClient } from '@/utility';

const FORGOT_PASSWORD_ERRORS: Record<string, string> = {
  'User not found': 'Nie znaleziono użytkownika z tym adresem email',
  'Invalid email': 'Nieprawidłowy format adresu email',
  'over_email_send_rate_limit': 'Za szybko! Poczekaj chwilę przed kolejną próbą',
  'reset_password_rate_limit': 'Zbyt wiele prób. Spróbuj ponownie za kilka minut',
};

export const forgotPasswordService = {
  sendResetEmail: async (email: string) => {
    try {
      const { error } = await supabaseClient.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/update-password`,
        }
      );

      if (error) {
        const errorMessage = Object.entries(FORGOT_PASSWORD_ERRORS)
          .find(([key]) => error.message.includes(key))?.[1] || 
          error.message;
        
        throw new Error(errorMessage);
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Błąd podczas wysyłania emaila'
      };
    }
  }
};