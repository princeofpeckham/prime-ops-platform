import { Badge } from "@/components/ui/Badge";
import type { PropertyHealth } from "@/lib/dashboard/types";

function tierBadgeTone(tier: string): "accent" | "good" | "muted" {
  if (tier === "prime") return "accent";
  if (tier === "pro") return "good";
  return "muted";
}

function Stat({ label, value, alert }: { label: string; value: number; alert?: boolean }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-500">
        {label}
      </span>
      <span
        className={`mt-0.5 text-lg font-semibold tabular-nums ${alert ? "text-red-600" : "text-neutral-900"}`}
      >
        {value}
      </span>
    </div>
  );
}

export function PropertyHealthCard({ health }: { health: PropertyHealth }) {
  const { property, damageFlags } = health;
  const unresolvedDamage = damageFlags.filter((d) => !d.vendorJobId);

  return (
    <article className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4">
      <header className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">{property.name}</h3>
          <p className="mt-0.5 text-xs text-neutral-500">{property.address}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge tone={tierBadgeTone(property.tier)}>{property.tier.toUpperCase()}</Badge>
          {property.status === "fit_out" ? <Badge tone="warn">Fit-out</Badge> : null}
        </div>
      </header>
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Active" value={health.activeBookings} />
        <Stat label="Upcoming" value={health.upcomingCheckIns14d} />
        <Stat
          label="Open shifts"
          value={health.unassignedShifts14d}
          alert={health.unassignedShifts14d > 0}
        />
      </div>

      {/* Damage flags section */}
      {damageFlags.length > 0 && (
        <div className="border-t border-neutral-100 pt-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
              Damage flags
            </span>
            {unresolvedDamage.length > 0 && (
              <Badge tone="alert">{unresolvedDamage.length} unresolved</Badge>
            )}
          </div>
          <div className="flex flex-col gap-1">
            {damageFlags.slice(0, 3).map((flag) => (
              <div
                key={flag.id}
                className="flex items-center justify-between rounded border border-neutral-100 px-2 py-1"
              >
                <span className="text-[11px] text-neutral-700">{flag.areaName}</span>
                {flag.vendorJobId ? (
                  <Badge tone="warn">{flag.vendorName ?? flag.vendorJobStatus ?? "Assigned"}</Badge>
                ) : (
                  <Badge tone="alert">Needs vendor</Badge>
                )}
              </div>
            ))}
            {damageFlags.length > 3 && (
              <span className="text-[10px] text-neutral-400">
                +{damageFlags.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
