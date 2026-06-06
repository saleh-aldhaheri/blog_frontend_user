
import { Link } from "@/lib/next-compat";
import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "@/lib/next-compat";
import axios from "axios";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/src/v1/api/auth.api";
import { authStorage } from "@/src/lib/auth-storage";
import { useCurrentUser } from "@/src/context/user.context";
import { AuthData } from "@/src/v1/types/response/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const { setUser } = useCurrentUser();

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);

    try {
      const res = await authApi.login({ email, password });
      const { token, user }: AuthData = res.data.data;

      authStorage.setToken(token);
      setUser(user);

      toast.success("Signed in successfully. Redirecting to your dashboard...");
      router.replace("/home");
      toast.success("Signed in successfully. Redirecting to your dashboard...");
      router.replace("/home");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message =
          (err.response?.data as { message?: string } | undefined)?.message ??
          err.message;
        toast.error(message);
      } else {
        toast.error("Something went wrong while signing in.");
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-10 text-center">
      <header className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">
          Welcome back.
        </h1>
        <p className="zen-muted mx-auto max-w-[320px] font-[var(--font-newsreader)] text-xl">
          Return to your focused editorial workspace.
        </p>
      </header>

      <div className="relative flex items-center gap-4">
        <div className="zen-divider flex-grow" />
        <span className="zen-muted text-xs font-semibold uppercase tracking-[0.2em]">
          Email sign in
        </span>
        <div className="zen-divider flex-grow" />
      </div>

      <form className="space-y-6 text-left" onSubmit={handleLogin}>
        <label className="block space-y-1">
          <Label className="zen-label" htmlFor="email">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={event => setEmail(event.target.value)}
            disabled={pending}
            placeholder="your@email.com"
          />
        </label>

        <label className="block space-y-1">
          <Label className="zen-label" htmlFor="password">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={event => setPassword(event.target.value)}
              disabled={pending}
              placeholder="••••••••"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(prev => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </label>

        <Button
          type="submit"
          disabled={pending}
          className="h-12 w-full rounded-full bg-primary text-primary-contrast hover:bg-primary/90 disabled:opacity-60"
        >
          {pending ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <footer className="space-y-8 text-center">
        <p className="zen-muted text-sm">
          Don&apos;t have an account?{" "}
          <Link
            className="font-bold text-primary hover:underline"
            href="/register"
          >
            Create Account
          </Link>
        </p>
        <p className="text-xs leading-relaxed text-zinc-400">
          By clicking “Sign In”, you agree to Zenith&apos;s Terms of Service and
          acknowledge that Zenith&apos;s Privacy Policy applies to you.
        </p>
      </footer>
    </div>
  );
}
