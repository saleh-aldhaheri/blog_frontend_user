
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Link } from "@/lib/next-compat";

import { Button } from '@/components/ui/button'
import { followApi } from '@/src/v1/api/follows.api'
import type { UserBasic } from '@/src/v1/types/response/user'

type UserFollowSummaryProps = {
  user: UserBasic
  currentUserId: number | null
  initialFollowing?: boolean
}

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function UserFollowSummary({
  user,
  currentUserId,
  initialFollowing = user.is_followed ?? false,
}: UserFollowSummaryProps) {
  const isOwner = useMemo(
    () => currentUserId !== null && currentUserId === user.id,
    [currentUserId, user.id],
  )
  const [isFollowing, setIsFollowing] = useState(() => initialFollowing)
  const [busy, setBusy] = useState(false)

  const toggleFollow = async () => {
    if (busy || isOwner) return
    try {
      setBusy(true)
      if (isFollowing) {
        await followApi.unfollowUser(user.id)
        setIsFollowing(false)
      } else {
        await followApi.followUser(user.id)
        setIsFollowing(true)
      }
    } catch {
      toast.error('Unable to update follow status right now.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0 flex items-center gap-3">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="size-9 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
            {initials(user.name)}
          </div>
        )}
        {isOwner ? (
          <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
        ) : (
          <Link
            href={`/users/${user.id}`}
            className="truncate text-sm font-medium text-foreground hover:underline"
          >
            {user.name}
          </Link>
        )}
      </div>
      {!isOwner ? (
        <Button
          type="button"
          size="xs"
          variant={isFollowing ? 'outline' : 'default'}
          onClick={toggleFollow}
          disabled={busy}
          className="rounded-full"
        >
          {isFollowing ? 'Unfollow' : 'Follow'}
        </Button>
      ) : null}
    </div>
  )
}
