import { Route } from "react-router-dom";
import { Settings } from "lucide-react";

const SystemSettings = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">System Settings</h1>
    <p>System configuration</p>
  </div>
);

export const systemSettingsResource = {
  name: "system-settings",
  list: "/admin/system-settings",
  meta: {
    label: "Ustawienia",
    icon: <Settings className="h-4 w-4" />,
  },
};

export const systemSettingsRoutes = [
  <Route key="settings" path="system-settings" element={<SystemSettings />} />,
];