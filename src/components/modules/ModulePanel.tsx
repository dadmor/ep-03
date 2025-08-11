// src/components/modules/ModulePanel.tsx
import { ReactNode, ReactElement } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Refine } from "@refinedev/core";
import routerBindings from "@refinedev/react-router";
import { dataProvider, liveProvider } from "@refinedev/supabase";
import { authProvider, supabaseClient } from "@/utility";

interface ModulePanelProps {
  routes: ReactElement[];
  layout?: ReactNode;
  defaultPath?: string;
}

export const ModulePanel: React.FC<ModulePanelProps> = ({ 
  routes, 
  layout, 
  defaultPath = "dashboard" 
}) => {
  return (
    <Refine
      dataProvider={dataProvider(supabaseClient)}
      liveProvider={liveProvider(supabaseClient)}
      authProvider={authProvider}
      routerProvider={routerBindings}
      resources={[]}
      options={{
        syncWithLocation: true,
        warnWhenUnsavedChanges: true,
        useNewQueryKeys: true,
        liveMode: "auto",
      }}
    >
      {layout ? (
        layout
      ) : (
        <Routes>
          <Route index element={<Navigate to={defaultPath} replace />} />
          {...routes}
          <Route path="*" element={<Navigate to={defaultPath} replace />} />
        </Routes>
      )}
    </Refine>
  );
};