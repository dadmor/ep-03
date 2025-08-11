// src/components/modules/AccessGuard.tsx
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useGetIdentity } from "@refinedev/core";
import { LoadingFallback } from "./LoadingFallback";

interface AccessGuardProps {
  children: ReactNode;
  allowedRoles: string[];
  fallbackPath: string;
  loadingText?: string;
  loadingColorClass?: string;
}

export const AccessGuard: React.FC<AccessGuardProps> = ({ 
  children, 
  allowedRoles, 
  fallbackPath,
  loadingText,
  loadingColorClass 
}) => {
  const { data: identity, isLoading } = useGetIdentity<any>();
  
  if (isLoading) {
    return <LoadingFallback text={loadingText} colorClass={loadingColorClass} />;
  }
  
  if (!allowedRoles.includes(identity?.role)) {
    return <Navigate to={fallbackPath} replace />;
  }
  
  return <>{children}</>;
};