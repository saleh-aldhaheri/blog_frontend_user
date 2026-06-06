
import { useRouter } from "@/lib/next-compat";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { authStorage } from "@/src/lib/auth-storage";
import { authApi } from "@/src/v1/api/auth.api";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/src/context/user.context";

type LogoutButtonProps = {
  compact?: boolean;
  className?: string;
};

export default function LogoutButton({
  compact = false,
  className,
}: LogoutButtonProps) {
  const { clearUser } = useCurrentUser();

  const router = useRouter();

  const onLogout = async () => {
    try {
      await authApi.logout();
      toast.success("Logged out successfully.");
    } catch {
      toast.warning("Session cleared locally. Server logout may have failed.");
    } finally {
      authStorage.clearToken();
      clearUser();
      router.replace("/login");
    }
  };

  return (
    <button
      type="button"
      onClick={onLogout}
      className={cn(
        "inline-flex items-center justify-center rounded-md border border-border text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5",
        compact ? "h-9 w-9 p-0" : "px-3 py-2",
        className,
      )}
      aria-label="Logout"
    >
      {compact ? <LogOut className="size-4" /> : "Logout"}
    </button>
  );
}
