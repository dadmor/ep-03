import { Route } from "react-router";
import { DashboardOverview } from "./overview";

export { DashboardOverview } from "./overview";

export const dashboardResource = {
  name: "dashboard",
  list: "/dashboard/overview",
  meta: {
    label: "Dashboard",
    icon: "LayoutDashboard",
  },
};

export const dashboardRoutes = [
  <Route key="dashboard" path="/dashboard/overview" element={<DashboardOverview />} />,
];