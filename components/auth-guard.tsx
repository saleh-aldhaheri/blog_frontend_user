
import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "@/lib/next-compat";
import { authStorage } from "@/src/lib/auth-storage";
import { useCurrentUser } from "@/src/context/user.context";
import FullPageLoader from "@/components/full-page-loader";
import type { User } from "@/src/v1/types/response/user";

type AuthGuardProps = {
  children: React.ReactNode;
};

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { user, setUser, isLoaded } = useCurrentUser();

  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const token = useSyncExternalStore(
    () => () => {},
    () => authStorage.getToken(),
    () => null,
  );

  useEffect(() => {
    if (!user && isLoaded) {
      const stored = authStorage.getUser<User>();
      if (stored) setUser(stored);
    }
  }, [isLoaded, setUser, user]);

  useEffect(() => {
    if (hydrated && !token) {
      router.replace("/");
    }
  }, [hydrated, router, token]);

  if (!hydrated || !token || !isLoaded) {
    return <FullPageLoader label="Checking your session..." />;
  }

  return children;
}
