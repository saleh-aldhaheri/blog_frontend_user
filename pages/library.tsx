
import { Link } from "@/lib/next-compat";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useCurrentUser } from "@/src/context/user.context";

import PostFeedCard from "@/components/post-feed-card";
import FullPageLoader from "@/components/full-page-loader";
import postApi from "@/src/v1/api/post.api";
import type { PostListItem } from "@/src/v1/types/response/post";

type TabKey = "published" | "drafts" | "viewed";

const tabLabels: Record<TabKey, string> = {
  published: "Published",
  drafts: "Drafts",
  viewed: "Viewed History",
};

const statusByTab: Record<Exclude<TabKey, "viewed">, "published" | "draft"> = {
  published: "published",
  drafts: "draft",
};

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("published");
  const { user } = useCurrentUser();

  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [tabPosts, setTabPosts] = useState<Record<TabKey, PostListItem[]>>({
    published: [],
    drafts: [],
    viewed: [],
  });

  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const cursorRef = useRef<Record<TabKey, string | null>>({
    published: null,
    drafts: null,
    viewed: null,
  });
  const hasMoreRef = useRef<Record<TabKey, boolean>>({
    published: true,
    drafts: true,
    viewed: true,
  });

  const fetchTabPosts = useCallback(
    async (tab: TabKey, reset = false) => {
      if (loadingRef.current) return;
      if (!reset && !hasMoreRef.current[tab]) return;
      if (tab !== "viewed" && !user?.id) return;

      try {
        loadingRef.current = true;
        setLoadingMore(true);
        if (reset) {
          cursorRef.current[tab] = null;
          hasMoreRef.current[tab] = true;
        }

        const params =
          tab === "viewed"
            ? { limit: 5, cursor: cursorRef.current[tab] }
            : {
                limit: 5,
                cursor: cursorRef.current[tab],
                status: statusByTab[tab],
                search: statusByTab[tab],
              };

        const response =
          tab === "viewed"
            ? await postApi.getViewedPosts(params)
            : await postApi.getUserPosts(user?.id as number, params);

        const nextPosts =
          tab === "viewed"
            ? response.data.data
            : response.data.data.filter(
                post => post.status.toLowerCase() === statusByTab[tab],
              );
        const nextCursor = response.data.meta.next_cursor;

        cursorRef.current[tab] = nextCursor;
        hasMoreRef.current[tab] = Boolean(nextCursor);
        setTabPosts(prev => ({
          ...prev,
          [tab]: reset ? nextPosts : [...prev[tab], ...nextPosts],
        }));
      } catch {
        toast.error("Unable to load posts right now.");
      } finally {
        loadingRef.current = false;
        setLoadingMore(false);
        setInitialLoading(false);
      }
    },
    [user?.id],
  );

  useEffect(() => {
    const start = window.setTimeout(() => {
      if (!user?.id && activeTab !== "viewed") {
        setInitialLoading(false);
        return;
      }
      void fetchTabPosts(activeTab, true);
    }, 0);
    return () => window.clearTimeout(start);
  }, [activeTab, user?.id, fetchTabPosts]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          void fetchTabPosts(activeTab);
        }
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [activeTab, fetchTabPosts]);

  const posts = tabPosts[activeTab];

  if (initialLoading) {
    return <FullPageLoader label="Loading library..." />;
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-border">
        <div className="flex items-center gap-8">
          {(Object.keys(tabLabels) as TabKey[]).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                if (!user?.id && tab !== "viewed") {
                  toast.error(
                    "Unable to load your posts right now. Please try again.",
                  );
                  return;
                }
                cursorRef.current[tab] = null;
                hasMoreRef.current[tab] = true;
                setTabPosts(prev => ({ ...prev, [tab]: [] }));
                setActiveTab(tab);
              }}
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

      <div className="space-y-8">
        {posts.map(post => (
          <PostFeedCard
            key={`${activeTab}-${post.id}`}
            post={post}
            actions={
              activeTab !== "viewed" ? (
                <>
                  <Link
                    href={`/posts/${post.id}`}
                    className="inline-flex items-center justify-center rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent/60 transition-colors"
                  >
                    View
                  </Link>
                  <Link
                    href={`/posts/${post.id}/edit`}
                    className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity"
                  >
                    Edit
                  </Link>
                </>
              ) : undefined
            }
          />
        ))}
      </div>

      {loadingMore ? (
        <p className="py-2 text-center text-sm text-muted-foreground">
          Loading more posts...
        </p>
      ) : null}

      {!loadingMore && posts.length === 0 ? (
        <p className="py-2 text-center text-sm text-muted-foreground">
          {!user?.id && activeTab !== "viewed"
            ? "Unable to load your posts right now."
            : activeTab === "published"
              ? "No published posts yet."
              : activeTab === "drafts"
                ? "No draft posts yet."
                : "No viewed posts yet."}
        </p>
      ) : null}

      <div ref={sentinelRef} className="h-1 w-full" aria-hidden="true" />

      <Link
        href="/posts/create"
        className="fixed bottom-8 right-8 inline-flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:scale-105 hover:bg-primary/90"
        aria-label="Create post"
      >
        <Plus className="size-6" />
      </Link>
    </div>
  );
}