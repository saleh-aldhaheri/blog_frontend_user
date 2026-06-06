import type { FollowListQuery } from '@/src/v1/types/request/follow'
import type {
  ListFollowersSuccess,
  ListFollowingSuccess,
} from '@/src/v1/types/response/success'
import apiClient from './api-client'

export const followApi = {
  getFollowers: (params?: FollowListQuery) =>
    apiClient.get<ListFollowersSuccess>('/follow/followers', { params }),

  getFollowing: (params?: FollowListQuery) =>
    apiClient.get<ListFollowingSuccess>('/follow/following', { params }),

  followUser: (userId: number) =>
    apiClient.put(`/follow/following/follow/${userId}`),

  unfollowUser: (userId: number) =>
    apiClient.put(`/follow/following/unfollow/${userId}`),
}

export const FollowApi = followApi
