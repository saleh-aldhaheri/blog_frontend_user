export type CommentRequest = {
  comment: string
}

export type CommentListQuery = {
  search?: string
  limit?: number
  cursor?: string | null
}

export type CommentPayload = CommentRequest
