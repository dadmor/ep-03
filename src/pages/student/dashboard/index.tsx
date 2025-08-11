// src/pages/student/dashboard/index.tsx
import { Route } from "react-router-dom";
import { DashboardOverview } from "./overview";

export { DashboardOverview } from "./overview";

export const dashboardRoutes = [
  <Route key="dashboard" path="/dashboard" element={<DashboardOverview />} />,
];