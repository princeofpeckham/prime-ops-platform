import clsx from "clsx";
import type { RedFlags } from "@/lib/dashboard/types";

function Stat({
  label,
  value,
  hint,
  alert
}: {
  label: string;
  value: number;
  hint: string;
  alert: boolean;
}) {
  return (
    <div
      className={clsx(
        "flex flex-1 flex-col rounded-lg border bg-white p-4",
        alert ? "border-red-200" : "border-neutral-200"
      )}
    >
      <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
        {label}
      </span>
      <span
        className={clsx(
          "mt-1 text-3xl font-semibold tabular-nums",
          alert ? "text-red-600" : "text-neutral-900"
        )}
      >
        {value}
      </span>
      <span className="mt-1 text-xs text-neutral-500">{hint}</span>
    </div>
  );
}

export function RedFlagsStrip({ flags }: { flags: RedFlags }) {
  return (
    <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <Stat
        label="Unassigned shifts"
        value={flags.unassignedShiftsNext48h}
        hint="Next 48 hours"
        alert={flags.unassignedShiftsNext48h > 0}
      />
      <Stat
        label="Overdue reports"
        value={flags.overdueReports}
        hint="Check-out reports not submitted"
        alert={flags.overdueReports > 0}
      />
      <Stat
        label="Deposits at deadline"
        value={flags.depositsApproachingDeadline}
        hint="3 days or fewer to decision"
        alert={flags.depositsApproachingDeadline > 0}
      />
    </section>
  );
}
