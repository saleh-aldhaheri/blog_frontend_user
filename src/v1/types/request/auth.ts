/**
 * POST /api/v1/admin/login
 * POST /api/v1/login
 */
export type LoginRequest = {
  email: string
  password: string
}

/**
 * POST /api/v1/register
 */
export type RegisterRequest = {
  email: string
  password: string
  name: string
  password_confirmation: string
}

/** @deprecated use LoginRequest */
export type LoginPayload = LoginRequest
/** @deprecated use RegisterRequest */
export type RegisterPayload = RegisterRequest
