/**
 * Named **success-only** response bodies (2xx) from the OpenAPI spec.
 * Error responses (401, 403, 422, …) are intentionally not modeled here.
 */
import type { ApiEnvelope, PaginatedResponse, DataList } from "./api";
import type { AuthData, RegisterData } from "./auth";
import { Category } from "./category";
import type { Comment } from "./comment";
import type { InteractionRecord } from "./interaction";
import { NotificationItem } from "./notification";
import type { PostDetail, PostListItem } from "./post";
import type { Profile } from "./profile";
import type { UserBasic } from "./user";

// —— Auth ——
/** POST /api/v1/admin/login 200 */
export type AdminLoginSuccess = ApiEnvelope<AuthData>;
/** POST /api/v1/login 200 */
export type UserLoginSuccess = ApiEnvelope<AuthData>;
/** POST /api/v1/register 201 */
export type RegisterSuccess = ApiEnvelope<RegisterData>;

// —— Profile ——
/** GET /api/v1/profile 200 */
export type GetProfileSuccess = ApiEnvelope<Profile>;
/** PUT /api/v1/profile 200 */
export type UpdateProfileSuccess = ApiEnvelope<Profile>;

// —— Posts ——
/** GET /api/v1/posts 200 */
export type ListPublishedPostsSuccess = PaginatedResponse<PostListItem>;
/** GET /api/v1/posts/viewed 200 */
export type ListViewedPostsSuccess = PaginatedResponse<PostListItem>;
/** GET /api/v1/users/{user_id}/posts 200 */
export type ListUserPostsSuccess = PaginatedResponse<PostListItem>;
/** GET /api/v1/posts/{id} 200 */
export type ShowPostSuccess = ApiEnvelope<PostDetail>;
/** POST /api/v1/posts 201 */
export type CreatePostSuccess = ApiEnvelope<PostDetail>;
/** PUT /api/v1/posts/{id} 200 */
export type UpdatePostSuccess = ApiEnvelope<PostDetail>;

// —— Comments ——
/** GET /api/v1/posts/{post_id}/comments 200 */
export type ListPostCommentsSuccess = PaginatedResponse<Comment>;
/** POST /api/v1/posts/{post_id}/comments 201 */
export type CreateCommentSuccess = ApiEnvelope<Comment>;
/** PUT /api/v1/comments/{id} 200 */
export type UpdateCommentSuccess = ApiEnvelope<Comment>;

// —— Interactions ——
/** POST /api/v1/posts/{post_id}/interactions 201 */
export type CreatePostInteractionSuccess = ApiEnvelope<InteractionRecord>;
/** POST /api/v1/comments/{comment_id}/interactions 201 */
export type CreateCommentInteractionSuccess = ApiEnvelope<InteractionRecord>;

// —— Follow ——
/** GET /api/v1/follow/following 200 */
export type ListFollowingSuccess = PaginatedResponse<UserBasic>;
/** GET /api/v1/follow/followers 200 */
export type ListFollowersSuccess = PaginatedResponse<UserBasic>;

// —— Category ——
/** GET /api/v1/categories 200 */
export type ListCategorySuccess = DataList<Category>;


export type ListNotificationsSuccess = PaginatedResponse<NotificationItem>;