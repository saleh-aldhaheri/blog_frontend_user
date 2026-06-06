/** 200: `data` for GET/PUT /api/v1/profile */
export interface Profile {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  role: 'user' | 'admin'
  posts_count: number
  viewed_posts_count: number
  followers_count: number
  followings_count: number
  avatar: string | null
  is_followed?: boolean
}
