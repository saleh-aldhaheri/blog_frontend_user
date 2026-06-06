
import { Bell, Check } from "lucide-react";
import { useState } from "react";
import type { NotificationItem } from "@/src/v1/types/response/notification";

type Props = {
  notifications: NotificationItem[];
  onMarkAsRead?: (id: string) => void;
  onLoadMore?: () => void;
  loadingMore?: boolean;
  hasMore?: boolean;
};

export default function NotificationBell({
  notifications,
  onMarkAsRead,
  onLoadMore,
  loadingMore,
  hasMore,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(prev => !prev)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-accent/60 hover:text-foreground"
      >
        <Bell className="size-4" />
        {notifications.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
            {notifications.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 rounded-md border border-border bg-background shadow-lg">
          <div className="border-b border-border px-4 py-2 text-sm font-medium">
            Notifications
          </div>

          {notifications.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              No notifications
            </p>
          ) : (
            <>
              <ul className="max-h-80 overflow-y-auto">
                {notifications.map(n => (
                  <li
                    key={n.id}
                    className="flex items-start gap-3 px-4 py-3 bg-accent/20"
                  >
                    <img
                      src={n.avatar}
                      alt={n.name}
                      className="h-8 w-8 shrink-0 rounded-full object-cover"
                    />
                    <div className="flex flex-1 flex-col gap-0.5">
                      <p className="text-sm font-medium text-foreground">
                        {n.message}
                      </p>
                      <span className="text-xs text-blue-500">New</span>
                    </div>
                    <button
                      onClick={() => onMarkAsRead?.(n.id)}
                      className="shrink-0 rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                      title="Mark as read"
                    >
                      <Check className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>

              {hasMore && (
                <div className="border-t border-border px-4 py-2">
                  <button
                    onClick={onLoadMore}
                    disabled={loadingMore}
                    className="w-full text-center text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
                  >
                    {loadingMore ? "Loading..." : "Load more"}
                  </button>
                </div>
              )}

              {!hasMore && (
                <p className="border-t border-border px-4 py-2 text-center text-xs text-muted-foreground">
                  All caught up
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}