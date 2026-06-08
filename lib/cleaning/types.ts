import type { Tables, Enums } from "@/lib/supabase/types";

export type CleaningJob = Tables<"cleaning_jobs">;
export type CleaningJobType = Enums<"cleaning_job_type">;
export type CleaningJobStatus = Enums<"cleaning_job_status">;

// One cleaning job, hydrated with its property name for the table row.
export type CleaningJobItem = {
  id: string;
  date: string;
  timeWindow: string | null;
  propertyId: string;
  propertyName: string | null;
  type: CleaningJobType;
  ratePence: number;
  status: CleaningJobStatus;
  smsSentAt: string | null;
  confirmedAt: string | null;
  completedAt: string | null;
  notes: string | null;
};

export type CleaningData = {
  jobs: CleaningJobItem[];          // sorted by date ascending
  totalRatePence: number;           // sum of rates for non cancelled jobs
  pendingCount: number;             // jobs still awaiting dispatch
  source: "supabase" | "mock";
  generatedAt: string;
};
