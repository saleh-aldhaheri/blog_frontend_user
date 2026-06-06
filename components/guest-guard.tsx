
import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "@/lib/next-compat";
import { authStorage } from "@/src/lib/auth-storage";
import FullPageLoader from "@/components/full-page-loader";

type GuestGuardProps = {
  children: React.ReactNode;
};

export default function GuestGuard({ children }: GuestGuardProps) {
  const router = useRouter();
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
    if (hydrated && token) {
      router.replace("/home");
    }
  }, [hydrated, router, token]);

  if (!hydrated) {
    return <FullPageLoader label="Checking your session..." />;
  }

  if (token) {
    return <FullPageLoader label="Redirecting to your dashboard..." />;
  }

  return children;
}
