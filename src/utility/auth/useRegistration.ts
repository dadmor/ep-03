// utility/auth/useRegistration.ts
import React from "react";
import { useNavigate } from "react-router-dom";
import { useFormSchemaStore } from "@/utility/llmFormWizard";
import { authProvider } from "./authProvider";

interface UseRegistrationResult {
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
  register: () => void;
  goBack: () => void;
  processData: any;
}

export const useRegistration = (): UseRegistrationResult => {
  const navigate = useNavigate();
  const { getData, setData } = useFormSchemaStore();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const processData = getData("registration");

  const register = React.useCallback(async () => {
    if (!authProvider.register) {
      setError("Funkcja rejestracji nie jest dostępna");
      return;
    }

    // Sprawdź czy mamy wszystkie wymagane dane
    if (!processData?.email || !processData?.password) {
      setError("Brak wymaganych danych. Rozpocznij proces rejestracji od początku.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("📝 Attempting registration with:", {
        email: processData.email,
        name: processData.name
      });

      const result = await authProvider.register({
        email: processData.email,
        password: processData.password,
        name: processData.name
      });

      console.log("📝 Registration result:", result);

      if (result.success) {
        setIsSuccess(true);
        
        // Zapisz dane o udanej rejestracji
        setData("registration", {
          ...processData,
          registrationComplete: true,
          registrationDate: new Date().toISOString(),
          user: result.user
        });

        // Przekieruj po 1.5 sekundy
        setTimeout(() => {
          navigate("/register/step4");
        }, 1500);
      } else {
        // Ustaw komunikat błędu
        const errorMessage = result.error?.message || "Rejestracja nie powiodła się";
        console.error("❌ Registration failed:", errorMessage);
        setError(errorMessage);
      }
    } catch (err: any) {
      console.error("❌ Registration error:", err);
      const errorMessage = err?.message || "Wystąpił nieoczekiwany błąd";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [processData, setData, navigate]);

  const goBack = React.useCallback(() => {
    navigate("/register/step2");
  }, [navigate]);

  return {
    isLoading,
    isSuccess,
    error,
    register,
    goBack,
    processData,
  };
};