
import { useState, type ComponentType } from "react";
import {
  Heart,
  MessageCircle,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import { Link } from "@/lib/next-compat";

import type { Comment } from "@/src/v1/types/response/comment";
import type { InteractionType } from "@/src/v1/types/response/social";
import { Button } from "@/components/ui/button";

type PostCommentItemProps = {
  comment: Comment;
  onReact: (commentId: number, action: InteractionType) => void;
  onUpdate: (commentId: number, content: string) => void;
  onDelete: (commentId: number) => void;
  canManage: boolean;
  currentUserId: number | null;
  disabledReact?: boolean;
  disabledManage?: boolean;
};

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

function initials(name: string) {
  return name
    .split(" ")
    .map(part => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
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

export default function PostCommentItem({
  comment,
  onReact,
  onUpdate,
  onDelete,
  canManage,
  currentUserId,
  disabledReact = false,
  disabledManage = false,
}: PostCommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(comment.content);
  const activeReaction = comment.my_interaction?.action ?? null;

  return (
    <article className="space-y-3 rounded-xl border border-border/80 bg-surface/70 p-4">
      <div className="flex items-center gap-3">
        {comment.user.avatar ? (
          <img
            src={comment.user.avatar}
            alt={comment.user.name}
            className="size-9 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
            {initials(comment.user.name)}
          </div>
        )}
        <div>
          {currentUserId !== null && currentUserId !== comment.user_id ? (
            <Link
              href={`/users/${comment.user.id}`}
              className="text-sm font-medium text-foreground hover:underline"
            >
              {comment.user.name}
            </Link>
          ) : (
            <p className="text-sm font-medium text-foreground">
              {comment.user.name}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {formatDate(comment.created_at)}
          </p>
        </div>
      </div>
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={draft}
            onChange={event => setDraft(event.target.value)}
            className="min-h-20 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              size="xs"
              variant="ghost"
              onClick={() => {
                setDraft(comment.content);
                setIsEditing(false);
              }}
              disabled={disabledManage}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="xs"
              onClick={() => {
                onUpdate(comment.id, draft);
                setIsEditing(false);
              }}
              disabled={disabledManage || !draft.trim()}
            >
              Save
            </Button>
          </div>
        </div>
      ) : (
        <p className="whitespace-pre-line text-sm leading-7 text-foreground/90">
          {comment.content}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {interactionItems.map(({ type, icon: Icon, label }) => (
          <Button
            key={type}
            type="button"
            variant={activeReaction === type ? "default" : "outline"}
            size="xs"
            disabled={disabledReact}
            onClick={() => onReact(comment.id, type)}
            className="rounded-full"
          >
            <Icon className="size-3.5" />
            {label} {comment.interaction_counts[type]}
          </Button>
        ))}
      </div>

      {canManage && !isEditing ? (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            type="button"
            size="xs"
            variant="ghost"
            onClick={() => setIsEditing(true)}
            disabled={disabledManage}
          >
            Edit
          </Button>
          <Button
            type="button"
            size="xs"
            variant="destructive"
            onClick={() => onDelete(comment.id)}
            disabled={disabledManage}
          >
            <Trash2 className="size-3.5" />
            Delete
          </Button>
        </div>
      ) : null}
    </article>
  );
}
