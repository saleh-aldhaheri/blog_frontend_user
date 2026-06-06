import type {
  CommentListQuery,
  CommentRequest,
} from '@/src/v1/types/request/comment'
import type {
  CreateCommentSuccess,
  ListPostCommentsSuccess,
  UpdateCommentSuccess,
} from '@/src/v1/types/response/success'
import apiClient from './api-client'

export type { CommentRequest as CommentPayload } from '@/src/v1/types/request/comment'

export const commentApi = {
  getComments: (postId: number, params?: CommentListQuery) =>
    apiClient.get<ListPostCommentsSuccess>(`/posts/${postId}/comments`, {
      params,
    }),

  createComment: (postId: number, data: CommentRequest) =>
    apiClient.post<CreateCommentSuccess>(`/posts/${postId}/comments`, data),

  updateComment: (id: number, data: CommentRequest) =>
    apiClient.put<UpdateCommentSuccess>(`/comments/${id}`, data),

  deleteComment: (id: number) => apiClient.delete(`/comments/${id}`),
}
