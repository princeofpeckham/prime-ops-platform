"use client";

import { useMemo, useState, useTransition } from "react";
import { isoShortLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { SEVERITY_LABEL, SEVERITY_TONE, STATUS_LABEL, isOpen } from "@/lib/flags/statuses";
import { TRADE_LABEL, TRADE_ORDER } from "@/lib/flags/trades";
import type { FlagItem, FlagSeverity, TradeType, VendorOption } from "@/lib/flags/types";
import {
  assignToPerson,
  dismissFlag,
  resolveFlag,
  routeToVendor,
  triageFlag
} from "@/app/(ops)/flags/actions";

const SEVERITY_ORDER: readonly FlagSeverity[] = ["low", "medium", "high", "urgent"];

const SOURCE_LABEL: Record<FlagItem["source"], string> = {
  condition_report: "Condition report",
  cleaner: "Cleaner",
  brandhost: "Brand host",
  ops_manual: "Ops",
  system: "System"
};

const inputClass =
  "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1 text-sm">
      <span className="text-neutral-500">{label}</span>
      <span className="text-right font-medium text-neutral-800">{value}</span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{children}</span>;
}

export function FlagDrawer({
  item,
  vendors,
  onClose
}: {
  item: FlagItem | null;
  vendors: VendorOption[];
  onClose: () => void;
}) {
  return item ? <DrawerInner item={item} vendors={vendors} onClose={onClose} /> : null;
}

function DrawerInner({
  item,
  vendors,
  onClose
}: {
  item: FlagItem;
  vendors: VendorOption[];
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [trade, setTrade] = useState<TradeType>(item.trade ?? "general");
  const [severity, setSeverity] = useState<FlagSeverity>(item.severity);
  const [vendorId, setVendorId] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);

  // Offer vendors whose trade matches the flag first, but allow any approved vendor.
  const sortedVendors = useMemo(() => {
    const matching = vendors.filter((v) => v.trade === trade);
    const others = vendors.filter((v) => v.trade !== trade);
    return [...matching, ...others];
  }, [vendors, trade]);

  const createdIso = item.createdAt.slice(0, 10);
  const open = isOpen(item.status);

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} aria-hidden />
      <aside className="relative z-50 flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-xl">
        <header className="flex items-start justify-between gap-3 border-b border-neutral-200 p-5">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">{item.title}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge tone="neutral">{STATUS_LABEL[item.status]}</Badge>
              <Badge tone={SEVERITY_TONE[item.severity]}>{SEVERITY_LABEL[item.severity]}</Badge>
              {item.trade ? <Badge tone="neutral">{TRADE_LABEL[item.trade]}</Badge> : null}
              {item.vendorJobId ? <Badge tone="accent">Vendor job</Badge> : null}
            </div>
          </div>
          <button onClick={onClose} className="text-sm text-neutral-500 hover:text-neutral-900">
            Close
          </button>
        </header>

        <div className="flex flex-col gap-5 p-5">
          {item.description ? <p className="text-sm text-neutral-700">{item.description}</p> : null}

          <section className="rounded-lg border border-neutral-200 p-3">
            <Row label="Property" value={item.propertyName ?? "Unknown space"} />
            <Row label="Source" value={SOURCE_LABEL[item.source]} />
            <Row label="Raised" value={isoShortLabel(createdIso)} />
            <Row label="Photos" value={String(item.photoCount)} />
            {item.resolvedAt ? <Row label="Resolved" value={isoShortLabel(item.resolvedAt.slice(0, 10))} /> : null}
          </section>

          {item.status === "raised" ? (
            <section className="flex flex-col gap-2 rounded-lg border border-neutral-200 p-3">
              <SectionTitle>Triage</SectionTitle>
              <label className="flex flex-col gap-1">
                <span className="text-[11px] text-neutral-500">Trade</span>
                <select value={trade} onChange={(e) => setTrade(e.target.value as TradeType)} className={inputClass}>
                  {TRADE_ORDER.map((t) => (
                    <option key={t} value={t}>
                      {TRADE_LABEL[t]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[11px] text-neutral-500">Severity</span>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as FlagSeverity)}
                  className={inputClass}
                >
                  {SEVERITY_ORDER.map((s) => (
                    <option key={s} value={s}>
                      {SEVERITY_LABEL[s]}
                    </option>
                  ))}
                </select>
              </label>
              <button
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    await triageFlag(item.id, trade, severity);
                    onClose();
                  })
                }
                className="mt-1 rounded-md bg-prime-ink px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
              >
                Mark triaged
              </button>
            </section>
          ) : null}

          {(item.status === "triaged" || item.status === "raised") && !item.vendorJobId ? (
            <section className="flex flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <SectionTitle>Route to vendor</SectionTitle>
              <select value={vendorId} onChange={(e) => setVendorId(e.target.value)} className={inputClass}>
                <option value="">Choose a vendor</option>
                {sortedVendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({TRADE_LABEL[v.trade]})
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  disabled={isPending || !vendorId}
                  onClick={() =>
                    startTransition(async () => {
                      const res = await routeToVendor(item.id, vendorId);
                      if (res.ok) {
                        onClose();
                      } else {
                        setMessage(res.message ?? "Could not route");
                      }
                    })
                  }
                  className="flex-1 rounded-md bg-prime-ink px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
                >
                  Create vendor job
                </button>
                <button
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      await assignToPerson(item.id);
                      onClose();
                    })
                  }
                  className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm hover:bg-neutral-50 disabled:opacity-50"
                >
                  Keep in-house
                </button>
              </div>
              {message ? <span className="text-xs text-red-600">{message}</span> : null}
            </section>
          ) : null}

          {open ? (
            <section className="flex flex-col gap-2">
              <SectionTitle>Close out</SectionTitle>
              <div className="flex gap-2">
                <button
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      await resolveFlag(item.id);
                      onClose();
                    })
                  }
                  className="flex-1 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
                >
                  Resolve
                </button>
                <button
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      await dismissFlag(item.id);
                      onClose();
                    })
                  }
                  className="flex-1 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm hover:bg-neutral-50 disabled:opacity-50"
                >
                  Dismiss
                </button>
              </div>
            </section>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
