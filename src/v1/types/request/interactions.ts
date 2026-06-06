import type { InteractionType } from '@/src/v1/types/response/social'

export type CreateInteractionRequest = {
  action: InteractionType
}

export type InteractionPayload = CreateInteractionRequest
