// ============================================
// src/pages/auth/forgot-password/hooks/useForgotPasswordLogic.ts
// ============================================

import React from 'react';
import { useForgotPassword } from '@refinedev/core';
import type { ForgotPasswordLogic } from '../types';
import { validateForgotPasswordEmail } from '../utils/forgotPasswordValidation';
import { parseForgotPasswordError } from '../utils/forgotPasswordErrors';


export const useForgotPasswordLogic = (): ForgotPasswordLogic => {
  const { mutate: forgotPassword, isLoading } = useForgotPassword();
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Walidacja
    const validationError = validateForgotPasswordEmail(email);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    forgotPassword(
      { email: email.trim() },
      {
        onSuccess: () => {
          setIsSuccess(true);
        },
        onError: (error: any) => {
          setError(parseForgotPasswordError(error));
        }
      }
    );
  };

  return {
    email,
    setEmail,
    isLoading,
    error,
    isSuccess,
    handleSubmit
  };
};
