
import { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { toast } from 'sonner'

import { commentApi } from '@/src/v1/api/comment.api'
import { commentInteractionApi } from '@/src/v1/api/interactions.api'
import type { Comment } from '@/src/v1/types/response/comment'
import type { InteractionRecord } from '@/src/v1/types/response/interaction'
import type { InteractionType } from '@/src/v1/types/response/social'
import PostCommentItem from '@/components/post-comment-item'

type PostCommentsListProps = {
  postId: number
  refreshKey?: number
  currentUserId: number | null
}

const VALID_INTERACTIONS: InteractionType[] = ['like', 'love', 'wow', 'dislike', 'hate']

function getCurrentReaction(comment: Comment): {
  id: number | null
  action: InteractionType | null
} {
  if (!comment.my_interaction) {
    return { id: null, action: null }
  }
  const raw = comment.my_interaction as unknown as Record<string, unknown>
  const rawId = raw.id ?? raw.interaction_id ?? raw.interactionId
  const parsedId =
    typeof rawId === 'number'
      ? rawId
      : typeof rawId === 'string'
        ? Number(rawId)
        : Number.NaN

  const rawAction = raw.action ?? raw.type ?? raw.reaction
  const normalizedAction =
    typeof rawAction === 'string' ? rawAction.toLowerCase() : null

  return {
    id: Number.isFinite(parsedId) ? parsedId : null,
    action:
      normalizedAction && VALID_INTERACTIONS.includes(normalizedAction as InteractionType)
        ? (normalizedAction as InteractionType)
        : null,
  }
}

function updateCommentInteraction(comment: Comment, action: InteractionType, id: number): Comment {
  const previous = getCurrentReaction(comment).action
  const nextCounts = { ...comment.interaction_counts }

  if (previous && previous !== action) {
    nextCounts[previous] = Math.max(0, nextCounts[previous] - 1)
  }
  if (previous !== action) {
    nextCounts[action] = (nextCounts[action] ?? 0) + 1
  }

  return {
    ...comment,
    interaction_counts: nextCounts,
    my_interaction: { id, action } as unknown as InteractionRecord,
  }
}

function clearCommentInteraction(comment: Comment): Comment {
  const previous = getCurrentReaction(comment).action
  if (!previous) return comment
  return {
    ...comment,
    interaction_counts: {
      ...comment.interaction_counts,
      [previous]: Math.max(0, comment.interaction_counts[previous] - 1),
    },
    my_interaction: null,
  }
}

export default function PostCommentsList({
  postId,
  refreshKey = 0,
  currentUserId,
}: PostCommentsListProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [reactingCommentId, setReactingCommentId] = useState<number | null>(null)

  const cursorRef = useRef<string | null>(null)
  const loadingRef = useRef(false)
  const hasMoreRef = useRef(true)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const loadComments = useCallback(
    async (reset = false) => {
      if (!reset && (loadingRef.current || !hasMoreRef.current)) return

      try {
        loadingRef.current = true
        setLoading(true)

        const res = await commentApi.getComments(postId, {
          cursor: reset ? null : cursorRef.current,
        })

        const nextItems = res.data.data
        const nextCursor = res.data.meta.next_cursor

        cursorRef.current = nextCursor
        hasMoreRef.current = Boolean(nextCursor)
        setHasMore(Boolean(nextCursor))
        setComments((prev) => (reset ? nextItems : [...prev, ...nextItems]))
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const message =
            (err.response?.data as { message?: string } | undefined)?.message ??
            err.message
          toast.error(message)
        } else {
          toast.error('Unable to load comments right now.')
        }
      } finally {
        loadingRef.current = false
        setLoading(false)
      }
    },
    [postId],
  )

  const handleCommentReaction = useCallback(
    async (commentId: number, action: InteractionType) => {
      setReactingCommentId(commentId)
      try {
        const target = comments.find((item) => item.id === commentId)
        if (!target) return

        const current = getCurrentReaction(target)
        if (current.action === action) {
          if (!current.id) {
            toast.error('Unable to remove previous reaction. Refresh and try again.')
            return
          }
          await commentInteractionApi.remove(commentId, current.id)
          setComments((prev) =>
            prev.map((item) => (item.id === commentId ? clearCommentInteraction(item) : item)),
          )
          return
        }

        const res = await commentInteractionApi.create(commentId, { action })
        setComments((prev) =>
          prev.map((item) =>
            item.id === commentId
              ? updateCommentInteraction(item, action, res.data.data.id)
              : item,
          ),
        )
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const message =
            (err.response?.data as { message?: string } | undefined)?.message ??
            err.message
          toast.error(message)
        } else {
          toast.error('Unable to react to this comment right now.')
        }
      } finally {
        setReactingCommentId(null)
      }
    },
    [comments],
  )

  const handleCommentUpdate = useCallback(async (commentId: number, content: string) => {
    const next = content.trim()
    if (!next) {
      toast.error('Comment cannot be empty.')
      return
    }
    try {
      await commentApi.updateComment(commentId, { comment: next })
      setComments((prev) =>
        prev.map((item) => (item.id === commentId ? { ...item, content: next } : item)),
      )
      toast.success('Comment updated.')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message =
          (err.response?.data as { message?: string } | undefined)?.message ??
          err.message
        toast.error(message)
      } else {
        toast.error('Unable to update this comment right now.')
      }
    }
  }, [])

  const handleCommentDelete = useCallback(async (commentId: number) => {
    try {
      await commentApi.deleteComment(commentId)
      setComments((prev) => prev.filter((item) => item.id !== commentId))
      toast.success('Comment deleted.')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message =
          (err.response?.data as { message?: string } | undefined)?.message ??
          err.message
        toast.error(message)
      } else {
        toast.error('Unable to delete this comment right now.')
      }
    }
  }, [])

  useEffect(() => {
    const start = window.setTimeout(() => {
      cursorRef.current = null
      hasMoreRef.current = true
      setHasMore(true)
      setComments([])
      void loadComments(true)
    }, 0)

    return () => window.clearTimeout(start)
  }, [loadComments, refreshKey])

  useEffect(() => {
    const node = sentinelRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting) {
          void loadComments()
        }
      },
      { rootMargin: '200px 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [loadComments])

  return (
    <section className="space-y-4">
      {comments.map((comment) => (
        <PostCommentItem
          key={comment.id}
          comment={comment}
          onReact={handleCommentReaction}
          onUpdate={handleCommentUpdate}
          onDelete={handleCommentDelete}
          canManage={currentUserId === comment.user_id}
          currentUserId={currentUserId}
          disabledReact={reactingCommentId === comment.id}
          disabledManage={false}
        />
      ))}

      {loading ? (
        <p className="text-center text-sm text-muted-foreground">Loading comments...</p>
      ) : null}

      {!loading && comments.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
          No comments yet. Be the first to comment.
        </p>
      ) : null}

      {!hasMore && comments.length > 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          You have reached the end of comments.
        </p>
      ) : null}

      <div ref={sentinelRef} className="h-1 w-full" aria-hidden="true" />
    </section>
  )
}