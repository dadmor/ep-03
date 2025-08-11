// ============================================
// src/pages/auth/login/index.tsx
// MODUŁ LOGIN Z WŁASNYM LAZY LOADING
// ============================================

import React, { lazy, Suspense } from "react";
import { Route } from "react-router-dom";

// Lazy load głównego komponentu
const LoginPage = lazy(() => import('./LoginPage'));

// Własny fallback dla modułu login
const LoginLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Ładowanie logowania...</p>
    </div>
  </div>
);

// Eksport modułu - BEZ FUNKCJI, TYLKO JSX
export const LoginModule = (
  <Route 
    path="/login" 
    element={
      <Suspense fallback={<LoginLoadingFallback />}>
        <LoginPage />
      </Suspense>
    } 
  />
);