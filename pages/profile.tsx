import { ProfileApi } from "@/src/v1/api/profile.api";
import { useCurrentUser } from "@/src/context/user.context";
import { Profile } from "@/src/v1/types/response/profile";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import FullPageLoader from "@/components/full-page-loader";
import InfoCards from "@/components/info-cards";
import postApi from "@/src/v1/api/post.api";
import { PostListItem } from "@/src/v1/types/response/post";
import PostRecentViewCard from "@/components/post-recent-views-grid";
import ProfileForm from "@/components/profile-form";
import { UserBasic } from "@/src/v1/types/response/user";
import { followApi } from "@/src/v1/api/follows.api";
import FollowUserCard from "@/components/follow-user-card";

type TabKey = "profile" | "followers" | "following";

const tabLabels: Record<TabKey, string> = {
  profile: "Profile",
  followers: "Followers",
  following: "Following",
};

function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewedPosts, setViewedPost] = useState<PostListItem[]>([]);
  const { user } = useCurrentUser();
  const [activeTab, setActiveTab] = useState<TabKey>("profile");

  // ── follow/following list state ──────────────────────────────────────────
  const [followList, setFollowList] = useState<
    Record<"followers" | "following", UserBasic[]>
  >({
    followers: [],
    following: [],
  });
  const [followLoading, setFollowLoading] = useState(false);
  const [followLoadingMore, setFollowLoadingMore] = useState(false);

  const followLoadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const cursorRef = useRef<Record<"followers" | "following", string | null>>({
    followers: null,
    following: null,
  });
  const hasMoreRef = useRef<Record<"followers" | "following", boolean>>({
    followers: true,
    following: true,
  });

  useEffect(() => {
    if (!user?.id) return;

    const loadData = async () => {
      try {
        const [profileRes, postsRes] = await Promise.all([
          ProfileApi.getUserProfile(user.id),
          postApi.getViewedPosts({ limit: 3 }),
        ]);
        setProfile(profileRes.data.data);
        setViewedPost(postsRes.data.data);
      } catch {
        toast.error("Unable to load profile right now.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const fetchFollowList = useCallback(
    async (tab: "followers" | "following", reset = false) => {
      if (followLoadingRef.current) return;
      if (!reset && !hasMoreRef.current[tab]) return;

      try {
        followLoadingRef.current = true;
        reset ? setFollowLoading(true) : setFollowLoadingMore(true);

        if (reset) {
          cursorRef.current[tab] = null;
          hasMoreRef.current[tab] = true;
        }

        const params = { limit: 10, cursor: cursorRef.current[tab] };
        const res =
          tab === "followers"
            ? await followApi.getFollowers(params)
            : await followApi.getFollowing(params);

        const nextCursor = res.data.meta.next_cursor ?? null;
        cursorRef.current[tab] = nextCursor;
        hasMoreRef.current[tab] = Boolean(nextCursor);

        setFollowList(prev => ({
          ...prev,
          [tab]: reset ? res.data.data : [...prev[tab], ...res.data.data],
        }));
      } catch {
        toast.error(`Unable to load ${tab} right now.`);
      } finally {
        followLoadingRef.current = false;
        setFollowLoading(false);
        setFollowLoadingMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (activeTab === "followers" || activeTab === "following") {
      setFollowList(prev => ({ ...prev, [activeTab]: [] }));
      void fetchFollowList(activeTab, true);
    }
  }, [activeTab, fetchFollowList]);

  useEffect(() => {
    if (activeTab === "profile") return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          void fetchFollowList(activeTab as "followers" | "following");
        }
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [activeTab, fetchFollowList]);

  if (loading) {
    return <FullPageLoader label="Loading your Profile..." />;
  }

  if (!profile) {
    return <FullPageLoader label="Loading your Profile..." />;
  }

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex items-center gap-8">
          {(Object.keys(tabLabels) as TabKey[]).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className="group pb-2 text-md font-semibold transition-colors"
            >
              <span
                className={[
                  "inline-block border-b-[3px] pb-2 transition-colors",
                  activeTab === tab
                    ? "border-emerald-600 text-emerald-600"
                    : "border-transparent text-muted-foreground group-hover:text-foreground",
                ].join(" ")}
              >
                {tabLabels[tab]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Profile tab */}
      {activeTab === "profile" && (
        <div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-10">
            <InfoCards
              title="Posts"
              value={profile.posts_count}
              description="Total posts"
            />
            <InfoCards
              title="Viewed posts"
              value={profile.viewed_posts_count}
              description="Total viewed posts"
            />
            <InfoCards
              title="Followers"
              value={profile.followers_count}
              description="Total followers"
            />
            <InfoCards
              title="Following"
              value={profile.followings_count}
              description="Total following"
            />
          </div>

          <ProfileForm
            profile={profile}
            onUpdated={updated => setProfile(updated)}
          />

          <section className="mt-10">
            <h2 className="text-lg font-bold text-foreground mb-6 tracking-tight">
              Recent Views
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {viewedPosts.map(post => (
                <PostRecentViewCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Followers tab */}
      {activeTab === "followers" && (
        <div className="space-y-3">
          {followLoading ? (
            <p className="text-center py-16 text-sm text-muted-foreground">
              Loading followers...
            </p>
          ) : followList.followers.length === 0 ? (
            <p className="text-center py-16 text-sm text-muted-foreground">
              No followers yet.
            </p>
          ) : (
            followList.followers.map(u => (
              <FollowUserCard key={u.id} user={u} />
            ))
          )}
          {followLoadingMore && (
            <p className="text-center py-2 text-sm text-muted-foreground">
              Loading more...
            </p>
          )}
          <div ref={sentinelRef} className="h-1 w-full" aria-hidden="true" />
        </div>
      )}

      {/* Following tab */}
      {activeTab === "following" && (
        <div className="space-y-3">
          {followLoading ? (
            <p className="text-center py-16 text-sm text-muted-foreground">
              Loading following...
            </p>
          ) : followList.following.length === 0 ? (
            <p className="text-center py-16 text-sm text-muted-foreground">
              Not following anyone yet.
            </p>
          ) : (
            followList.following.map(u => (
              <FollowUserCard key={u.id} user={u} />
            ))
          )}
          {followLoadingMore && (
            <p className="text-center py-2 text-sm text-muted-foreground">
              Loading more...
            </p>
          )}
          <div ref={sentinelRef} className="h-1 w-full" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
