/** Wraps one resource: `{ "data": { ... } }` (common in Laravel JSON APIs) */
export interface ApiEnvelope<T> {
  data: T;
}

export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

/** Matches typical Laravel cursor meta */
export interface PaginationMeta {
  path: string;
  per_page: number;
  next_cursor: string | null;
  prev_cursor: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

export interface DataList<T> {
  data: T[];
}
