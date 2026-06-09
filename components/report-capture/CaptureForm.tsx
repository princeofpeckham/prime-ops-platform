"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Badge } from "@/components/ui/Badge";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isoShortLabel } from "@/lib/utils";
import {
  AREA_STATES,
  AREA_STATE_LABEL,
  AREA_STATE_TONE,
  DEFAULT_AREAS,
  PHOTO_BUCKET,
  TYPE_LABEL,
  type CaptureBooking,
  type ConditionAreaState,
  type ConditionReportType
} from "@/lib/report-capture/types";
import { submitConditionReport, type AreaInput } from "@/app/(brandhost)/bh/reports/actions";

// One uploaded photo: the storage path we persist plus a local object URL for
// the thumbnail and an in-flight marker for the spinner overlay.
type PhotoRef = { path: string; previewUrl: string; uploading: boolean };

type AreaState = {
  key: string;
  name: string;
  condition: ConditionAreaState;
  notes: string;
  photos: PhotoRef[];
};

let areaSeq = 0;
function blankArea(name: string): AreaState {
  areaSeq += 1;
  return { key: `area-${areaSeq}`, name, condition: "fine", notes: "", photos: [] };
}

const TYPES: ConditionReportType[] = ["check_in", "check_out"];

function safeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const inputClass =
  "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none";

export function CaptureForm({ bookings, orgId }: { bookings: CaptureBooking[]; orgId: string | null }) {
  const router = useRouter();
  const [isSubmitting, startSubmit] = useTransition();

  // One report id for the whole walkthrough, reused as the storage folder so
  // photos land at `<org_id>/<reportId>/<filename>` before the row exists.
  const [reportId] = useState(() => crypto.randomUUID());

  const [bookingId, setBookingId] = useState("");
  const [type, setType] = useState<ConditionReportType>("check_in");
  const [summary, setSummary] = useState("");
  const [areas, setAreas] = useState<AreaState[]>(() => DEFAULT_AREAS.map(blankArea));
  const [newAreaName, setNewAreaName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const selectedBooking = useMemo(
    () => bookings.find((b) => b.id === bookingId) ?? null,
    [bookings, bookingId]
  );
  const anyUploading = areas.some((a) => a.photos.some((p) => p.uploading));

  function patchArea(key: string, patch: Partial<AreaState>) {
    setAreas((prev) => prev.map((a) => (a.key === key ? { ...a, ...patch } : a)));
  }

  function addArea() {
    const name = newAreaName.trim();
    if (!name) return;
    setAreas((prev) => [...prev, blankArea(name)]);
    setNewAreaName("");
  }

  function removeArea(key: string) {
    setAreas((prev) => prev.filter((a) => a.key !== key));
  }

  async function handleFiles(areaKey: string, fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    if (!orgId) {
      setError("No active organization, cannot upload photos");
      return;
    }
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const files = Array.from(fileList);

    for (const file of files) {
      const previewUrl = URL.createObjectURL(file);
      const dot = file.name.lastIndexOf(".");
      const ext = (dot >= 0 ? file.name.slice(dot + 1) : "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const filename = `${safeName(areaKey)}-${crypto.randomUUID()}.${ext}`;
      const path = `${orgId}/${reportId}/${filename}`;

      // Optimistically show the thumbnail with a spinner.
      const pending: PhotoRef = { path, previewUrl, uploading: true };
      patchAreaPhotos(areaKey, (photos) => [...photos, pending]);

      const { error: uploadErr } = await supabase.storage
        .from(PHOTO_BUCKET)
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (uploadErr) {
        setError(`Photo upload failed: ${uploadErr.message}`);
        patchAreaPhotos(areaKey, (photos) => photos.filter((p) => p.path !== path));
        URL.revokeObjectURL(previewUrl);
        continue;
      }
      patchAreaPhotos(areaKey, (photos) =>
        photos.map((p) => (p.path === path ? { ...p, uploading: false } : p))
      );
    }
  }

  function patchAreaPhotos(areaKey: string, fn: (photos: PhotoRef[]) => PhotoRef[]) {
    setAreas((prev) => prev.map((a) => (a.key === areaKey ? { ...a, photos: fn(a.photos) } : a)));
  }

  function removePhoto(areaKey: string, path: string) {
    patchAreaPhotos(areaKey, (photos) => {
      const target = photos.find((p) => p.path === path);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return photos.filter((p) => p.path !== path);
    });
  }

  function handleSubmit() {
    setError(null);
    if (!selectedBooking) {
      setError("Pick a booking first");
      return;
    }
    const named = areas.filter((a) => a.name.trim().length > 0);
    if (named.length === 0) {
      setError("Add at least one area");
      return;
    }
    if (anyUploading) {
      setError("Wait for photos to finish uploading");
      return;
    }

    const payloadAreas: AreaInput[] = named.map((a) => ({
      areaName: a.name.trim(),
      condition: a.condition,
      notes: a.notes.trim() || null,
      photos: a.photos.map((p) => p.path)
    }));

    startSubmit(async () => {
      const result = await submitConditionReport({
        reportId,
        bookingId: selectedBooking.id,
        propertyId: selectedBooking.propertyId,
        type,
        summary: summary.trim() || null,
        areas: payloadAreas
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.push("/bh/reports");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-5 pb-24">
      {/* Booking + report type */}
      <section className="rounded-lg border border-neutral-200 bg-white p-4">
        <h2 className="text-xs font-medium uppercase tracking-wide text-neutral-500">Booking</h2>
        <div className="mt-3 flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-neutral-600">Which booking</span>
            <select
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              className={inputClass}
            >
              <option value="">Select a booking</option>
              {bookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.brandName} · {b.propertyName ?? "Unknown space"}
                  {b.ref ? ` · ${b.ref}` : ""}
                </option>
              ))}
            </select>
          </label>

          {selectedBooking ? (
            <p className="text-xs text-neutral-500">
              {selectedBooking.propertyName ?? "Space"} · in {isoShortLabel(selectedBooking.checkInDate)} ·
              out {isoShortLabel(selectedBooking.checkOutDate)}
            </p>
          ) : null}

          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-neutral-600">Report type</span>
            <div className="grid grid-cols-2 gap-2">
              {TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={clsx(
                    "rounded-md border px-3 py-2 text-sm font-medium transition",
                    type === t
                      ? "border-prime-ink bg-prime-ink text-white"
                      : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
                  )}
                >
                  {TYPE_LABEL[t]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Rooms */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-medium uppercase tracking-wide text-neutral-500">Areas</h2>
        {areas.map((area) => (
          <AreaCard
            key={area.key}
            area={area}
            onRename={(name) => patchArea(area.key, { name })}
            onCondition={(condition) => patchArea(area.key, { condition })}
            onNotes={(notes) => patchArea(area.key, { notes })}
            onFiles={(files) => handleFiles(area.key, files)}
            onRemovePhoto={(path) => removePhoto(area.key, path)}
            onRemove={() => removeArea(area.key)}
          />
        ))}

        <div className="flex gap-2">
          <input
            value={newAreaName}
            onChange={(e) => setNewAreaName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addArea();
              }
            }}
            placeholder="Add an area, e.g. Storeroom"
            className={inputClass}
          />
          <button
            type="button"
            onClick={addArea}
            className="shrink-0 rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Add area
          </button>
        </div>
      </section>

      {/* Summary */}
      <section className="rounded-lg border border-neutral-200 bg-white p-4">
        <h2 className="text-xs font-medium uppercase tracking-wide text-neutral-500">Summary</h2>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={3}
          placeholder="Overall notes on the walkthrough (optional)."
          className={clsx(inputClass, "mt-3")}
        />
      </section>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      {/* Sticky submit bar, thumb-friendly on mobile */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <p className="flex-1 text-xs text-neutral-500">
            {areas.length} area{areas.length === 1 ? "" : "s"}
            {anyUploading ? " · uploading photos..." : ""}
          </p>
          <button
            type="button"
            disabled={isSubmitting || anyUploading}
            onClick={handleSubmit}
            className="rounded-md bg-prime-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit report"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AreaCard({
  area,
  onRename,
  onCondition,
  onNotes,
  onFiles,
  onRemovePhoto,
  onRemove
}: {
  area: AreaState;
  onRename: (name: string) => void;
  onCondition: (c: ConditionAreaState) => void;
  onNotes: (notes: string) => void;
  onFiles: (files: FileList | null) => void;
  onRemovePhoto: (path: string) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="flex items-start gap-2">
        <input
          value={area.name}
          onChange={(e) => onRename(e.target.value)}
          placeholder="Area name"
          className="flex-1 rounded-md border border-transparent px-1 py-1 text-sm font-medium text-neutral-900 focus:border-neutral-300 focus:outline-none"
        />
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove area"
          className="shrink-0 rounded-md px-2 py-1 text-xs text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
        >
          Remove
        </button>
      </div>

      {/* Condition chips */}
      <div className="mt-3 flex flex-wrap gap-2">
        {AREA_STATES.map((state) => {
          const active = area.condition === state;
          return (
            <button
              key={state}
              type="button"
              onClick={() => onCondition(state)}
              className={clsx(
                "rounded-full border px-3 py-1 text-xs font-medium transition",
                active
                  ? "border-prime-ink bg-prime-ink text-white"
                  : "border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-50"
              )}
            >
              {AREA_STATE_LABEL[state]}
            </button>
          );
        })}
      </div>

      <textarea
        value={area.notes}
        onChange={(e) => onNotes(e.target.value)}
        rows={2}
        placeholder="Notes (optional)."
        className={clsx(inputClass, "mt-3")}
      />

      {/* Photos */}
      <div className="mt-3">
        <div className="flex flex-wrap items-center gap-2">
          {area.photos.map((photo) => (
            <div
              key={photo.path}
              className="relative h-16 w-16 overflow-hidden rounded-md border border-neutral-200 bg-neutral-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.previewUrl} alt="" className="h-full w-full object-cover" />
              {photo.uploading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 text-[10px] font-medium text-neutral-600">
                  ...
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onRemovePhoto(photo.path)}
                  aria-label="Remove photo"
                  className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs leading-none text-white"
                >
                  ×
                </button>
              )}
            </div>
          ))}

          <label className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-neutral-300 text-[10px] font-medium text-neutral-500 hover:bg-neutral-50">
            <span className="text-lg leading-none">+</span>
            Photo
            <input
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              className="hidden"
              onChange={(e) => {
                onFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        {area.condition === "damage" || area.condition === "missing" ? (
          <p className="mt-2">
            <Badge tone={AREA_STATE_TONE[area.condition]}>Raises a flag</Badge>
          </p>
        ) : null}
      </div>
    </div>
  );
}
