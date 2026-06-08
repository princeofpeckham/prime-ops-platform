import { getSettingsData } from "@/lib/settings/data";
import { Badge } from "@/components/ui/Badge";
import { PropertyEditModal } from "@/components/settings/PropertyEditModal";
import {
  ROLE_BLURB,
  ROLE_LABEL,
  STATUS_LABEL,
  STATUS_TONE,
  TIER_LABEL,
  TIER_TONE
} from "@/lib/settings/labels";
import { penceToGbp, isoShortLabel } from "@/lib/utils";

export const dynamic = "force-dynamic";

function SectionHeader({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{title}</h2>
      <span className="text-xs text-neutral-400">{hint}</span>
    </div>
  );
}

export default async function SettingsPage() {
  const data = await getSettingsData();

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="text-xl font-semibold text-neutral-900">Settings</h1>
        <p className="mt-0.5 text-xs text-neutral-500">
          Team, property configuration and notification templates.{" "}
          {data.source === "mock" ? "Demo data." : "Live."}
        </p>
      </section>

      {/* Team */}
      <section className="flex flex-col gap-3">
        <SectionHeader title="Team" hint={`${data.team.length} members`} />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {data.roleCounts.map((rc) => (
            <div key={rc.role} className="rounded-lg border border-neutral-200 bg-white p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-800">{ROLE_LABEL[rc.role]}</span>
                <span className="text-lg font-semibold tabular-nums text-neutral-900">{rc.count}</span>
              </div>
              <p className="mt-1 text-[11px] text-neutral-500">{ROLE_BLURB[rc.role]}</p>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-[11px] uppercase tracking-wide text-neutral-500">
                <th className="px-4 py-2 font-medium">Role</th>
                <th className="px-4 py-2 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {data.team.map((m) => (
                <tr key={m.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-2">
                    <Badge tone="neutral">{ROLE_LABEL[m.role]}</Badge>
                  </td>
                  <td className="px-4 py-2 text-neutral-600">{isoShortLabel(m.createdAt.slice(0, 10))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-neutral-400">
          Member email addresses are managed in authentication and are not shown here.
        </p>
      </section>

      {/* Properties config */}
      <section className="flex flex-col gap-3">
        <SectionHeader title="Properties" hint={`${data.properties.length} spaces`} />

        <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-[11px] uppercase tracking-wide text-neutral-500">
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Tier</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Postcode</th>
                <th className="px-4 py-2 text-right font-medium">Cleaning rate</th>
                <th className="px-4 py-2 text-right font-medium">Edit</th>
              </tr>
            </thead>
            <tbody>
              {data.properties.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-neutral-400">
                    No properties yet.
                  </td>
                </tr>
              ) : (
                data.properties.map((p) => (
                  <tr key={p.id} className="border-b border-neutral-100 align-top last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-medium text-neutral-900">{p.name}</div>
                      <div className="text-[11px] text-neutral-500">{p.address}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={TIER_TONE[p.tier]}>{TIER_LABEL[p.tier]}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={STATUS_TONE[p.status]}>{STATUS_LABEL[p.status]}</Badge>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{p.postcode ?? "TBC"}</td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums text-neutral-800">
                      {penceToGbp(p.cleaningRatePence)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <PropertyEditModal property={p} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Notification templates */}
      <section className="flex flex-col gap-3">
        <SectionHeader title="Notification templates" hint={`${data.templates.length} templates`} />

        <ul className="flex flex-col gap-2">
          {data.templates.map((t) => (
            <li key={t.key} className="rounded-lg border border-neutral-200 bg-white p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-neutral-900">{t.name}</span>
                <Badge tone="neutral">{t.channel}</Badge>
              </div>
              <p className="mt-1 text-xs text-neutral-600">{t.trigger}</p>
              <p className="mt-0.5 text-[11px] text-neutral-400">To: {t.audience}</p>
            </li>
          ))}
        </ul>
        <p className="text-[11px] text-neutral-400">
          Templates are configured by the platform team. Editing copy will be available in a later release.
        </p>
      </section>
    </div>
  );
}
