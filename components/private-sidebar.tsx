
import { Link } from "@/lib/next-compat";
import { useEffect, useState } from "react";
import { usePathname } from "@/lib/next-compat";
import { BookOpen, Home, PanelLeft, User } from "lucide-react";
import { followApi } from "@/src/v1/api/follows.api";
import type { UserBasic } from "@/src/v1/types/response/user";
import { toast } from "sonner";
import { useCurrentUser } from "@/src/context/user.context";

const avatarTones = [
  "from-sky-500 to-indigo-600",
  "from-slate-600 to-slate-900",
  "from-zinc-500 to-zinc-800",
];

type PrivateSidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
  mobile?: boolean;
};

export default function PrivateSidebar({
  collapsed,
  onToggle,
  mobile = false,
}: PrivateSidebarProps) {
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const [following, setFollowing] = useState<UserBasic[]>([]);
  const [loadingFollowing, setLoadingFollowing] = useState(true);
  const isHomeActive = pathname === "/home";
  const isLibraryActive = pathname === "/library";
  const isProfileActive = pathname === `/profile/${user?.id}`;

  useEffect(() => {
    const loadFollowing = async () => {
      try {
        const { data } = await followApi.getFollowing({ limit: 3 });
        setFollowing(data.data);
      } catch {
        toast.error("Unable to load followed readers.");
      } finally {
        setLoadingFollowing(false);
      }
    };

    void loadFollowing();
  }, []);

  return (
    <aside
      className={[
        "border-r border-border bg-surface py-6 transition-[width,padding] duration-200",
        mobile ? "h-full w-full px-5" : "sticky top-0 h-screen shrink-0",
        !mobile && (collapsed ? "w-[4.8rem] px-3" : "w-[18rem] px-5"),
      ].join(" ")}
    >
      <div className="px-1">
        <div
          className={
            collapsed && !mobile
              ? "flex justify-center"
              : "flex items-center justify-between"
          }
        >
          {collapsed && !mobile ? null : (
            <h2 className="text-xl font-bold text-foreground">Zenith</h2>
          )}
          {!mobile ? (
            <button
              type="button"
              onClick={onToggle}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <PanelLeft className="size-4" />
            </button>
          ) : null}
        </div>
        {!collapsed || mobile ? (
          <p className="mt-3 text-[0.65rem] leading-[1.15] tracking-[0.25em] text-muted-foreground">
            FLOW STATE
            <br />
            READING
          </p>
        ) : null}
      </div>

      <nav className="mt-8 space-y-2">
        <Link
          href="/home"
          className={[
            "flex h-10 rounded-xl transition-colors",
            isHomeActive
              ? "bg-primary/12 text-foreground hover:bg-primary/18"
              : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
            collapsed
              ? "mx-auto w-10 items-center justify-center px-0"
              : "items-center gap-2 px-3",
          ].join(" ")}
        >
          <Home
            className={["size-4", isHomeActive ? "text-primary" : ""].join(" ")}
          />
          {!collapsed ? (
            <span
              className={[
                "text-[0.95rem]",
                isHomeActive ? "font-semibold text-primary" : "",
              ].join(" ")}
            >
              Home
            </span>
          ) : null}
        </Link>
        <Link
          href="/library"
          className={[
            "flex h-10 rounded-xl transition-all duration-200",
            isLibraryActive
              ? "bg-primary/12 text-foreground hover:bg-primary/18"
              : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
            collapsed
              ? "mx-auto w-10 items-center justify-center px-0"
              : "items-center gap-2 px-3",
          ].join(" ")}
        >
          <BookOpen
            className={["size-4", isLibraryActive ? "text-primary" : ""].join(
              " ",
            )}
          />
          {!collapsed ? (
            <span
              className={[
                "text-[0.95rem]",
                isLibraryActive ? "font-semibold text-primary" : "",
              ].join(" ")}
            >
              Library
            </span>
          ) : null}
        </Link>
        <Link
          href={`/profile/${user?.id}`}
          className={[
            "flex h-10 rounded-xl transition-all duration-200",
            isProfileActive
              ? "bg-primary/12 text-foreground hover:bg-primary/18"
              : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
            collapsed
              ? "mx-auto w-10 items-center justify-center px-0"
              : "items-center gap-2 px-3",
          ].join(" ")}
        >
          <User
            className={["size-4", isProfileActive ? "text-primary" : ""].join(
              " ",
            )}
          />
          {!collapsed ? (
            <span
              className={[
                "text-[0.95rem]",
                isProfileActive ? "font-semibold text-primary" : "",
              ].join(" ")}
            >
              Profile
            </span>
          ) : null}
        </Link>
      </nav>

      <div className="mt-10 px-1">
        {!collapsed ? (
          <p className="text-[0.68rem] tracking-[0.18em] text-muted-foreground">
            RECENTLY FOLLOWED
          </p>
        ) : null}
        <ul className="mt-4 space-y-3">
          {loadingFollowing ? (
            <li className="text-xs text-muted-foreground">
              {collapsed ? "..." : "Loading..."}
            </li>
          ) : following.length === 0 ? (
            <li className="text-xs text-muted-foreground">
              {collapsed ? "-" : "No followed readers yet."}
            </li>
          ) : (
            following.map((reader, index) => (
              <Link
                href={`/users/${reader.id}`}
                className="mb-4 block"
                key={reader.id}
              >
                <li
                  className={
                    collapsed
                      ? "flex justify-center"
                      : "flex items-center gap-3"
                  }
                >
                  {reader.avatar ? (
                    <img
                      src={reader.avatar}
                      alt={reader.name}
                      className="size-8 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarTones[index % avatarTones.length]} text-[0.64rem] font-semibold text-white`}
                    >
                      {reader.name
                        .split(" ")
                        .map(part => part[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                  )}
                  {!collapsed ? (
                    <span className="truncate font-[var(--font-newsreader)] text-[1rem] text-muted-foreground">
                      {reader.name}
                    </span>
                  ) : null}
                </li>
              </Link>
            ))
          )}
        </ul>
      </div>
    </aside>
  );
}
