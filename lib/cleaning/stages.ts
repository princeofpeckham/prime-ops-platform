// Pure presentation maps and helpers for cleaning jobs. No Supabase, no React.

import type { Badge } from "@/components/ui/Badge";
import type { CleaningJobItem, CleaningJobStatus, CleaningJobType } from "./types";

type BadgeTone = Parameters<typeof Badge>[0]["tone"];

export const STATUS_ORDER: readonly CleaningJobStatus[] = [
  "pending",
  "dispatched",
  "confirmed",
  "completed",
  "cancelled"
] as const;

export const STATUS_LABEL: Record<CleaningJobStatus, string> = {
  pending: "Pending",
  dispatched: "Dispatched",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled"
};

export const STATUS_TONE: Record<CleaningJobStatus, NonNullable<BadgeTone>> = {
  pending: "warn",
  dispatched: "accent",
  confirmed: "good",
  completed: "muted",
  cancelled: "alert"
};

export const TYPE_LABEL: Record<CleaningJobType, string> = {
  pre_clean: "Pre clean",
  post_clean: "Post clean",
  deep_clean: "Deep clean"
};

export const TYPE_TONE: Record<CleaningJobType, NonNullable<BadgeTone>> = {
  pre_clean: "neutral",
  post_clean: "accent",
  deep_clean: "good"
};

// A job can be dispatched only while it is still pending.
export function canDispatch(job: Pick<CleaningJobItem, "status">): boolean {
  return job.status === "pending";
}

// A job can be marked complete once it is out the door (dispatched or confirmed).
export function canComplete(job: Pick<CleaningJobItem, "status">): boolean {
  return job.status === "dispatched" || job.status === "confirmed";
}
