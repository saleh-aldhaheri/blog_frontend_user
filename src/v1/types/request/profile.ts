export type UpdateProfileRequest = {
  name?: string
  email?: string
  avatar?: File
}

export type ChangePasswordRequest = {
  current_password: string
  password: string
  password_confirmation: string
}

export type UpdateProfilePayload = UpdateProfileRequest

export type ChangePasswordPayload = ChangePasswordRequest
