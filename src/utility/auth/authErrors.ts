// ============================================
// src/utility/auth/authErrors.ts
// CENTRALNA OBSŁUGA BŁĘDÓW DLA AUTH
// ============================================

// Refine wymaga błędu który rozszerza Error lub HttpError
export class AuthError extends Error {
    code?: string;
    statusCode?: number;
    details?: Record<string, any>;
  
    constructor(message: string, code?: string, statusCode?: number, details?: Record<string, any>) {
      super(message);
      this.name = 'AuthError';
      this.code = code;
      this.statusCode = statusCode || 400;
      this.details = details;
    }
  }
  
  // ============================================
  // MAPA BŁĘDÓW - JEDNO MIEJSCE PRAWDY
  // ============================================
  
  const ERROR_MESSAGES: Record<string, string> = {
    // Błędy rejestracji
    'user_already_exists': 'Konto z tym adresem email już istnieje.',
    'user_already_registered': 'Konto z tym adresem email już istnieje.',
    'password_too_short': 'Hasło musi mieć co najmniej 6 znaków.',
    'password_too_long': 'Hasło nie może być dłuższe niż 72 znaki.',
    'weak_password': 'Hasło musi mieć co najmniej 6 znaków.',
    'invalid_email': 'Nieprawidłowy format adresu email.',
    'over_email_send_rate_limit': 'Za szybko! Poczekaj 2 sekundy przed ponowną próbą.',
    'registration_failed': 'Rejestracja nie powiodła się.',
    
    // Błędy logowania
    'invalid_credentials': 'Nieprawidłowy email lub hasło.',
    'Invalid login credentials': 'Nieprawidłowy email lub hasło.',
    'email_not_confirmed': 'Potwierdź swój adres email przed zalogowaniem.',
    'Email not confirmed': 'Potwierdź swój adres email przed zalogowaniem.',
    'user_not_found': 'Nie znaleziono użytkownika.',
    'User not found': 'Nie znaleziono użytkownika.',
    
    // Błędy resetowania hasła
    'reset_password_rate_limit': 'Zbyt wiele prób. Spróbuj ponownie za chwilę.',
    'invalid_recovery_token': 'Link do resetowania hasła wygasł lub jest nieprawidłowy.',
    'Invalid token': 'Link do resetowania hasła wygasł lub jest nieprawidłowy.',
    
    // Błędy aktualizacji
    'update_failed': 'Aktualizacja nie powiodła się.',
    'session_expired': 'Sesja wygasła. Zaloguj się ponownie.',
    'session_not_found': 'Sesja wygasła. Zaloguj się ponownie.',
    'session_error': 'Nie udało się utworzyć sesji.',
    
    // Błędy OAuth
    'oauth_error': 'Błąd podczas logowania przez zewnętrznego dostawcę.',
    'oauth_cancelled': 'Logowanie zostało anulowane.',
    
    // Błędy walidacji
    'validation_error': 'Nieprawidłowe dane.',
    
    // Błędy sieciowe
    'network_error': 'Błąd połączenia. Sprawdź swoje połączenie internetowe.',
    'Network request failed': 'Błąd połączenia. Sprawdź swoje połączenie internetowe.',
    
    // Domyślne
    'unknown_error': 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.',
  };
  
  // ============================================
  // PARSER BŁĘDÓW SUPABASE
  // ============================================
  
  /**
   * Parsuje błąd Supabase i zwraca znormalizowany obiekt błędu
   */
  export const parseSupabaseError = (error: any): AuthError => {
    if (!error) {
      return new AuthError(ERROR_MESSAGES.unknown_error, 'unknown_error');
    }
  
    // Jeśli już jest instancją AuthError, zwróć bez zmian
    if (error instanceof AuthError) {
      return error;
    }
  
    const errorMessage = error.message || error.error_description || '';
    const errorCode = error.code || error.error || '';
    let code = 'unknown_error';
    let message = ERROR_MESSAGES.unknown_error;
    let statusCode = 400;
  
    // Sprawdź kod błędu Supabase
    if (errorCode) {
      switch (errorCode) {
        case 'user_already_exists':
        case 'user_already_registered':
          code = 'user_already_exists';
          statusCode = 409; // Conflict
          break;
          
        case 'weak_password':
          code = 'password_too_short';
          statusCode = 422; // Unprocessable Entity
          break;
          
        case 'invalid_email':
          code = 'invalid_email';
          statusCode = 422;
          break;
          
        case 'over_email_send_rate_limit':
          code = 'over_email_send_rate_limit';
          statusCode = 429; // Too Many Requests
          break;
          
        case 'invalid_credentials':
          code = 'invalid_credentials';
          statusCode = 401; // Unauthorized
          break;
          
        case 'email_not_confirmed':
          code = 'email_not_confirmed';
          statusCode = 403; // Forbidden
          break;
          
        case 'session_not_found':
          code = 'session_expired';
          statusCode = 401;
          break;
          
        case 'validation_error':
          code = 'validation_error';
          statusCode = 422;
          break;
          
        case 'password_too_long':
          code = 'password_too_long';
          statusCode = 422;
          break;
          
        case 'registration_failed':
          code = 'registration_failed';
          statusCode = 400;
          break;
          
        case 'session_error':
          code = 'session_error';
          statusCode = 500;
          break;
      }
    }
  
    // Jeśli nie znaleziono po kodzie, sprawdź po treści komunikatu
    if (code === 'unknown_error') {
      // Iteruj po wszystkich znanych komunikatach błędów
      for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
        if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
          code = key;
          message = value;
          
          // Ustaw odpowiedni status code na podstawie typu błędu
          if (key.includes('not_found')) statusCode = 404;
          else if (key.includes('credentials') || key.includes('token')) statusCode = 401;
          else if (key.includes('confirmed')) statusCode = 403;
          else if (key.includes('exists')) statusCode = 409;
          else if (key.includes('rate_limit')) statusCode = 429;
          else if (key.includes('network')) statusCode = 503;
          
          break;
        }
      }
    }
  
    // Jeśli nadal nie znaleziono, użyj oryginalnego komunikatu
    if (code === 'unknown_error' && errorMessage) {
      message = errorMessage;
    }
  
    // Pobierz komunikat z mapy lub użyj znalezionego
    if (code !== 'unknown_error') {
      message = ERROR_MESSAGES[code] || message;
    }
  
    return new AuthError(
      message, 
      code,
      statusCode,
      { 
        originalError: errorMessage,
        originalCode: errorCode,
        timestamp: new Date().toISOString()
      }
    );
  };
  
  // ============================================
  // HELPERY
  // ============================================
  
  /**
   * Pobiera komunikat błędu po kodzie
   */
  export const getErrorMessage = (code: string): string => {
    return ERROR_MESSAGES[code] || ERROR_MESSAGES.unknown_error;
  };
  
  /**
   * Sprawdza czy błąd wymaga ponownego logowania
   */
  export const isAuthenticationError = (error: AuthError | null): boolean => {
    if (!error) return false;
    
    const authErrorCodes = [
      'session_expired',
      'session_not_found',
      'invalid_credentials',
      'invalid_recovery_token'
    ];
    
    return authErrorCodes.includes(error.code || '') || error.statusCode === 401;
  };
  
  /**
   * Sprawdza czy błąd to problem z rate limiting
   */
  export const isRateLimitError = (error: AuthError | null): boolean => {
    if (!error) return false;
    
    const rateLimitCodes = [
      'over_email_send_rate_limit',
      'reset_password_rate_limit'
    ];
    
    return rateLimitCodes.includes(error.code || '') || error.statusCode === 429;
  };