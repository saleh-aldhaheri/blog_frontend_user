import { Outlet } from "react-router-dom";
import { Link } from "@/lib/next-compat";
import GuestGuard from '@/components/guest-guard'
import { ThemeToggle } from '@/components/theme-toggle'
import AppTopbar from '@/components/app-topbar'

export default function AuthLayout() {
  return (
    <GuestGuard>
      <div className="zen-page min-h-screen">
        <div className="fixed left-0 top-0 z-[60] h-0.5 w-full bg-border">
          <div className="h-full w-1/3 bg-primary" />
        </div>
        <AppTopbar
          fixed
          className="zen-top-nav"
          left={
            <Link href="/" className="text-2xl font-black tracking-tighter">
              Zenith
            </Link>
          }
          right={
            <>
              <ThemeToggle compact className="md:hidden" />
              <ThemeToggle className="hidden md:flex" />
              <Link href="/login" className="text-sm font-semibold">
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-contrast md:px-6 md:py-2.5 md:text-sm"
              >
                Get Started
              </Link>
            </>
          }
        />
        <main className="flex min-h-screen items-center justify-center px-6 pb-20 pt-32">
          <div className="w-full max-w-[440px]"><Outlet /></div>
        </main>
      </div>
    </GuestGuard>
  )
}
