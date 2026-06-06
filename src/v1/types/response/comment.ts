import type { UserBasic } from './user'
import type { InteractionCounts } from './social'
import type { InteractionRecord } from './interaction'

export interface Comment {
  id: number
  content: string
  post_id: number
  user_id: number
  user: UserBasic
  interaction_counts: InteractionCounts
  my_interaction: InteractionRecord | null
  created_at: string
  updated_at: string
}
