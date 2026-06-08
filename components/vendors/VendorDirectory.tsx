"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { TRADE_LABEL, TRADE_ORDER } from "@/lib/vendors/status";
import { VendorCard } from "./VendorCard";
import type { TradeType, VendorItem } from "@/lib/vendors/types";

type Filter = "all" | TradeType;

export function VendorDirectory({ vendors }: { vendors: VendorItem[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  // Only show trade filters that have at least one vendor, to keep the bar tidy.
  const availableTrades = useMemo(() => {
    const present = new Set(vendors.map((v) => v.trade));
    return TRADE_ORDER.filter((t) => present.has(t));
  }, [vendors]);

  const shown = filter === "all" ? vendors : vendors.filter((v) => v.trade === filter);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
          All
        </FilterChip>
        {availableTrades.map((t) => (
          <FilterChip key={t} active={filter === t} onClick={() => setFilter(t)}>
            {TRADE_LABEL[t]}
          </FilterChip>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="text-sm text-neutral-400">No vendors for this trade.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shown.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "rounded-full border px-3 py-1 text-xs font-medium transition",
        active
          ? "border-neutral-900 bg-neutral-900 text-white"
          : "border-neutral-300 bg-white text-neutral-600 hover:border-neutral-400"
      )}
    >
      {children}
    </button>
  );
}
