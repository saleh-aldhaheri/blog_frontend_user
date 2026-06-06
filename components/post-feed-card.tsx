
import { MessageCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import type { PostListItem } from '@/src/v1/types/response/post'
import { Link } from "@/lib/next-compat";

type PostFeedCardProps = {
  post: PostListItem
  actions?: ReactNode
}

const interactionOrder: Array<keyof PostListItem['interaction_counts']> = [
  'like',
  'love',
  'wow',
  'dislike',
  'hate',
]

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Recently'
  }
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatStatus(status: string) {
  const normalized = status.toLowerCase()
  return normalized === 'published' ? 'Published' : 'Draft'
}

export default function PostFeedCard({ post, actions }: PostFeedCardProps) {
  const initials = post.user.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <>
      <article className="overflow-hidden transition-all duration-200 hover:-translate-y-0.5">
        <div className="relative">
          <Link href={`/posts/${post.id}`} className="group block">
            {post.thumbnail ? (
              <img src={post.thumbnail} alt={post.title} className="h-56 w-full object-cover" />
            ) : (
              <div className="h-56 w-full bg-gradient-to-br from-zinc-200 via-zinc-100 to-zinc-300 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-700" />
            )}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/45 to-transparent" />
          </Link>
          <Link
            href={`/users/${post.user.id}`}
            className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-black/40 px-2.5 py-1.5 text-white backdrop-blur-sm ring-1 ring-white/15"
          >
            {post.user.avatar ? (
              <img
                src={post.user.avatar}
                alt={post.user.name}
                className="size-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex size-8 items-center justify-center rounded-full bg-white/90 text-xs font-bold text-zinc-900 dark:bg-zinc-950/85 dark:text-zinc-100">
                {initials}
              </div>
            )}
            <span className="text-sm font-medium">{post.user.name}</span>
          </Link>
        </div>

        <div className="space-y-5 p-5">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span
              className={[
                'rounded-md px-2 py-1 font-medium',
                post.status.toLowerCase() === 'published'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
              ].join(' ')}
            >
              {post.status.toLowerCase() === 'published' ? 'Published' : 'Draft'}
            </span>
            <span className="rounded-md bg-accent px-2 py-1 font-medium text-foreground">
              {post.category.name}
            </span>
            <span>{new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <Link href={`/posts/${post.id}`} className="block">
            <h2 className="text-2xl font-semibold leading-tight text-foreground">
              {post.title}
            </h2>
          </Link>
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-muted-foreground">
            {interactionOrder.map((type) => (
              <span key={type} className="rounded-full bg-accent px-2 py-1 capitalize">
                {type}: {post.interaction_counts[type]}
              </span>
            ))}
            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-1">
              <MessageCircle className="size-3.5" />
              comments: {post.comments_count ?? 0}
            </span>
          </div>
          {actions ? <div className="flex items-center gap-2 pt-2">{actions}</div> : null}
        </div>
      </article>
      <hr className="p-5" />
    </>
  )
}
