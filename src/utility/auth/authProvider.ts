// utility/auth/authProvider.ts - MINIMALNA WERSJA

import { AuthBindings } from "@refinedev/core";
import { supabaseClient } from "..";

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
let userCache: any = null;
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
          error: new Error(error.message || "Login failed") 
        };
      }

      // Wyczyść cache po logowaniu
      userCache = null;
      lastFetch = 0;
      
      return { 
        success: true, 
        redirectTo: "/dashboard/overview" // Bezpośrednio do overview
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error("Unknown error") 
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
          error: new Error(error.message || "Logout failed") 
        };
      }
      
      return { 
        success: true, 
        redirectTo: "/login"
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error("Unknown error") 
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

  getIdentity: async () => {
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

      // Prosty obiekt użytkownika bez dodatkowych zapytań
      const simpleUser = {
        id: session.user.id,
        email: session.user.email,
        full_name: session.user.user_metadata?.full_name || 'User',
        vendor_id: 1,
        role: 'admin'
      };

      // Zapisz w cache
      userCache = simpleUser;
      lastFetch = now;

      return simpleUser;
    } catch (error) {
      console.error("Error in getIdentity:", error);
      return null;
    }
  },

  // Tymczasowo wyłączone
  getPermissions: async () => null,
  
  // Pozostałe metody - minimalne implementacje
  register: async () => ({ success: false }),
  forgotPassword: async () => ({ success: false }),
  updatePassword: async () => ({ success: false }),
  onError: async () => ({}),
};