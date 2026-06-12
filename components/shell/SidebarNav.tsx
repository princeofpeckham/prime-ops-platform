"use client";

// Client-side nav for the ops shell. Kept deliberately tiny so the layout
// itself stays a server component: this only handles active-route styling.

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export type ShellNavItem = {
  href: string;
  label: string;
  // Optional live count shown as a small pill. Omitted or 0 renders nothing.
  count?: number;
};

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function CountPill({ count, active }: { count: number; active: boolean }) {
  return (
    <span
      className={clsx(
        "ml-2 inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-pine-100",
        active ? "bg-pine-700" : "bg-pine-600"
      )}
    >
      {count}
    </span>
  );
}

// Vertical list for the fixed sidebar (md and up).
export function SidebarNav({ items }: { items: ShellNavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-pine-600 font-medium text-white"
                : "text-pine-300 hover:bg-pine-700 hover:text-white"
            )}
          >
            <span>{item.label}</span>
            {typeof item.count === "number" && item.count > 0 ? (
              <CountPill count={item.count} active={active} />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

// Horizontal, scrollable strip for the slim top bar below md.
export function TopbarNav({ items }: { items: ShellNavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 overflow-x-auto px-3 pb-2">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex shrink-0 items-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm transition-colors",
              active
                ? "bg-pine-600 font-medium text-white"
                : "text-pine-300 hover:bg-pine-700 hover:text-white"
            )}
          >
            <span>{item.label}</span>
            {typeof item.count === "number" && item.count > 0 ? (
              <CountPill count={item.count} active={active} />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
