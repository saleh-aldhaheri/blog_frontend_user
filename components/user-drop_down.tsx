
import { useState, useRef, useEffect } from "react";
import { Menu, User, KeyRound, UserCircle, ChevronDown } from "lucide-react";
import { useCurrentUser } from "@/src/context/user.context";
import { Link } from "@/lib/next-compat";
import ChangePasswordForm from "@/components/change-password-form";

function UserDropdown() {
  const { user } = useCurrentUser();
  const [open, setOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const avatarSrc = user?.avatar ?? null;

  return (
    <>
      <div ref={ref} className="relative">
        {/* Trigger */}
        <button
          onClick={() => setOpen(prev => !prev)}
          className="flex items-center gap-2 rounded-full border border-border bg-surface px-2 py-1.5 transition-colors hover:bg-accent/60"
        >
          {/* Avatar or icon */}
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={user?.name ?? "User"}
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-surface-muted flex items-center justify-center text-xs font-bold text-muted">
              {user?.name?.charAt(0).toUpperCase() ?? <UserCircle size={14} />}
            </div>
          )}

          {/* Name — hidden on mobile */}
          <span className="hidden md:block text-xs font-semibold text-foreground max-w-[100px] truncate">
            {user?.name ?? "Account"}
          </span>

          <ChevronDown
            size={13}
            className={`text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>

        {/* Dropdown */}
        {open && (
          <div
            className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-border bg-surface shadow-xl z-50 overflow-hidden"
            style={{ animation: "dropdownIn 180ms ease forwards" }}
          >
            {/* User info header */}
            <div className="px-4 py-3 border-b border-border">
              <p className="text-xs font-bold text-foreground truncate">
                {user?.name}
              </p>
              <p className="text-xs text-muted truncate">{user?.email}</p>
            </div>

            {/* Menu items */}
            <div className="py-1">
              <Link
                href={`/profile/${user?.id}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-accent/60 transition-colors"
              >
                <User size={14} className="text-muted" />
                Profile
              </Link>

              <button
                onClick={() => {
                  setOpen(false);
                  setPasswordModalOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-accent/60 transition-colors"
              >
                <KeyRound size={14} className="text-muted" />
                Change Password
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Password modal — rendered outside dropdown so it overlays everything */}
      <ChangePasswordForm
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />

      <style>{`
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}

export default UserDropdown;
