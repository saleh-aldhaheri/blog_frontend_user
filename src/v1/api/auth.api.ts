import type { LoginRequest, RegisterRequest } from '@/src/v1/types/request/auth'
import type { RegisterSuccess, UserLoginSuccess } from '@/src/v1/types/response/success'
import apiClient from './api-client'

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<UserLoginSuccess>('/login', data, { skipAuth: true }),

  register: (data: RegisterRequest) =>
    apiClient.post<RegisterSuccess>('/register', data, {
      skipAuth: true,
    }),

  logout: () => apiClient.post('/logout'),
}

export const AuthApi = authApi
