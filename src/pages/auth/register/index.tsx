// ============================================
// src/pages/auth/register/index.tsx
// MODUŁ REJESTRACJI - wszystkie kroki w jednym module
// ============================================

import React from "react";
import { Route, Routes, useNavigate, Navigate } from "react-router-dom";
import { useRegister } from "@refinedev/core";
import { NarrowCol } from "@/components/layout/NarrowCol";
import { Lead } from "@/components/reader";
import { SchemaForm } from "@/components/SchemaForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  UserPlus, KeyRound, UserCheck, CheckCircle, 
  ArrowLeft, Loader2, Check, Mail, User, 
  AlertTriangle, Clock, RefreshCw, ArrowRight 
} from "lucide-react";

// ===== STORE MODUŁU =====
interface RegistrationData {
  email?: string;
  name?: string;
  password?: string;
  confirmPassword?: string;
  registrationComplete?: boolean;
}

interface RegistrationStore {
  data: RegistrationData;
  currentStep: number;
  setData: (data: Partial<RegistrationData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

const useRegistrationStore = (): RegistrationStore => {
  const [data, setDataState] = React.useState<RegistrationData>({});
  const [currentStep, setCurrentStep] = React.useState(1);

  return {
    data,
    currentStep,
    setData: (newData) => setDataState(prev => ({ ...prev, ...newData })),
    nextStep: () => setCurrentStep(prev => Math.min(prev + 1, 4)),
    prevStep: () => setCurrentStep(prev => Math.max(prev - 1, 1)),
    reset: () => {
      setDataState({});
      setCurrentStep(1);
    }
  };
};

// ===== SCHEMAT FORMULARZA =====
const registrationSchema = {
  step1: {
    title: "Dane podstawowe",
    type: "object",
    properties: {
      email: {
        type: "email",
        title: "Email",
        placeholder: "przykład@email.com",
      },
      name: {
        type: "text",
        title: "Imię i nazwisko",
        placeholder: "Jan Kowalski",
      },
    },
    required: ["email", "name"],
    validation: (data: any) => {
      if (data.name && data.name.trim().length < 3) {
        return "Imię i nazwisko musi mieć co najmniej 3 znaki";
      }
      if (data.name && !data.name.includes(" ")) {
        return "Podaj zarówno imię jak i nazwisko";
      }
      return null;
    },
  },
  step2: {
    title: "Hasło",
    type: "object",
    properties: {
      password: {
        type: "password",
        title: "Hasło",
        placeholder: "Minimum 6 znaków",
      },
      confirmPassword: {
        type: "password",
        title: "Potwierdź hasło",
        placeholder: "Powtórz hasło",
      },
    },
    required: ["password", "confirmPassword"],
    validation: (data: any) => {
      if (data.password && data.password.length < 6)
        return "Hasło musi mieć co najmniej 6 znaków";
      if (data.password !== data.confirmPassword)
        return "Hasła nie są identyczne";
      return null;
    },
  },
};

// ===== KROK 1 - DANE PODSTAWOWE =====
const RegisterStep1: React.FC<{ store: RegistrationStore }> = ({ store }) => {
  const navigate = useNavigate();

  const handleSubmit = (data: any) => {
    store.setData(data);
    navigate("/register/step2");
  };

  return (
    <NarrowCol>
      <div className="flex items-start gap-5">
        <UserPlus className="mt-2 bg-white rounded-full p-2 w-12 h-12" />
        <Lead
          title="Rejestracja"
          description="1 z 3 Podaj podstawowe informacje"
        />
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(store.data); }}>
            {/* Tutaj użyj swojego SchemaForm lub zwykłe inputy */}
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={store.data.email || ""}
                onChange={(e) => store.setData({ email: e.target.value })}
                className="w-full p-3 border rounded"
                required
              />
              <input
                type="text"
                placeholder="Imię i nazwisko"
                value={store.data.name || ""}
                onChange={(e) => store.setData({ name: e.target.value })}
                className="w-full p-3 border rounded"
                required
              />
              <Button type="submit" className="w-full">Dalej</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mt-4 text-center">
        <a href="/login" className="text-blue-600 hover:text-blue-500 text-sm">
          Masz już konto? Zaloguj się
        </a>
      </div>
    </NarrowCol>
  );
};

// ===== KROK 2 - HASŁO =====
const RegisterStep2: React.FC<{ store: RegistrationStore }> = ({ store }) => {
  const navigate = useNavigate();

  const handleSubmit = (data: any) => {
    store.setData(data);
    navigate("/register/step3");
  };

  return (
    <NarrowCol>
      <div className="flex items-start gap-5">
        <KeyRound className="mt-2 bg-white rounded-full p-2 w-12 h-12" />
        <Lead
          title="Rejestracja"
          description="2 z 3 Ustaw hasło do konta"
        />
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(store.data); }}>
            <div className="space-y-4">
              <input
                type="password"
                placeholder="Hasło"
                value={store.data.password || ""}
                onChange={(e) => store.setData({ password: e.target.value })}
                className="w-full p-3 border rounded"
                required
              />
              <input
                type="password"
                placeholder="Potwierdź hasło"
                value={store.data.confirmPassword || ""}
                onChange={(e) => store.setData({ confirmPassword: e.target.value })}
                className="w-full p-3 border rounded"
                required
              />
              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate("/register/step1")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Wstecz
                </Button>
                <Button type="submit" className="flex-1">Dalej</Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </NarrowCol>
  );
};

// ===== KROK 3 - POTWIERDZENIE =====
const RegisterStep3: React.FC<{ store: RegistrationStore }> = ({ store }) => {
  const navigate = useNavigate();
  const { mutate: register, isLoading } = useRegister();
  const [error, setError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleRegister = async () => {
    setError(null);

    if (!store.data.email || !store.data.password || !store.data.name) {
      setError("Brak wymaganych danych. Rozpocznij proces od początku.");
      return;
    }

    register(
      {
        email: store.data.email,
        password: store.data.password,
        name: store.data.name
      },
      {
        onSuccess: () => {
          setIsSuccess(true);
          store.setData({ registrationComplete: true });
          setTimeout(() => {
            navigate("/register/step4");
          }, 1500);
        },
        onError: (error: any) => {
          setError(error?.message || "Rejestracja nie powiodła się");
        }
      }
    );
  };

  if (!store.data.email) {
    return (
      <NarrowCol>
        <Lead title="Rejestracja" description="Błąd - brak danych" />
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Brak danych rejestracji. Rozpocznij proces od początku.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate("/register/step1")} className="mt-4">
          Wróć do kroku 1
        </Button>
      </NarrowCol>
    );
  }

  return (
    <NarrowCol>
      <div className="flex items-start gap-5">
        <UserCheck className="mt-2 bg-white rounded-full p-2 w-12 h-12" />
        <Lead title="Rejestracja" description="3 z 3 Potwierdzenie danych" />
      </div>

      {isSuccess && (
        <Alert className="mb-4 border-green-200 bg-green-50">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Rejestracja udana!</strong> Za chwilę zostaniesz przekierowany...
          </AlertDescription>
        </Alert>
      )}

      {error && !isSuccess && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Rejestracja nieudana:</strong> {error}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Check className="mr-2 h-5 w-5 text-blue-600" />
            Podsumowanie
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-gray-600">{store.data.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Imię i nazwisko</p>
                <p className="text-sm text-gray-600">{store.data.name}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => navigate("/register/step2")} 
          disabled={isLoading || isSuccess}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Wstecz
        </Button>

        <Button 
          onClick={handleRegister} 
          disabled={isLoading || isSuccess}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? "Rejestruję..." : 
           isSuccess ? "Udane!" :
           error ? "Spróbuj ponownie" : "Zarejestruj się"}
        </Button>
      </div>
    </NarrowCol>
  );
};

// ===== KROK 4 - SUKCES =====
const RegisterStep4: React.FC<{ store: RegistrationStore }> = ({ store }) => {
  const navigate = useNavigate();

  React.useEffect(() => {
    // Wyczyść dane po 30 sekundach
    const timer = setTimeout(() => {
      store.reset();
    }, 30000);

    return () => clearTimeout(timer);
  }, [store]);

  return (
    <NarrowCol>
      <Lead 
        title="Rejestracja zakończona!" 
        description="4 z 4 Sprawdź swoją skrzynkę mailową" 
      />

      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center text-green-800">
            <CheckCircle className="mr-2 h-6 w-6 text-green-600" />
            Konto zostało utworzone!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-700">
            Wysłaliśmy email z potwierdzeniem na adres{" "}
            <strong>{store.data.email}</strong>
          </p>
        </CardContent>
      </Card>

      <Button 
        onClick={() => {
          store.reset();
          navigate("/login");
        }} 
        className="w-full mt-6"
        size="lg"
      >
        Przejdź do logowania
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </NarrowCol>
  );
};

// ===== GŁÓWNY KOMPONENT =====
export const RegisterModule: React.FC = () => {
  const store = useRegistrationStore();

  return (
    <Routes>
      <Route path="step1" element={<RegisterStep1 store={store} />} />
      <Route path="step2" element={<RegisterStep2 store={store} />} />
      <Route path="step3" element={<RegisterStep3 store={store} />} />
      <Route path="step4" element={<RegisterStep4 store={store} />} />
      <Route path="*" element={<Navigate to="step1" />} />
    </Routes>
  );
};

// ===== EKSPORT ROUTES =====
export const registerRoutes = [
  <Route key="register" path="/register/*" element={<RegisterModule />} />
];