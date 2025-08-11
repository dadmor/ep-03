import type { PropsWithChildren } from "react";
import { useState } from "react";
import { StudentMenu } from "./StudentMenu";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export const StudentLayout: React.FC<PropsWithChildren> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Background effect using CSS variables */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden p-0 lg:p-4 lg:pb-28 pt-0"
      >
        <div className="relative w-full h-full">
          <div className="absolute inset-0 bg-background rounded-3xl" />
          <div
            className="absolute inset-0 rounded-3xl overflow-hidden"
            style={{
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent 0%, transparent 50%, black 70%)",
              maskImage:
                "linear-gradient(to bottom, transparent 0%, transparent 50%, black 70%)",
            }}
          >
            {/* Main gradient for base tone */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange/10 via-yellow/5 to-purple/10 rounded-3xl" />
            
            {/* Large orange blob on the left - creating concave effect */}
            <div className="absolute w-[90vw] h-[120vh] top-1/2 -translate-y-1/2 -left-[40%] bg-orange rounded-full blur-[180px] opacity-70 dark:opacity-40 animate-pulse" />
            
            {/* Large purple blob on the right - creating concave effect */}
            <div className="absolute w-[90vw] h-[120vh] top-1/2 -translate-y-1/2 -right-[40%] bg-purple rounded-full blur-[180px] opacity-70 dark:opacity-40 animate-pulse" />
            
            {/* Central yellow glow - smaller and in the middle */}
            <div className="absolute w-[40vw] h-[40vw] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow rounded-full blur-[120px] opacity-60 dark:opacity-30 animate-pulse" />
            
            {/* Additional depth layers */}
            <div className="absolute w-[60vw] h-[80vh] top-1/2 -translate-y-1/2 -left-[20%] bg-orange rounded-full blur-[200px] opacity-40 dark:opacity-20" />
            <div className="absolute w-[60vw] h-[80vh] top-1/2 -translate-y-1/2 -right-[20%] bg-purple rounded-full blur-[200px] opacity-40 dark:opacity-20" />
          </div>
        </div>
      </div>

      <div className="flex relative">
        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/30 dark:bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            h-screen w-80 transform transition-transform duration-300 ease-in-out
            fixed left-0 top-0 z-50
            ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0 lg:w-72
            bg-card/95 backdrop-blur-xl border-r
          `}
        >
          <StudentMenu onClose={() => setIsMobileMenuOpen(false)} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-72 min-w-0 relative z-10">
          {/* Mobile Header */}
          <div className="sticky top-0 z-30 flex h-16 items-center border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 px-4 lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="mr-2"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <span className="font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Smart Up
            </span>
          </div>

          {/* Content with bottom padding for mobile nav */}
          <div className="min-h-[calc(100vh-4rem)] pb-24 lg:pb-0">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Navigation - tylko mobile */}
      <nav
        aria-label="Nawigacja dolna"
        className="fixed bottom-0 z-40 left-0 right-0 lg:hidden bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-t"
      >
        <StudentMenu variant="bottom" />
      </nav>
    </div>
  );
};