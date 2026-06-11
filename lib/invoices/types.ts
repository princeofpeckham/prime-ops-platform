import type { Tables, Enums } from "@/lib/supabase/types";
import type { LineItem } from "./logic";

export type Invoice = Tables<"invoices">;
export type InvoiceStatus = Enums<"invoice_status">;

// Mirrors the tone union accepted by the shared Badge component.
type BadgeTone = "neutral" | "accent" | "good" | "warn" | "alert" | "muted";

export const STATUS_LABEL: Record<InvoiceStatus, string> = {
  draft: "Draft",
  issued: "Issued",
  paid: "Paid",
  void: "Void"
};

export const STATUS_TONE: Record<InvoiceStatus, BadgeTone> = {
  draft: "muted",
  issued: "accent",
  paid: "good",
  void: "neutral"
};

// One invoice, hydrated with the property and booking labels the screens show.
export type InvoiceItem = {
  id: string;
  invoiceNumber: string;
  propertyId: string;
  propertyName: string | null;
  bookingId: string | null;
  bookingRef: string | null;     // bookings.external_id, shown as the booking reference
  brandName: string | null;
  billedToName: string;
  billedToAddress: string | null;
  issuedDate: string | null;     // ISO YYYY-MM-DD
  lineItems: LineItem[];
  subtotalPence: number;
  vatPence: number;
  totalPence: number;
  status: InvoiceStatus;
  notes: string | null;
  createdAt: string;
};

export type InvoicesData = {
  items: InvoiceItem[];
  issuedCount: number;
  totalIssuedPence: number;      // sum of total_pence across non-void invoices
  source: "supabase" | "mock";
  generatedAt: string;
};
