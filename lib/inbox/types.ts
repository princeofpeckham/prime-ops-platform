import type { Tables, Enums } from "@/lib/supabase/types";

export type Enquiry = Tables<"enquiries">;
export type EnquiryEventRow = Tables<"enquiry_events">;
export type EnquiryStage = Enums<"enquiry_stage">;
export type EnquirySource = Enums<"enquiry_source">;
export type EnquiryEventKind = Enums<"enquiry_event_kind">;

export type TimelineEvent = {
  id: string;
  kind: EnquiryEventKind;
  body: string | null;
  createdAt: string;
};

// One enquiry, fully hydrated for both the card and the detail drawer.
export type EnquiryItem = {
  id: string;
  brandOrTenantName: string;
  contactEmail: string | null;
  contactPhone: string | null;
  valuePence: number | null;
  requestedStartDate: string | null;
  requestedEndDate: string | null;
  propertyId: string | null;
  propertyName: string | null;
  requestedArea: string | null;
  stage: EnquiryStage;
  source: EnquirySource;
  bookingId: string | null;
  summary: string | null;
  nextAction: string | null;
  needsReview: boolean;
  updatedAt: string;
  events: TimelineEvent[];
};

export type InboxColumn = {
  stage: EnquiryStage;
  items: EnquiryItem[];
};

export type PropertyOption = { id: string; name: string };

export type InboxData = {
  columns: InboxColumn[];
  properties: PropertyOption[];
  totalValuePence: number;       // sum of open (non lost) enquiry values
  needsReviewCount: number;
  source: "supabase" | "mock";
  generatedAt: string;
};
