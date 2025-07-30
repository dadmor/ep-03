import { Route } from "react-router";
import { ReportsOverview } from "./overview";

export { ReportsOverview } from "./overview";

export const reportsResource = {
  name: "reports",
  list: "/reports",
  meta: {
    label: "Raporty",
    icon: "FileText",
  },
};

export const reportsRoutes = [
  <Route key="reports" path="/reports" element={<ReportsOverview />} />,
];