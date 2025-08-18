import { Route } from "react-router-dom";
import { FileText } from "lucide-react";

const ReportsOverview = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Reports</h1>
    <p>Reports will be here</p>
  </div>
);

export const reportsResource = {
  name: "reports",
  list: "/admin/reports",
  meta: {
    label: "Raporty",
    icon: <FileText className="h-4 w-4" />,
  },
};

export const reportsRoutes = [
  <Route key="reports-overview" path="reports" element={<ReportsOverview />} />,
];