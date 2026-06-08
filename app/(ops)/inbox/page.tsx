import { getInboxData } from "@/lib/inbox/data";
import { InboxBoard, InboxSummary } from "@/components/inbox/InboxBoard";
import { NewEnquiryModal } from "@/components/inbox/NewEnquiryModal";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const data = await getInboxData();

  return (
    <div className="flex flex-col gap-5">
      <section className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Inbox</h1>
          <p className="mt-0.5 text-xs text-neutral-500">
            Every enquiry as a card, moving through the funnel.{" "}
            {data.source === "mock" ? "Demo data." : "Live."}
          </p>
        </div>
        <NewEnquiryModal properties={data.properties} />
      </section>

      <InboxSummary data={data} />

      <InboxBoard data={data} />
    </div>
  );
}
