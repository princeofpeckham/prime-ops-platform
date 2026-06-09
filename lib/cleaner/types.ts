import type { Tables, Enums } from "@/lib/supabase/types";

export type CleaningJob = Tables<"cleaning_jobs">;
export type CleaningJobType = Enums<"cleaning_job_type">;
export type CleaningJobStatus = Enums<"cleaning_job_status">;

// One cleaning job hydrated for the cleaner portal: the job plus the
// space it is at (name, address, KeyNest access) and the brand context.
export type CleanerJobItem = {
  id: string;
  date: string;
  timeWindow: string | null;
  propertyId: string;
  propertyName: string | null;
  propertyAddress: string | null;
  keynestInstructions: string | null;
  brandName: string | null;
  type: CleaningJobType;
  ratePence: number;
  status: CleaningJobStatus;
  notes: string | null;
  confirmedAt: string | null;
  completedAt: string | null;
  completionPhotos: string[];
};

// The cleaner's upcoming work: anything not yet completed or cancelled,
// soonest first.
export type CleanerJobsData = {
  jobs: CleanerJobItem[];
  toConfirmCount: number;       // dispatched jobs still awaiting the cleaner's tap
  source: "supabase" | "mock";
  generatedAt: string;
};

// The cleaner's finished work plus what they have earned for it.
export type CleanerHistoryData = {
  jobs: CleanerJobItem[];       // completed jobs, most recent first
  totalEarnedPence: number;     // sum of rate_pence across completed jobs
  completedCount: number;
  source: "supabase" | "mock";
  generatedAt: string;
};

// A single tappable line on the blank slate checklist.
export type ChecklistItem = { id: string; label: string };

// A titled group of checklist lines (e.g. "Every space, every time").
export type ChecklistSection = { id: string; title: string; items: ChecklistItem[] };
