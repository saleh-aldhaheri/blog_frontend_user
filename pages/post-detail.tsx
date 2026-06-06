
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
} from "react";
import { useParams } from "@/lib/next-compat";
import axios from "axios";
import { toast } from "sonner";
import {
  Heart,
  MessageCircle,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import FullPageLoader from "@/components/full-page-loader";
import { commentApi } from "@/src/v1/api/comment.api";
import { postInteractionApi } from "@/src/v1/api/interactions.api";
import PostCommentsList from "@/components/post-comments-list";
import PostContentRenderer from "@/components/post-content-renderer";
import UserFollowSummary from "@/components/user-follow-summary";
import type { InteractionRecord } from "@/src/v1/types/response/interaction";
import type { PostDetail } from "@/src/v1/types/response/post";
import type { InteractionType } from "@/src/v1/types/response/social";
import { useCurrentUser } from "@/src/context/user.context";
import postApi from "@/src/v1/api/post.api";
import BackButton from "@/components/ui/back-button";

const interactionItems: Array<{
  type: InteractionType;
  icon: ComponentType<{ className?: string }>;
  label: string;
}> = [
  { type: "like", icon: ThumbsUp, label: "Like" },
  { type: "love", icon: Heart, label: "Love" },
  { type: "wow", icon: Sparkles, label: "Wow" },
  { type: "dislike", icon: ThumbsDown, label: "Dislike" },
  { type: "hate", icon: MessageCircle, label: "Hate" },
];

const VALID_INTERACTIONS: InteractionType[] = [
  "like",
  "love",
  "wow",
  "dislike",
  "hate",
];

function parsePostId(id: string | string[] | undefined) {
  const raw = Array.isArray(id) ? id[0] : id;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function applyPostInteraction(
  post: PostDetail,
  action: InteractionType,
): PostDetail {
  const previous = (post.my_interaction?.action as InteractionType | null) ?? null;
  const counts = { ...post.interaction_counts };

  if (previous && previous !== action) {
    counts[previous] = Math.max(0, counts[previous] - 1);
  }
  if (previous !== action) {
    counts[action] = (counts[action] ?? 0) + 1;
  }

  return {
    ...post,
    interaction_counts: counts,
  };
}

function clearPostInteraction(post: PostDetail): PostDetail {
  const previous = (post.my_interaction?.action as InteractionType | null) ?? null;
  if (!previous) return post;
  return {
    ...post,
    my_interaction: null,
    interaction_counts: {
      ...post.interaction_counts,
      [previous]: Math.max(0, post.interaction_counts[previous] - 1),
    },
  };
}

function getPostInteraction(post: PostDetail): {
  id: number | null;
  action: InteractionType | null;
} {
  if (!post.my_interaction) {
    return { id: null, action: null };
  }
  const raw = post.my_interaction as unknown as Record<string, unknown>;
  const rawId = raw.id ?? raw.interaction_id ?? raw.interactionId;
  const parsedId =
    typeof rawId === "number"
      ? rawId
      : typeof rawId === "string"
        ? Number(rawId)
        : Number.NaN;

  const rawAction = raw.action ?? raw.type ?? raw.reaction;
  const normalizedAction =
    typeof rawAction === "string" ? rawAction.toLowerCase() : null;

  return {
    id: Number.isFinite(parsedId) ? parsedId : null,
    action:
      normalizedAction &&
      VALID_INTERACTIONS.includes(normalizedAction as InteractionType)
        ? (normalizedAction as InteractionType)
        : null,
  };
}

export default function Post() {
  const params = useParams();
  const postId = useMemo(() => parsePostId(params.id), [params.id]);

  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<PostDetail | null>(null);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isSubmittingReaction, setIsSubmittingReaction] = useState(false);
  const [commentsRefreshKey, setCommentsRefreshKey] = useState(0);
  const { user } = useCurrentUser();

  const fetchPost = useCallback(async () => {
    try {
      if (!postId) throw new Error("Invalid post id");
      const res = await postApi.getPost(postId);
      setPost(res.data.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message =
          (err.response?.data as { message?: string } | undefined)?.message ??
          err.message;
        toast.error(message);
      } else {
        toast.error("Something went wrong while loading this post.");
      }
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const handleCreateComment = useCallback(async () => {
    const value = commentText.trim();
    if (!value) {
      toast.error("Comment cannot be empty.");
      return;
    }
    if (!postId) return;

    try {
      setIsSubmittingComment(true);
      await commentApi.createComment(postId, { comment: value });
      setCommentText("");
      setCommentsRefreshKey(prev => prev + 1);
      setPost(prev =>
        prev ? { ...prev, comments_count: prev.comments_count + 1 } : prev,
      );
      toast.success("Comment added.");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message =
          (err.response?.data as { message?: string } | undefined)?.message ??
          err.message;
        toast.error(message);
      } else {
        toast.error("Unable to add your comment right now.");
      }
    } finally {
      setIsSubmittingComment(false);
    }
  }, [commentText, postId]);

  const handlePostInteraction = useCallback(
    async (action: InteractionType) => {
      if (!postId || !post) return;
      try {
        setIsSubmittingReaction(true);
        const current = getPostInteraction(post);

        if (current.action === action) {
          if (!current.id) {
            toast.error(
              "Unable to remove previous reaction. Refresh and try again.",
            );
            return;
          }
          await postInteractionApi.remove(postId, current.id);
          setPost(prev => (prev ? clearPostInteraction(prev) : prev));
          return;
        }

        const res = await postInteractionApi.create(postId, { action });
        const interaction: InteractionRecord = res.data.data;
        setPost(prev =>
          prev
            ? {
                ...applyPostInteraction(prev, action),
                my_interaction: interaction,
              }
            : prev,
        );
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const message =
            (err.response?.data as { message?: string } | undefined)?.message ??
            err.message;
          toast.error(message);
        } else {
          toast.error("Unable to react to this post right now.");
        }
      } finally {
        setIsSubmittingReaction(false);
      }
    },
    [post, postId],
  );

  useEffect(() => {
    const start = window.setTimeout(() => {
      void fetchPost();
    }, 0);
    return () => window.clearTimeout(start);
  }, [fetchPost]);

  if (loading) {
    return <FullPageLoader label="Loading post..." />;
  }

  if (!post) {
    return (
      <div className="rounded-xl border border-dashed border-border p-6 text-center text-muted-foreground">
        Post not found.
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <BackButton />
      <article className="space-y-6">
        {post.thumbnail ? (
          <div className="overflow-hidden rounded-3xl border border-border">
            <img
              src={post.thumbnail}
              alt={post.title}
              className="h-72 w-full object-cover"
            />
          </div>
        ) : null}

        <header className="space-y-3">
          <UserFollowSummary
            key={post.user.id}
            user={post.user}
            currentUserId={user?.id ?? null}
            initialFollowing={post.user.is_followed ?? false}
          />
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {post.category.name} - {formatDate(post.created_at)}
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">
            {post.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {post.comments_count} comments
          </p>
        </header>

        <div className="flex flex-wrap gap-2">
          {interactionItems.map(({ type, icon: Icon, label }) => (
            <Button
              key={type}
              type="button"
              variant={
                getPostInteraction(post).action === type ? "default" : "outline"
              }
              size="sm"
              disabled={isSubmittingReaction}
              onClick={() => handlePostInteraction(type)}
              className="rounded-full"
            >
              <Icon className="size-4" />
              {label} {post.interaction_counts[type]}
            </Button>
          ))}
        </div>

        <PostContentRenderer blocks={post.content} postTitle={post.title} />
      </article>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Comments</h2>

        <div className="rounded-2xl border border-border bg-surface/70 p-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
              YOU
            </div>
            <div className="flex-1 space-y-3">
              <textarea
                value={commentText}
                onChange={event => setCommentText(event.target.value)}
                placeholder="Add a comment..."
                className="min-h-24 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setCommentText("")}
                  disabled={isSubmittingComment}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleCreateComment}
                  disabled={isSubmittingComment}
                >
                  {isSubmittingComment ? "Posting..." : "Comment"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {postId ? (
          <PostCommentsList
            postId={postId}
            refreshKey={commentsRefreshKey}
            currentUserId={user?.id ?? null}
          />
        ) : null}
      </section>
    </div>
  );
}