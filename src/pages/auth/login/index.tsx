// ============================================
// src/pages/auth/login/index.tsx
// MODUŁ LOGOWANIA - wszystko w jednym miejscu
// ============================================

import React from "react";
import { useLogin, useIsAuthenticated, useGetIdentity } from "@refinedev/core";
import { Link, useSearchParams, Navigate, Route } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle, Info, Mail, Lock, CheckCircle } from "lucide-react";
import { NarrowCol } from "@/components/layout/NarrowCol";
import { Form, FormActions, FormControl } from "@/components/form";

// ===== TYPY MODUŁU =====
interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'teacher' | 'admin';
  vendor_id?: number;
}

interface LoginCredentials {
  email: string;
  password: string;
}

// ===== HOOK MODUŁU =====
const useLoginModule = () => {
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
          let errorMessage = "Błąd logowania";
          
          if (error?.message) {
            if (error.message.includes("Invalid login credentials")) {
              errorMessage = "Nieprawidłowe dane logowania";
            } else if (error.message.includes("Email not confirmed")) {
              errorMessage = "Email nie został potwierdzony";
            } else {
              errorMessage = error.message;
            }
          }
          
          setError(errorMessage);
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

// ===== KOMPONENTY POMOCNICZE MODUŁU =====
const SuccessMessage: React.FC<{ title: string; message: string }> = ({ title, message }) => (
  <Alert className="mb-4 border-green-200 bg-green-50">
    <CheckCircle className="h-4 w-4 text-green-600" />
    <AlertDescription className="text-green-800">
      <strong>{title}</strong> {message}
    </AlertDescription>
  </Alert>
);

const ErrorMessage: React.FC<{ error: string }> = ({ error }) => {
  const getErrorVariant = () => {
    if (error.includes("nie został potwierdzony")) {
      return "warning";
    }
    return "destructive";
  };

  const getErrorIcon = () => {
    if (error.includes("nie został potwierdzony")) {
      return Info;
    }
    return AlertTriangle;
  };

  return (
    <Alert variant={getErrorVariant() as any}>
      {React.createElement(getErrorIcon(), { className: "h-4 w-4" })}
      <AlertDescription>
        <strong>Błąd logowania:</strong> {error}
        
        {error.includes("nie został potwierdzony") && (
          <div className="mt-2 text-sm">
            <p>💡 <strong>Co robić:</strong></p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Sprawdź swoją skrzynkę email (także spam)</li>
              <li>Kliknij link aktywacyjny w emailu</li>
              <li>
                Jeśli nie otrzymałeś emaila, możesz{" "}
                <Link to="/resend-confirmation" className="underline">
                  wysłać ponownie
                </Link>
              </li>
            </ul>
          </div>
        )}
        
        {error.includes("Nieprawidłowe dane") && (
          <div className="mt-2 text-sm">
            <p>💡 <strong>Sprawdź:</strong></p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Czy email jest wpisany poprawnie</li>
              <li>Czy hasło jest poprawne (uwaga na wielkość liter)</li>
              <li>Czy masz już założone konto</li>
            </ul>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

// ===== GŁÓWNY KOMPONENT =====
export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { data: isAuthenticated, isLoading: authLoading } = useIsAuthenticated();
  const { data: user, isLoading: userLoading } = useGetIdentity<User>();
  const {
    email,
    password,
    setEmail,
    setPassword,
    isLoading,
    error,
    handleSubmit,
    isFormValid
  } = useLoginModule();

  const verified = searchParams.get("verified") === "true";
  const passwordChanged = searchParams.get("passwordChanged") === "true";

  // Loader podczas sprawdzania autentykacji
  if (authLoading || userLoading) {
    return (
      <NarrowCol>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      </NarrowCol>
    );
  }

  // Przekierowanie jeśli zalogowany
  if (isAuthenticated && user) {
    const redirectPath = user.role ? `/${user.role}` : "/profiles";
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <NarrowCol>
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Zaloguj się</CardTitle>
          <CardDescription className="text-center">
            Wprowadź swoje dane aby się zalogować
          </CardDescription>
        </CardHeader>

        <CardContent>
          {verified && (
            <SuccessMessage 
              title="Email potwierdzony!" 
              message="Możesz się teraz zalogować." 
            />
          )}

          {passwordChanged && (
            <SuccessMessage 
              title="Hasło zmienione!" 
              message="Możesz się zalogować używając nowego hasła." 
            />
          )}

          <Form onSubmit={handleSubmit}>
            <FormControl
              label={
                <span className="flex items-center">
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </span>
              }
              htmlFor="email"
              error={error?.toLowerCase().includes("email") ? "Sprawdź poprawność adresu email" : undefined}
              required
            >
              <Input
                id="email"
                type="email"
                placeholder="przykład@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className={error?.toLowerCase().includes("email") ? "border-red-500" : ""}
              />
            </FormControl>

            <FormControl
              label={
                <span className="flex items-center">
                  <Lock className="mr-2 h-4 w-4" />
                  Hasło
                </span>
              }
              htmlFor="password"
              error={error?.toLowerCase().includes("hasło") ? "Sprawdź poprawność hasła" : undefined}
              required
            >
              <Input
                id="password"
                type="password"
                placeholder="Wprowadź hasło"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className={error?.toLowerCase().includes("hasło") ? "border-red-500" : ""}
              />
            </FormControl>

            {error && <ErrorMessage error={error} />}

            <FormActions className="!border-0 !pt-0 justify-center">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !isFormValid}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Logowanie..." : "Zaloguj się"}
              </Button>
            </FormActions>
          </Form>

          <div className="mt-6 space-y-3">
            <div className="text-center text-sm">
              <Link
                to="/register/step1"
                className="text-blue-600 hover:text-blue-500 transition-colors"
              >
                Nie masz konta? Zarejestruj się
              </Link>
            </div>

            <div className="text-center text-sm">
              <Link
                to="/forgot-password"
                className="text-blue-600 hover:text-blue-500 transition-colors"
              >
                Zapomniałeś hasła?
              </Link>
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="text-center text-xs text-gray-500">
                <p>Problemy z logowaniem?</p>
                <Link
                  to="/contact"
                  className="text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Skontaktuj się z pomocą techniczną
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </NarrowCol>
  );
};

// ===== EKSPORT ROUTE =====
export const loginRoute = <Route path="/login" element={<LoginPage />} />;