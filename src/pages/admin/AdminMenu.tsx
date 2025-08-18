import React from "react";
import { useLogout, useMenu, useGetIdentity } from "@refinedev/core";
import { NavLink } from "react-router-dom";
import { LogOut, Shield, X } from "lucide-react";
import { cn } from "@/utility";
import { Button, ScrollArea, Separator } from "@/components/ui";

interface AdminMenuProps {
  onClose?: () => void;
}

export const AdminMenu: React.FC<AdminMenuProps> = ({ onClose }) => {
  const { mutate: logout } = useLogout();
  const { menuItems } = useMenu();

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 text-white">
      <div className="flex h-16 items-center justify-between border-b border-slate-800 px-6">
        <div className="flex items-center">
          <Shield className="h-6 w-6 mr-2 text-red-400" />
          <span className="font-semibold">Admin Panel</span>
        </div>
        {onClose && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose} 
            className="lg:hidden text-white hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.key}
              to={item.route ?? "/"}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-red-600 text-white" 
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )
              }
            >
              {item.icon && <span className="mr-3">{item.icon}</span>}
              {item.label}
            </NavLink>
          ))}
        </nav>
      </ScrollArea>

      <Separator className="bg-slate-800" />
      
      <div className="p-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => logout()}
          className="w-full justify-start border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Wyloguj
        </Button>
      </div>
    </div>
  );
};