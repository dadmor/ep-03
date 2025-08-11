import { Route } from "react-router";
import { FileText } from "lucide-react";
import { ReportsOverview } from "./overview";

export { ReportsOverview } from "./overview";

export const reportsResource = {
  name: "reports",
  list: "/reports",
  meta: {
    label: "Raporty",
    icon: <FileText className="h-4 w-4" />,
  },
};

export const reportsRoutes = [
  <Route key="reports" path="/reports" element={<ReportsOverview />} />,
];