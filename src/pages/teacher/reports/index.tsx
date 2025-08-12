// path: src/pages/teacher/reports/index.tsx
import { Route, Navigate } from "react-router-dom";
import { BarChart3 } from "lucide-react";
import { ReportsOverview } from "./overview";
import { EngagementReport } from "./engagement";
import { ReportUsersSummary } from "./users-summary";

/** RODZIC do menu (klik -> overview) */
export const reportsResource = {
  name: "reports",
  list: "/teacher/reports/overview",
  meta: {
    label: "Raporty",
    icon: <BarChart3 className="h-4 w-4" />,
  },
};

/** DZIECI do menu (pod „Raporty”) */
export const reportsEngagementResource = {
  name: "reports-engagement",
  list: "/teacher/reports/engagement",
  meta: { label: "engagement" },
};

export const reportsSummaryResource = {
  name: "reports-summary",
  list: "/teacher/reports/summary",
  meta: { label: "summary" },
};

/** Trasy WZGLĘDNE w module /teacher/* */
export const reportsRoutes = [
  // alias /teacher/reports -> /teacher/reports/overview
  <Route key="reports-root-redirect" path="reports" element={<Navigate to="reports/overview" replace />} />,
  <Route key="reports-overview" path="reports/overview" element={<ReportsOverview />} />,
  <Route key="reports-engagement" path="reports/engagement" element={<EngagementReport />} />,
  <Route key="reports-summary" path="reports/summary" element={<ReportUsersSummary />} />,
];
