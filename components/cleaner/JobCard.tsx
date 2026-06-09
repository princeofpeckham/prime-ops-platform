"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/Badge";
import { isoShortDow, isoShortLabel, penceToGbp } from "@/lib/utils";
import { STATUS_LABEL, STATUS_TONE, TYPE_LABEL } from "@/lib/cleaner/labels";
import type { CleanerJobItem } from "@/lib/cleaner/types";
import { confirmJob, completeJob } from "@/app/(cleaner)/cleaner/jobs/actions";
import { JobChecklist } from "./JobChecklist";
import { PhotoUpload } from "./PhotoUpload";

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
        {label}
      </span>
      <span className="text-sm text-neutral-800">{children}</span>
    </div>
  );
}

export function JobCard({ job, orgId }: { job: CleanerJobItem; orgId: string }) {
  const [pending, startTransition] = useTransition();
  const [completing, setCompleting] = useState(false);
  const [photoPaths, setPhotoPaths] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const dateLabel = `${isoShortDow(job.date)} ${isoShortLabel(job.date)}`;

  function onConfirm() {
    setError(null);
    startTransition(async () => {
      try {
        await confirmJob(job.id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not confirm");
      }
    });
  }

  function onComplete() {
    if (photoPaths.length === 0) {
      setError("Add at least one photo before marking complete.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await completeJob(job.id, photoPaths);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not complete");
      }
    });
  }

  return (
    <article className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-base font-semibold text-neutral-900">
            {job.propertyName ?? "Space TBC"}
          </span>
          <span className="text-xs text-neutral-500">{TYPE_LABEL[job.type]}</span>
        </div>
        <Badge tone={STATUS_TONE[job.status]}>{STATUS_LABEL[job.status]}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Detail label="Date">{dateLabel}</Detail>
        <Detail label="Time">{job.timeWindow ?? "Any time, space vacant"}</Detail>
        {job.propertyAddress ? (
          <div className="col-span-2">
            <Detail label="Address">{job.propertyAddress}</Detail>
          </div>
        ) : null}
        {job.brandName ? <Detail label="Previous brand">{job.brandName}</Detail> : null}
        <Detail label="Pay">
          <span className="tabular-nums">{penceToGbp(job.ratePence)}</span>
        </Detail>
      </div>

      <div className="flex flex-col gap-0.5 rounded-md bg-neutral-50 px-3 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
          Getting in
        </span>
        <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-700">
          {job.keynestInstructions ?? "Access steps coming soon, call ops if unsure."}
        </p>
      </div>

      {job.notes ? (
        <div className="flex flex-col gap-0.5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">
            Note from ops
          </span>
          <p className="text-sm leading-relaxed text-amber-900">{job.notes}</p>
        </div>
      ) : null}

      <JobChecklist />

      {completing ? (
        <div className="flex flex-col gap-3 rounded-md border border-neutral-200 bg-neutral-50 p-3">
          <PhotoUpload
            orgId={orgId}
            jobId={job.id}
            onChange={setPhotoPaths}
            disabled={pending}
          />
        </div>
      ) : null}

      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      <div className="flex flex-wrap items-center gap-2">
        {job.status === "dispatched" ? (
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="rounded-md bg-prime-ink px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            {pending ? "Confirming..." : "I'll take it"}
          </button>
        ) : null}

        {job.status === "confirmed" || job.status === "pending" ? (
          completing ? (
            <>
              <button
                type="button"
                onClick={onComplete}
                disabled={pending || photoPaths.length === 0}
                className="rounded-md bg-prime-ink px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
              >
                {pending ? "Saving..." : "Submit completed clean"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCompleting(false);
                  setError(null);
                }}
                disabled={pending}
                className="rounded-md border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50 disabled:opacity-50"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setCompleting(true)}
              className="rounded-md bg-prime-ink px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Mark complete
            </button>
          )
        ) : null}
      </div>
    </article>
  );
}
