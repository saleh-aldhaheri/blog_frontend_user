import type {
  CreatePostRequest,
  PostListQuery,
  UpdatePostRequest,
} from '@/src/v1/types/request/post'

import type {
  CreatePostSuccess,
  ListPublishedPostsSuccess,
  ListUserPostsSuccess,
  ListViewedPostsSuccess,
  ShowPostSuccess,
  UpdatePostSuccess,
} from '@/src/v1/types/response/success'
import apiClient from './api-client'

function buildCreatePostFormData(data: CreatePostRequest): FormData {
  const fd = new FormData()
  fd.append('title', data.title)
  fd.append('categoryId', String(data.categoryId))
  if (data.status) fd.append('status', data.status)
  fd.append('thumbnails', data.thumbnails)
  data.content.forEach((block, index) => {
    fd.append(`content[${index}][type]`, block.type)
    fd.append(`content[${index}][order]`, String(block.order))
    if (typeof block.value === 'string') {
      fd.append(`content[${index}][value]`, block.value)
    }
    if (block.file instanceof File) {
      fd.append(`content[${index}][file]`, block.file)
    }
  })
  return fd
}

function buildUpdatePostFormData(data: UpdatePostRequest): FormData {
  const fd = new FormData()
  fd.append('categoryId', String(data.categoryId))
  if (data.title !== undefined) fd.append('title', data.title)
  if (data.status !== undefined) fd.append('status', data.status)
  if (data.thumbnails instanceof File) {
    fd.append('thumbnails', data.thumbnails)
  }
  if (data.content !== undefined && data.content !== null) {
    data.content.forEach((block, index) => {
      fd.append(`content[${index}][type]`, block.type)
      fd.append(`content[${index}][order]`, String(block.order))
      if (typeof block.value === 'string') {
        fd.append(`content[${index}][value]`, block.value)
      }
      if (block.file instanceof File) {
        fd.append(`content[${index}][file]`, block.file)
      }
    })
  }
  return fd
}

export const postApi = {
  getPosts: (params?: PostListQuery) =>
    apiClient.get<ListPublishedPostsSuccess>('/posts', { params }),

  getViewedPosts: (params?: PostListQuery) =>
    apiClient.get<ListViewedPostsSuccess>('/posts/viewed', { params }),

  getUserPosts: (userId: number, params?: PostListQuery) =>
    apiClient.get<ListUserPostsSuccess>(`/users/${userId}/posts`, { params }),

  getPost: (id: number) =>
    apiClient.get<ShowPostSuccess>(`/posts/${id}`),

  createPost: (data: CreatePostRequest) =>
    apiClient.post<CreatePostSuccess>('/posts', buildCreatePostFormData(data)),

  createPostForm: (formData: FormData) =>
    apiClient.post<CreatePostSuccess>('/posts', formData),

  updatePost: (id: number, data: UpdatePostRequest) =>
    apiClient.put<UpdatePostSuccess>(`/posts/${id}`, buildUpdatePostFormData(data)),

  updatePostForm: (id: number, formData: FormData) =>
    apiClient.put<UpdatePostSuccess>(`/posts/${id}`, formData),

  deletePost: (id: number) => apiClient.delete(`/posts/${id}`),
}

export default postApi
