/** Full user (login, profile) — includes verification timestamp. */
export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  role: "user";
  avatar?: string;
  is_followed?: boolean;
}

/**
 * Embedded user on posts, comments, follow lists (OpenAPI examples omit
 * `email_verified_at`).
 */
export interface UserBasic {
  id: number;
  name: string;
  email: string;
  role: "user";
  avatar?: string;
  is_followed?: boolean;
}
