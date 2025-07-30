import { Route } from "react-router";
import { VendorsList } from "./list";

export { VendorsList } from "./list";

export const vendorsResource = {
  name: "vendors",
  list: "/vendors",
  meta: {
    label: "Organizacje",
    icon: "Building",
  },
};

export const vendorsRoutes = [
  <Route key="vendors-list" path="/vendors" element={<VendorsList />} />,
];