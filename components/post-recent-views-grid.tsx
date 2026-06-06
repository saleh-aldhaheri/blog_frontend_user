// src/components/post/post-recent-view-card.tsx
import { PostListItem } from "@/src/v1/types/response/post";
import { Link } from "@/lib/next-compat";

interface PostRecentViewCardProps {
  post: PostListItem;
}

function PostRecentViewCard({ post }: PostRecentViewCardProps) {
  return (
    <Link
      href={`/posts/${post.id}`}
      className="group flex flex-col cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-[4/3] overflow-hidden rounded-lg bg-surface-muted">
        {post.thumbnail ? (
          <img
            src={post.thumbnail}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-surface-muted flex items-center justify-center">
            <span className="text-muted text-sm">No image</span>
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="mt-3 flex flex-col gap-1">
        <span className="text-xs font-bold uppercase tracking-widest text-primary">
          {post.category?.name ?? "Uncategorized"}
        </span>

        <h3 className="text-base font-bold text-foreground leading-snug group-hover:underline underline-offset-2 line-clamp-2">
          {post.title}
        </h3>

        {post.user?.name && (
          <p className="text-sm text-muted">By {post.user.name}</p>
        )}
      </div>
    </Link>
  );
}

export default PostRecentViewCard;
