// ============================================
// src/pages/auth/login/index.tsx
// KOMPLETNY MODUŁ LOGOWANIA - MIKROSERWIS
// ============================================

import React from "react";
import { Route } from "react-router-dom";
import { useLogin, useIsAuthenticated, useGetIdentity } from "@refinedev/core";
import { Link, useSearchParams, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle, Info, Mail, Lock, CheckCircle } from "lucide-react";
import { LoginUser } from "./types";
import { useLoginLogic } from "./hooks/useLoginLogic";
import { LoginForm } from "./components/LoginForm";
import { LoginLayout } from "./components/LoginLayout";


// Główny komponent strony logowania
const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { data: isAuthenticated, isLoading: authLoading } = useIsAuthenticated();
  const { data: user, isLoading: userLoading } = useGetIdentity<LoginUser>();
  const loginLogic = useLoginLogic();

  const verified = searchParams.get("verified") === "true";
  const passwordChanged = searchParams.get("passwordChanged") === "true";

  // Loader podczas sprawdzania autentykacji
  if (authLoading || userLoading) {
    return (
      <LoginLayout>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      </LoginLayout>
    );
  }

  // Przekierowanie jeśli zalogowany
  if (isAuthenticated && user) {
    const redirectPath = user.role ? `/${user.role}` : "/profiles";
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <LoginLayout>
      <LoginForm 
        {...loginLogic}
        showVerifiedMessage={verified}
        showPasswordChangedMessage={passwordChanged}
      />
    </LoginLayout>
  );
};

// Eksport modułu z routingiem
export const LoginModule = () => (
  <Route path="/login" element={<LoginPage />} />
);
