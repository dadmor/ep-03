// utility/auth/useLoginForm.ts
import React from "react";
import { useLogin } from "@refinedev/core";

interface LoginVariables {
  email: string;
  password: string;
}

interface UseLoginFormResult {
  email: string;
  password: string;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  isLoading: boolean;
  error: string | null;
  login: () => void;
  handleSubmit: (e: React.FormEvent) => void;
}

export const useLoginForm = (): UseLoginFormResult => {
  const { mutate: loginMutation, isLoading } = useLogin<LoginVariables>();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  // Funkcja logowania
  const login = React.useCallback(() => {
    console.log("🚀 Login attempt:", { email });

    if (!email.trim() || !password.trim()) {
      setError("Wypełnij wszystkie pola");
      return;
    }

    setError(null);

    loginMutation(
      { email: email.trim(), password },
      {
        onSuccess: (data) => {
          console.log("✅ Login success:", data);
          // Refine powinien automatycznie przekierować
        },
        onError: (error: any) => {
          console.error("❌ Login error:", error);
          
          // Parsuj błąd
          let errorMessage = "Błąd logowania";
          
          if (error?.message) {
            if (error.message.includes("Invalid login credentials")) {
              errorMessage = "Nieprawidłowe dane logowania";
            } else if (error.message.includes("Email not confirmed")) {
              errorMessage = "Potwierdź email przed zalogowaniem";
            } else {
              errorMessage = error.message;
            }
          }
          
          setError(errorMessage);
        },
      }
    );
  }, [email, password, loginMutation]);

  // Handler dla formularza
  const handleSubmit = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      login();
    },
    [login]
  );

  return {
    email,
    password,
    setEmail,
    setPassword,
    isLoading,
    error,
    login,
    handleSubmit,
  };
};