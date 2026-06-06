// Compatibility shim so code copied from the Next.js app keeps working under
// react-router without touching every call site. Imports that used to point at
// `next/link` and `next/navigation` are redirected here.
import {
  Link as RouterLink,
  useNavigate,
  useLocation,
} from "react-router-dom";
import type { ComponentProps } from "react";

// ---- next/link ----------------------------------------------------------
type NextLinkProps = Omit<ComponentProps<typeof RouterLink>, "to" | "href"> & {
  href: string | { pathname: string };
  // Next-only props that react-router's Link doesn't use — accepted & ignored.
  prefetch?: boolean;
  scroll?: boolean;
  shallow?: boolean;
  passHref?: boolean;
  legacyBehavior?: boolean;
};

export function Link({
  href,
  prefetch: _prefetch,
  scroll: _scroll,
  shallow: _shallow,
  passHref: _passHref,
  legacyBehavior: _legacyBehavior,
  ...props
}: NextLinkProps) {
  const to = typeof href === "string" ? href : href.pathname;
  return <RouterLink to={to} {...props} />;
}

export default Link;

// ---- next/navigation ----------------------------------------------------
export function useRouter() {
  const navigate = useNavigate();
  return {
    push: (href: string) => navigate(href),
    replace: (href: string) => navigate(href, { replace: true }),
    back: () => navigate(-1),
    forward: () => navigate(1),
    refresh: () => navigate(0),
    prefetch: () => {},
  };
}

export function usePathname() {
  return useLocation().pathname;
}

export { useParams } from "react-router-dom";
