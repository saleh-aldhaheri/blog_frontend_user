import type { CreateInteractionRequest } from '@/src/v1/types/request/interactions'
import type {
  CreateCommentInteractionSuccess,
  CreatePostInteractionSuccess,
} from '@/src/v1/types/response/success'
import apiClient from './api-client'

export const postInteractionApi = {
  create: (postId: number, data: CreateInteractionRequest) =>
    apiClient.post<CreatePostInteractionSuccess>(
      `/posts/${postId}/interactions`,
      data,
    ),

  remove: (postId: number, interactionId: number) =>
    apiClient.delete(`/posts/${postId}/interactions/${interactionId}`),
}

export const commentInteractionApi = {
  create: (commentId: number, data: CreateInteractionRequest) =>
    apiClient.post<CreateCommentInteractionSuccess>(
      `/comments/${commentId}/interactions`,
      data,
    ),

  remove: (commentId: number, interactionId: number) =>
    apiClient.delete(
      `/comments/${commentId}/interactions/${interactionId}`,
    ),
}

const interactions = {
  PostInteractionApi: postInteractionApi,
  CommentInteractionApi: commentInteractionApi,
}

export default interactions
