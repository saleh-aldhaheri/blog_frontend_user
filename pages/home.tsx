
import postApi from "@/src/v1/api/post.api";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import FullPageLoader from "@/components/full-page-loader";
import type { PostListItem } from "@/src/v1/types/response/post";
import PostFeedCard from "@/components/post-feed-card";

function Home() {
  const [publishedPosts, setPublishedPosts] = useState<PostListItem[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const cursorRef = useRef<string | null>(null);
  const loadingMoreRef = useRef(false);
  const hasMoreRef = useRef(true);

  const fetchPosts = useCallback(async () => {
    if (loadingMoreRef.current || !hasMoreRef.current) return;

    try {
      loadingMoreRef.current = true;
      setLoadingMore(true);
      const response = await postApi.getPosts({
        limit: 5,
        cursor: cursorRef.current,
      });
      const newPosts = response.data.data;
      setPublishedPosts(prev => [...prev, ...newPosts]);

      const nextCursor = response.data.meta.next_cursor;
      cursorRef.current = nextCursor;

      if (!nextCursor) {
        hasMoreRef.current = false;
        setHasMore(false);
      }
    } catch {
      toast.error("Unable to load more posts right now.");
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    const start = window.setTimeout(() => {
      void fetchPosts();
    }, 0);
    return () => window.clearTimeout(start);
  }, [fetchPosts]);

  useEffect(() => {
    const handleScroll = () => {
      const bottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 120;

      if (bottom) {
        void fetchPosts();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchPosts]);

  if (initialLoading) {
    return <FullPageLoader label="Loading your home feed..." />;
  }

  return (
    <div className="space-y-8">
      {publishedPosts.map(post => (
        <PostFeedCard key={post.id} post={post} />
      ))}
      {loadingMore ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          Loading more posts...
        </p>
      ) : null}
      {!hasMore && publishedPosts.length > 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          You are all caught up.
        </p>
      ) : null}
    </div>
  );
}

export default Home;
