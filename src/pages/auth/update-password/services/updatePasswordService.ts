// src/pages/auth/update-password/services/updatePasswordService.ts
import { supabaseClient } from '@/utility';

const UPDATE_PASSWORD_ERRORS: Record<string, string> = {
  'New password should be different': 'Nowe hasło musi być inne niż obecne',
  'Password should be at least': 'Hasło musi mieć co najmniej 6 znaków',
  'Invalid token': 'Link wygasł lub jest nieprawidłowy',
  'session_not_found': 'Sesja wygasła. Spróbuj ponownie',
};

export const updatePasswordService = {
  checkSession: async () => {
    try {
      const { data } = await supabaseClient.auth.getSession();
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const type = hashParams.get("type");

      if (!data.session && type !== "recovery") {
        return {
          isValid: false,
          error: "Link wygasł lub jest nieprawidłowy"
        };
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: "Błąd weryfikacji sesji"
      };
    }
  },

  updatePassword: async (password: string) => {
    try {
      const { error } = await supabaseClient.auth.updateUser({
        password: password,
      });

      if (error) {
        const errorMessage = Object.entries(UPDATE_PASSWORD_ERRORS)
          .find(([key]) => error.message.includes(key))?.[1] || 
          error.message;
        
        throw new Error(errorMessage);
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Błąd aktualizacji hasła'
      };
    }
  }
};