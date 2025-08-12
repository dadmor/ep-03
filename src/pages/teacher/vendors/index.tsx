// src/pages/teacher/vendors/index.tsx
import { Route } from "react-router";
import { Building } from "lucide-react";
import { VendorsList } from "./list";

export { VendorsList } from "./list";

/**
 * Do menu (useMenu) – ścieżka absolutna z prefiksem /teacher
 */
export const vendorsResource = {
  name: "vendors",
  list: "/teacher/vendors",
  meta: {
    label: "Organizacje",
    icon: <Building className="h-4 w-4" />,
  },
};

/**
 * Do routingu wewnętrznego modułu /teacher/*
 */
export const vendorsRoutes = [
  <Route key="vendors-list" path="vendors" element={<VendorsList />} />,
];
