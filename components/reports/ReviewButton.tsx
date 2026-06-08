"use client";

import { useTransition } from "react";
import { markReviewed } from "@/app/(ops)/reports/actions";

export function ReviewButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await markReviewed(id);
        })
      }
      className="rounded-md bg-prime-ink px-3 py-1.5 text-xs font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
    >
      {isPending ? "Marking..." : "Mark reviewed"}
    </button>
  );
}
