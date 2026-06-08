import type { ReactNode } from "react";

// White card with an uppercase section header, matching the inbox/dashboard look.
export function ChartCard({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4">
      <header className="flex items-baseline justify-between gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-700">
          {title}
        </h2>
        {subtitle ? <span className="text-[11px] text-neutral-400">{subtitle}</span> : null}
      </header>
      {children}
    </section>
  );
}
