// Display labels and badge tones for cleaning job status and type, shared by
// the cleaner portal components.

import type { CleaningJobStatus, CleaningJobType } from "./types";

type BadgeTone = "neutral" | "accent" | "good" | "warn" | "alert" | "muted";

export const STATUS_LABEL: Record<CleaningJobStatus, string> = {
  pending: "Awaiting dispatch",
  dispatched: "New, please confirm",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled"
};

export const STATUS_TONE: Record<CleaningJobStatus, BadgeTone> = {
  pending: "muted",
  dispatched: "accent",
  confirmed: "good",
  completed: "good",
  cancelled: "alert"
};

export const TYPE_LABEL: Record<CleaningJobType, string> = {
  pre_clean: "Pre check in clean",
  post_clean: "Post checkout clean",
  deep_clean: "Deep clean"
};
