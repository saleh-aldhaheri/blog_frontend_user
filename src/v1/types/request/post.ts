export type PostContentBlockInput = {
  type: "heading" | "text" | "media";
  order: number;
  value?: string;
  file?: File;
};

export type CreatePostRequest = {
  title: string;
  categoryId: number;
  status?: "draft" | "published";
  /** Featured image (OpenAPI field name: `thumbnails`) */
  thumbnails: File;
  content: PostContentBlockInput[];
};

export type UpdatePostRequest = {
  categoryId: number;
  title?: string;
  status?: "draft" | "published";
  thumbnails?: File;
  /** Replacement blocks; omit or null to leave unchanged. */
  content?: PostContentBlockInput[] | null;
};

export type PostListQuery = {
  search?: string;
  status?: "draft" | "published";
  limit?: number;
  cursor?: string | null;
};

export type CreatePostPayload = CreatePostRequest;

export type UpdatePostPayload = UpdatePostRequest;
