import type { InteractionType } from "./social";

/** 201: `data` for POST …/interactions (post or comment). */
export interface InteractionRecord {
  id: number;
  action: InteractionType | string;
  user_id: number;
  interactable_type: string;
  interactable_id: number;
}
