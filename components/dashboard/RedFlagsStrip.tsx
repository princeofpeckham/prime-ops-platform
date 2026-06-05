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
        "flex flex-1 flex-col rounded-lg border bg-white p-3",
        alert ? "border-red-200" : "border-neutral-200"
      )}
    >
      <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-500">
        {label}
      </span>
      <span
        className={clsx(
          "mt-0.5 text-2xl font-semibold tabular-nums",
          alert ? "text-red-600" : "text-neutral-900"
        )}
      >
        {value}
      </span>
      <span className="mt-0.5 text-[11px] text-neutral-500">{hint}</span>
    </div>
  );
}

export function RedFlagsStrip({ flags }: { flags: RedFlags }) {
  return (
    <section className="grid grid-cols-2 gap-2 md:grid-cols-4">
      <Stat
        label="Open shifts"
        value={flags.unassignedShiftsNext48h}
        hint="Next 48h"
        alert={flags.unassignedShiftsNext48h > 0}
      />
      <Stat
        label="Overdue reports"
        value={flags.overdueReports}
        hint="CO reports missing"
        alert={flags.overdueReports > 0}
      />
      <Stat
        label="Damage flags"
        value={flags.unresolvedDamageFlags}
        hint="No vendor assigned"
        alert={flags.unresolvedDamageFlags > 0}
      />
      <Stat
        label="Deposit deadlines"
        value={flags.depositsApproachingDeadline}
        hint="3 days or fewer"
        alert={flags.depositsApproachingDeadline > 0}
      />
    </section>
  );
}
