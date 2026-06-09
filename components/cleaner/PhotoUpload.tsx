"use client";

import { useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const BUCKET = "condition-photos";

type Uploaded = { path: string; name: string };

// Make a filesystem-safe, collision-resistant filename for the bucket.
function safeName(original: string): string {
  const dot = original.lastIndexOf(".");
  const ext = dot >= 0 ? original.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "jpg";
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${stamp}-${rand}.${ext || "jpg"}`;
}

// Lets the cleaner snap or pick photos of the finished space. Each file is
// uploaded straight to the "condition-photos" bucket at
// <orgId>/<jobId>/<filename>; the resulting storage paths are reported up so
// the complete action can save them.
export function PhotoUpload({
  orgId,
  jobId,
  onChange,
  disabled
}: {
  orgId: string;
  jobId: string;
  onChange: (paths: string[]) => void;
  disabled?: boolean;
}) {
  const [uploaded, setUploaded] = useState<Uploaded[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const added: Uploaded[] = [];

    for (const file of Array.from(files)) {
      const path = `${orgId}/${jobId}/${safeName(file.name)}`;
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (upErr) {
        setError(upErr.message);
        continue;
      }
      added.push({ path, name: file.name });
    }

    if (added.length) {
      const next = [...uploaded, ...added];
      setUploaded(next);
      onChange(next.map((u) => u.path));
    }
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeAt(index: number) {
    const next = uploaded.filter((_, i) => i !== index);
    setUploaded(next);
    onChange(next.map((u) => u.path));
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
        Condition photos
      </span>

      {uploaded.length > 0 ? (
        <ul className="flex flex-col gap-1">
          {uploaded.map((u, i) => (
            <li
              key={u.path}
              className="flex items-center justify-between gap-2 rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-700"
            >
              <span className="truncate">{u.name}</span>
              <button
                type="button"
                onClick={() => removeAt(i)}
                disabled={disabled || busy}
                className="shrink-0 text-[11px] text-neutral-500 hover:text-red-600 disabled:opacity-50"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[11px] text-neutral-500">
          Add a few photos of the finished space. If anything is damaged, photograph it.
        </p>
      )}

      <label
        className={clsxBtn(disabled || busy)}
        aria-disabled={disabled || busy}
      >
        {busy ? "Uploading..." : uploaded.length ? "Add more photos" : "Add photos"}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          className="hidden"
          disabled={disabled || busy}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>

      {error ? <p className="text-[11px] text-red-600">{error}</p> : null}
    </div>
  );
}

// Small local helper so the label reads like a button without pulling clsx in
// for a single conditional.
function clsxBtn(off: boolean): string {
  return [
    "inline-flex w-fit cursor-pointer items-center gap-2 rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50",
    off ? "pointer-events-none opacity-50" : ""
  ]
    .filter(Boolean)
    .join(" ");
}
