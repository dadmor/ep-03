import type { PropsWithChildren } from "react";
import { useState } from "react";
import { AdminMenu } from "./AdminMenu";
import { Button } from "@/components/ui/button";
import { Menu as MenuIcon } from "lucide-react";

export const AdminLayout: React.FC<PropsWithChildren> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 relative overflow-x-hidden">
      <div className="flex relative">
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <aside
          className={`
            h-screen w-64 transform transition-transform duration-300 ease-in-out
            fixed left-0 top-0 z-50
            ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0
            bg-slate-900 text-white
          `}
        >
          <AdminMenu onClose={() => setIsMobileMenuOpen(false)} />
        </aside>

        <main className="flex-1 lg:ml-64 min-w-0 relative z-10">
          <div className="sticky top-0 z-30 flex h-16 items-center border-b border-slate-200 bg-white px-4 lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="mr-2"
            >
              <MenuIcon className="h-6 w-6" />
            </Button>
            <span className="font-semibold text-red-600">
              Panel Administratora
            </span>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
};