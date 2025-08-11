// ============================================
// src/pages/auth/login/hooks/useLoginLogic.ts
// ============================================

import React from "react";
import { useLogin } from "@refinedev/core";
import type { LoginCredentials } from "../types";
import { parseLoginError } from "../utils/loginErrors";


export const useLoginLogic = () => {
  const { mutate: loginMutation, isLoading } = useLogin<LoginCredentials>();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = React.useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      setError("Wypełnij wszystkie pola");
      return;
    }

    setError(null);

    loginMutation(
      { email: email.trim(), password },
      {
        onSuccess: () => {
          // Refine automatycznie przekieruje
        },
        onError: (error: any) => {
          setError(parseLoginError(error));
        },
      }
    );
  }, [email, password, loginMutation]);

  return {
    email,
    password,
    setEmail,
    setPassword,
    isLoading,
    error,
    handleSubmit,
    isFormValid: email.trim().length > 0 && password.length > 0
  };
};