// ============================================
// src/pages/auth/update-password/hooks/useUpdatePasswordLogic.ts
// ============================================

import React from "react";
import { useUpdatePassword } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import type { UpdatePasswordLogic } from "../types";
import { parseUpdatePasswordError } from "../utils/updatePasswordErrors";
import { validateUpdatePassword } from "../utils/updatePasswordValidation";

export const useUpdatePasswordLogic = (): UpdatePasswordLogic => {
  const navigate = useNavigate();
  const { mutate: updatePassword, isLoading } = useUpdatePassword();
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Walidacja
    const validationError = validateUpdatePassword(password, confirmPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Aktualizuj hasło
    updatePassword(
      { password },
      {
        onSuccess: () => {
          setIsSuccess(true);
          setTimeout(() => navigate("/login?passwordChanged=true"), 3000);
        },
        onError: (error: any) => {
          setError(parseUpdatePasswordError(error));
        },
      }
    );
  };

  return {
    password,
    confirmPassword,
    setPassword,
    setConfirmPassword,
    isLoading,
    error,
    isSuccess,
    handleSubmit,
  };
};
