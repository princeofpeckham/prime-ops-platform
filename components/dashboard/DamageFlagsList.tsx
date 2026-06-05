import { Badge } from "@/components/ui/Badge";
import type { DamageFlag } from "@/lib/dashboard/types";

function FlagRow({ flag }: { flag: DamageFlag }) {
  const propertyName = flag.propertyId
    .replace("p-", "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-neutral-100 bg-white px-3 py-2">
      <div className="flex items-center gap-3 min-w-0">
        <span className="flex-shrink-0 h-2 w-2 rounded-full bg-red-500" />
        <div className="min-w-0">
          <span className="block truncate text-xs font-medium text-neutral-900">
            {propertyName}: {flag.areaName}
          </span>
          <span className="block truncate text-[11px] text-neutral-500">
            {flag.notes ?? "No details"} (from {flag.brandName})
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {flag.tradeNeeded && (
          <Badge tone="muted">{flag.tradeNeeded}</Badge>
        )}
        {flag.vendorJobId ? (
          <Badge tone="warn">{flag.vendorName ?? "Vendor assigned"}</Badge>
        ) : (
          <Badge tone="alert">Needs vendor</Badge>
        )}
      </div>
    </div>
  );
}

export function DamageFlagsList({ flags }: { flags: DamageFlag[] }) {
  // Show unresolved flags first
  const sorted = [...flags].sort((a, b) => {
    if (!a.vendorJobId && b.vendorJobId) return -1;
    if (a.vendorJobId && !b.vendorJobId) return 1;
    return 0;
  });

  return (
    <div className="flex flex-col gap-1.5">
      {sorted.map((flag) => (
        <FlagRow key={flag.id} flag={flag} />
      ))}
    </div>
  );
}
