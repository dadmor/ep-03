import { Route } from "react-router";
import { Building } from "lucide-react";
import { VendorsList } from "./list";

export { VendorsList } from "./list";

export const vendorsResource = {
  name: "vendors",
  list: "/vendors",
  meta: {
    label: "Organizacje",
    icon: <Building className="h-4 w-4" />,
  },
};

export const vendorsRoutes = [
  <Route key="vendors-list" path="/vendors" element={<VendorsList />} />,
];