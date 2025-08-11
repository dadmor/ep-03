// ============================================
// src/pages/auth/register/index.tsx
// KOMPLETNY MODUŁ REJESTRACJI - MIKROSERWIS
// ============================================

import React from "react";
import { Route, Routes, useNavigate, Navigate } from "react-router-dom";
import { useRegistrationStore } from "./hooks/useRegistrationStore";
import { useRegistrationLogic } from "./hooks/useRegistrationLogic";
import { RegisterLayout } from "./components/RegisterLayout";
import { Step1BasicInfo } from "./components/Step1BasicInfo";
import { Step2Password } from "./components/Step2Password";
import { Step3Confirmation } from "./components/Step3Confirmation";
import { Step4Success } from "./components/Step4Success";


// Główny komponent flow rejestracji
const RegisterFlow: React.FC = () => {
  const store = useRegistrationStore();
  const logic = useRegistrationLogic(store);

  return (
    <RegisterLayout currentStep={store.currentStep}>
      <Routes>
        <Route path="step1" element={<Step1BasicInfo store={store} logic={logic} />} />
        <Route path="step2" element={<Step2Password store={store} logic={logic} />} />
        <Route path="step3" element={<Step3Confirmation store={store} logic={logic} />} />
        <Route path="step4" element={<Step4Success store={store} />} />
        <Route path="*" element={<Navigate to="step1" />} />
      </Routes>
    </RegisterLayout>
  );
};

// Eksport modułu z routingiem
export const RegisterModule = () => (
  <Route path="/register/*" element={<RegisterFlow />} />
);
