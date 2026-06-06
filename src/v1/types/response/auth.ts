import type { User } from './user'

/** 200: `data` for POST /api/v1/login and POST /api/v1/admin/login */
export interface AuthData {
  token: string
  user: User
}

/** 201: `data` for POST /api/v1/register */
export interface RegisterData {
  id: number
  name: string
  email: string
  role: 'user' | 'admin'
}
