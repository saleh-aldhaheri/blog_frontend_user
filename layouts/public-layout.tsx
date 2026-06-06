import { Outlet } from "react-router-dom";
import { Link } from "@/lib/next-compat";
import { ThemeToggle } from '@/components/theme-toggle'
import AppTopbar from '@/components/app-topbar'

export default function PublicLayout() {
  return (
    <div className="zen-page min-h-screen">
      <AppTopbar
        fixed
        className="zen-top-nav"
        left={
          <Link href="/" className="text-xl font-black tracking-tight">
            Zenith
          </Link>
        }
        right={
          <>
            <ThemeToggle compact className="md:hidden" />
            <ThemeToggle className="hidden md:flex" />
            <Link href="/login" className="zen-muted text-sm font-medium transition-colors hover:text-foreground">
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-contrast transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_20px_-12px_rgba(26,137,23,0.9)] md:px-5 md:py-2.5 md:text-sm"
            >
              Get Started
            </Link>
          </>
        }
      />
      <main className="pt-20"><Outlet /></main>
    </div>
  )
}
