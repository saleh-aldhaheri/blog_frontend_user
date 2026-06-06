import type { LoginRequest } from '@/src/v1/types/request/auth'
import type { AdminLoginSuccess } from '@/src/v1/types/response/success'
import apiClient from './api-client'

export const adminAuthApi = {
  login: (data: LoginRequest) =>
    apiClient.post<AdminLoginSuccess>('/admin/login', data, {
      skipAuth: true,
    }),

  logout: () => apiClient.post('/admin/logout'),
}
