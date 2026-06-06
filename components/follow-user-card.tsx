
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "@/lib/next-compat";
import { followApi } from "@/src/v1/api/follows.api";
import { UserBasic } from "@/src/v1/types/response/user";

interface FollowUserCardProps {
  user: UserBasic;
}

function FollowUserCard({ user }: FollowUserCardProps) {
  const [isFollowed, setIsFollowed] = useState(user.is_followed ?? false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setLoading(true);
      if (isFollowed) {
        await followApi.unfollowUser(user.id);
        setIsFollowed(false);
      } else {
        await followApi.followUser(user.id);
        setIsFollowed(true);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={() => router.push(`/users/${user.id}`)}
      className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl border border-border bg-surface hover:bg-accent/40 transition-colors cursor-pointer"
    >
      {/* Avatar + info */}
      <div className="flex items-center gap-3 min-w-0">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover border border-border shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-surface-muted border border-border flex items-center justify-center text-sm font-bold text-muted shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {user.name}
          </p>
          <p className="text-xs text-muted truncate">{user.email}</p>
        </div>
      </div>

      {/* Follow / Unfollow */}
      <button
        onClick={handleToggleFollow}
        disabled={loading}
        className={[
          "shrink-0 text-xs font-bold px-4 py-1.5 rounded-full border transition-all disabled:opacity-50",
          isFollowed
            ? "border-border text-muted hover:border-destructive hover:text-destructive"
            : "border-primary text-primary hover:bg-primary hover:text-primary-contrast",
        ].join(" ")}
      >
        {loading ? "..." : isFollowed ? "Unfollow" : "Follow"}
      </button>
    </div>
  );
}

export default FollowUserCard;
