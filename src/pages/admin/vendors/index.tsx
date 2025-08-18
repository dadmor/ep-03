// src/pages/admin/vendors/index.tsx
import { Route } from "react-router-dom";
import { Building } from "lucide-react";
import { VendorsList } from "./list";
import { VendorsCreate } from "./create";
import { VendorsEdit } from "./edit";
import { VendorsShow } from "./show";

export { VendorsList } from "./list";
export { VendorsCreate } from "./create";
export { VendorsEdit } from "./edit";
export { VendorsShow } from "./show";

export const vendorsResource = {
  name: "vendors",
  list: "/admin/vendors",
  create: "/admin/vendors/create",
  edit: "/admin/vendors/edit/:id",
  show: "/admin/vendors/show/:id",
  meta: {
    label: "Organizacje",
    icon: <Building className="h-4 w-4" />,
  },
};

export const vendorsRoutes = [
  <Route key="vendors-list" path="vendors" element={<VendorsList />} />,
  <Route key="vendors-create" path="vendors/create" element={<VendorsCreate />} />,
  <Route key="vendors-edit" path="vendors/edit/:id" element={<VendorsEdit />} />,
  <Route key="vendors-show" path="vendors/show/:id" element={<VendorsShow />} />,
];