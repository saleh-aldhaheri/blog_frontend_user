import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import AuthGuard from "@/components/auth-guard";
import LogoutButton from "@/components/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import PrivateSidebar from "@/components/private-sidebar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import AppTopbar from "@/components/app-topbar";
import UserDropdown from "@/components/user-drop_down";
import NotificationBell from "@/components/notification-bell";
import { useNotifications } from "@/hooks/use-notifications";
import { useCurrentUser } from "@/src/context/user.context"; 

export default function PrivateLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useCurrentUser();                         
  const { notifications, markAsRead} = useNotifications(user?.id ?? null);


  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-background">
        <div className="hidden md:block">
          <PrivateSidebar
            collapsed={collapsed}
            onToggle={() => setCollapsed(prev => !prev)}
          />
        </div>
        <div className="flex min-h-screen w-full flex-1 flex-col">
          <AppTopbar
            left={
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground md:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-4" />
              </button>
            }
            right={
              <>
                <ThemeToggle compact className="md:hidden" />
                <ThemeToggle className="hidden md:flex" />
                <NotificationBell
                  notifications={notifications}
                  onMarkAsRead={markAsRead}
                />

                <UserDropdown />
                <LogoutButton compact className="md:hidden" />
                <LogoutButton className="hidden md:inline-flex" />
              </>
            }
          />
          <main className="mx-auto w-full max-w-6xl px-6 py-10">
            <Outlet />
          </main>
        </div>
      </div>
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[18rem] p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <PrivateSidebar collapsed={false} onToggle={() => {}} mobile />
        </SheetContent>
      </Sheet>
    </AuthGuard>
  );
}