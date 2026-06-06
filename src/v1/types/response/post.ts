import { InteractionRecord } from "./interaction";
import type { InteractionCounts } from "./social";
import type { UserBasic } from "./user";
import type { Category } from "./category";

export type PostStatus = "draft" | "published";

export type PostContentBlock = {
  type: "heading" | "text" | "media";
  order: number;
  value?: string;
  file?: string;
  [key: string]: unknown;
};

export interface PostListItem {
  id: number;
  title: string;
  status: PostStatus | string;
  user: UserBasic;
  category: Category;
  thumbnail: string;
  interaction_counts: InteractionCounts;
  my_interaction: InteractionRecord | null;
  comments_count?: number;
  created_at: string;
  updated_at: string;
}

/** Single post (detail / create 201 / update 200). */
export interface PostDetail {
  id: number;
  title: string;
  content: PostContentBlock[];
  status: PostStatus | string;
  user_id: number;
  category_id: number;
  user: UserBasic;
  category: Category;
  thumbnail: string;
  interaction_counts: InteractionCounts;
  my_interaction: InteractionRecord | null;
  comments_count: number;
  created_at: string;
  updated_at: string;
}
