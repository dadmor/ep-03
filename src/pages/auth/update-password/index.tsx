// ============================================
// src/pages/auth/update-password/index.tsx
// KOMPLETNY MODUŁ AKTUALIZACJI HASŁA - MIKROSERWIS
// ============================================

import React from "react";
import { Route } from "react-router-dom";
import { useSessionValidation } from "./hooks/useSessionValidation";
import { useUpdatePasswordLogic } from "./hooks/useUpdatePasswordLogic";
import { UpdatePasswordLayout } from "./components/UpdatePasswordLayout";
import { SessionValidator } from "./components/SessionValidator";
import { UpdateSuccess } from "./components/UpdateSuccess";
import { UpdatePasswordForm } from "./components/UpdatePasswordForm";

// Główny komponent strony
const UpdatePasswordPage: React.FC = () => {
  const sessionValidation = useSessionValidation();
  const updateLogic = useUpdatePasswordLogic();

  // Sprawdzanie sesji
  if (sessionValidation.isChecking) {
    return (
      <UpdatePasswordLayout>
        <SessionValidator isChecking={true} />
      </UpdatePasswordLayout>
    );
  }

  // Błędna sesja
  if (!sessionValidation.isValid) {
    return (
      <UpdatePasswordLayout>
        <SessionValidator 
          isChecking={false} 
          isValid={false} 
          error={sessionValidation.error}
        />
      </UpdatePasswordLayout>
    );
  }

  // Sukces aktualizacji
  if (updateLogic.isSuccess) {
    return (
      <UpdatePasswordLayout>
        <UpdateSuccess />
      </UpdatePasswordLayout>
    );
  }

  // Formularz aktualizacji
  return (
    <UpdatePasswordLayout>
      <UpdatePasswordForm {...updateLogic} />
    </UpdatePasswordLayout>
  );
};

// Eksport modułu z routingiem
export const UpdatePasswordModule = () => (
  <Route path="/update-password" element={<UpdatePasswordPage />} />
);
