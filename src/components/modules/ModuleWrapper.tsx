// src/components/modules/ModuleWrapper.tsx
import { ReactNode } from "react";
import { Refine } from "@refinedev/core";
import { Route, Routes } from "react-router-dom";
import routerBindings from "@refinedev/react-router";
import { dataProvider, liveProvider } from "@refinedev/supabase";
import { authProvider, supabaseClient } from "@/utility";
import { Authenticated } from "@refinedev/core";
import { CatchAllNavigate } from "@refinedev/react-router";

interface ModuleWrapperProps {
  children: ReactNode;
  authKey: string;
}

export const ModuleWrapper: React.FC<ModuleWrapperProps> = ({ children, authKey }) => {
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
      <Routes>
        <Route
          path="/*"
          element={
            <Authenticated
              key={authKey}
              fallback={<CatchAllNavigate to="/login" />}
            >
              {children}
            </Authenticated>
          }
        />
      </Routes>
    </Refine>
  );
};