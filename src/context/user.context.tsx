
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { authStorage } from "@/src/lib/auth-storage";
import type { User } from "@/src/v1/types/response/user";

interface UserContextValue {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
  isLoaded: boolean;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = authStorage.getUser<User>();
    if (stored) setUserState(stored);
    setIsLoaded(true);
  }, []);

  const setUser = useCallback((u: User) => {
    authStorage.setUser(u);
    setUserState(u);
  }, []);

  const clearUser = useCallback(() => {
    authStorage.clearAll();
    setUserState(null);
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, clearUser, isLoaded }}>
      {children}
    </UserContext.Provider>
  );
}

export function useCurrentUser() {
  const ctx = useContext(UserContext);
  if (!ctx)
    throw new Error("useCurrentUser must be used inside <UserProvider>");
  return ctx;
}
