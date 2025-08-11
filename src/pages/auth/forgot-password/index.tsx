// ============================================
// src/pages/auth/forgot-password/index.tsx
// KOMPLETNY MODUŁ RESETOWANIA HASŁA - MIKROSERWIS
// ============================================

import React from 'react';
import { Route } from 'react-router-dom';
import { useForgotPasswordLogic } from './hooks/useForgotPasswordLogic';
import { ForgotPasswordLayout } from './components/ForgotPasswordLayout';
import { EmailSentSuccess } from './components/EmailSentSuccess';
import { ForgotPasswordForm } from './components/ForgotPasswordForm';

// Główny komponent strony
const ForgotPasswordPage: React.FC = () => {
  const logic = useForgotPasswordLogic();

  if (logic.isSuccess) {
    return (
      <ForgotPasswordLayout>
        <EmailSentSuccess email={logic.email} />
      </ForgotPasswordLayout>
    );
  }

  return (
    <ForgotPasswordLayout>
      <ForgotPasswordForm {...logic} />
    </ForgotPasswordLayout>
  );
};

// Eksport modułu z routingiem
export const ForgotPasswordModule = () => (
  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
);