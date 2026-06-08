import type { ReactNode } from "react";
import { penceToGbp, isoShortLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { STAGE_LABEL, tierTone } from "@/lib/analytics/compute";
import type {
  BookingRow,
  BookingStatus,
  EnquiryRow,
  PropertyRow,
  ShiftRow,
  ShiftStatus,
  VendorRow
} from "@/lib/analytics/types";
import type { Enums } from "@/lib/supabase/types";

type Tone = "neutral" | "accent" | "good" | "warn" | "alert" | "muted";

const TH = "px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-neutral-500";
const TD = "px-3 py-2 text-xs text-neutral-700";

function bookingTone(status: BookingStatus): Tone {
  if (status === "active") return "good";
  if (status === "confirmed") return "accent";
  if (status === "completed") return "muted";
  return "neutral";
}

function shiftTone(status: ShiftStatus): Tone {
  if (status === "completed") return "good";
  if (status === "assigned") return "accent";
  if (status === "open") return "alert";
  if (status === "applied") return "warn";
  return "muted";
}

const SHIFT_TYPE_LABEL: Record<Enums<"shift_type">, string> = {
  check_in: "Check in",
  check_out: "Check out",
  viewing: "Viewing"
};

const PROPERTY_STATUS_LABEL: Record<Enums<"property_status">, string> = {
  active: "Active",
  fit_out: "Fit out",
  archived: "Archived"
};

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function TableShell({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
      <table className="w-full border-collapse">{children}</table>
    </div>
  );
}

export function EnquiriesTable({ rows }: { rows: EnquiryRow[] }) {
  return (
    <TableShell>
      <thead className="border-b border-neutral-200 bg-neutral-50">
        <tr>
          <th className={TH}>Brand</th>
          <th className={TH}>Stage</th>
          <th className={`${TH} text-right`}>Value</th>
          <th className={TH}>Space</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} className="border-b border-neutral-100 last:border-0">
            <td className={`${TD} font-medium text-neutral-900`}>{row.brandOrTenantName}</td>
            <td className={TD}>
              <Badge tone={row.stage === "lost" ? "muted" : "neutral"}>
                {STAGE_LABEL[row.stage]}
              </Badge>
            </td>
            <td className={`${TD} text-right tabular-nums`}>
              {row.valuePence != null ? penceToGbp(row.valuePence) : "TBC"}
            </td>
            <td className={TD}>{row.propertyName ?? "TBC"}</td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}

export function BookingsTable({ rows }: { rows: BookingRow[] }) {
  return (
    <TableShell>
      <thead className="border-b border-neutral-200 bg-neutral-50">
        <tr>
          <th className={TH}>Booking</th>
          <th className={TH}>Brand</th>
          <th className={TH}>Space</th>
          <th className={TH}>Dates</th>
          <th className={`${TH} text-right`}>TTV</th>
          <th className={TH}>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} className="border-b border-neutral-100 last:border-0">
            <td className={`${TD} font-mono text-[11px] text-neutral-500`}>{row.externalId}</td>
            <td className={`${TD} font-medium text-neutral-900`}>{row.brandName}</td>
            <td className={TD}>{row.propertyName ?? "TBC"}</td>
            <td className={TD}>
              {isoShortLabel(row.checkInDate)} to {isoShortLabel(row.checkOutDate)}
            </td>
            <td className={`${TD} text-right tabular-nums`}>{penceToGbp(row.ttvPence)}</td>
            <td className={TD}>
              <Badge tone={bookingTone(row.status)}>{titleCase(row.status)}</Badge>
            </td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}

export function ShiftsTable({ rows }: { rows: ShiftRow[] }) {
  return (
    <TableShell>
      <thead className="border-b border-neutral-200 bg-neutral-50">
        <tr>
          <th className={TH}>Type</th>
          <th className={TH}>Space</th>
          <th className={TH}>Date</th>
          <th className={TH}>Status</th>
          <th className={TH}>Cover</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} className="border-b border-neutral-100 last:border-0">
            <td className={`${TD} font-medium text-neutral-900`}>{SHIFT_TYPE_LABEL[row.type]}</td>
            <td className={TD}>{row.propertyName ?? "TBC"}</td>
            <td className={TD}>{isoShortLabel(row.date)}</td>
            <td className={TD}>
              <Badge tone={shiftTone(row.status)}>{titleCase(row.status)}</Badge>
            </td>
            <td className={TD}>
              {row.assigned ? (
                <Badge tone="good">Assigned</Badge>
              ) : (
                <Badge tone="muted">Unassigned</Badge>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}

export function VendorsTable({ rows }: { rows: VendorRow[] }) {
  return (
    <TableShell>
      <thead className="border-b border-neutral-200 bg-neutral-50">
        <tr>
          <th className={TH}>Vendor</th>
          <th className={TH}>Trade</th>
          <th className={`${TH} text-right`}>Jobs</th>
          <th className={`${TH} text-right`}>Spend</th>
          <th className={`${TH} text-right`}>Rating</th>
          <th className={TH}>Approved</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} className="border-b border-neutral-100 last:border-0">
            <td className={`${TD} font-medium text-neutral-900`}>{row.name}</td>
            <td className={TD}>{titleCase(row.trade)}</td>
            <td className={`${TD} text-right tabular-nums`}>{row.totalJobs}</td>
            <td className={`${TD} text-right tabular-nums`}>{penceToGbp(row.totalSpendPence)}</td>
            <td className={`${TD} text-right tabular-nums`}>
              {row.qualityRating != null ? row.qualityRating.toFixed(1) : "n/a"}
            </td>
            <td className={TD}>
              {row.isApproved ? (
                <Badge tone="good">Approved</Badge>
              ) : (
                <Badge tone="warn">Pending</Badge>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}

export function PropertiesTable({ rows }: { rows: PropertyRow[] }) {
  return (
    <TableShell>
      <thead className="border-b border-neutral-200 bg-neutral-50">
        <tr>
          <th className={TH}>Property</th>
          <th className={TH}>Address</th>
          <th className={TH}>Tier</th>
          <th className={TH}>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} className="border-b border-neutral-100 last:border-0">
            <td className={`${TD} font-medium text-neutral-900`}>{row.name}</td>
            <td className={TD}>{row.address}</td>
            <td className={TD}>
              <Badge tone={tierTone(row.tier)}>{row.tier.toUpperCase()}</Badge>
            </td>
            <td className={TD}>
              <Badge tone={row.status === "active" ? "good" : "warn"}>
                {PROPERTY_STATUS_LABEL[row.status]}
              </Badge>
            </td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}
