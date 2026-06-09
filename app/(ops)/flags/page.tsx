import { getFlagsData } from "@/lib/flags/data";
import { FlagBoard, FlagsSummary } from "@/components/flags/FlagBoard";
import { NewFlagModal } from "@/components/flags/NewFlagModal";

export const dynamic = "force-dynamic";

export default async function FlagsPage() {
  const data = await getFlagsData();

  return (
    <div className="flex flex-col gap-5">
      <section className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Flags</h1>
          <p className="mt-0.5 text-xs text-neutral-500">
            Property issues from condition reports, cleaners and brand hosts, routed to vendors.{" "}
            {data.source === "mock" ? "Demo data." : "Live."}
          </p>
        </div>
        <NewFlagModal properties={data.properties} />
      </section>

      <FlagsSummary data={data} />

      <FlagBoard data={data} />
    </div>
  );
}
