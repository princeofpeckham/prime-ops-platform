// Deterministic demo invoices for mock/preview mode. Issued dates are relative
// to today so the list feels current; numbers, brands and line items are fixed
// and line up with the mock deposits (same brands and properties).

import { addDaysIso, londonToday } from "@/lib/utils";
import { computeTotals } from "./logic";
import type { LineItem } from "./logic";
import type { InvoiceItem, InvoicesData, InvoiceStatus } from "./types";

type Seed = {
  id: string;
  invoiceNumber: string;
  property: string;
  brand: string;
  bookingRef: string;
  issuedOffset: number;          // days from today the invoice was issued
  status: InvoiceStatus;
  lineItems: LineItem[];
};

const SEEDS: Seed[] = [
  {
    id: "inv1",
    invoiceNumber: "DARB019",
    property: "D'arblay",
    brand: "Aesop",
    bookingRef: "B1-8F-A3",
    issuedOffset: -1,
    status: "issued",
    lineItems: [
      { item: "Standard Cleaning", quantity: 1, ratePence: 15000, waived: false },
      { item: "Collection Services", quantity: 1, ratePence: 12000, waived: true }
    ]
  },
  {
    id: "inv2",
    invoiceNumber: "GREE007",
    property: "Greek St",
    brand: "Ganni",
    bookingRef: "B1-4C-D7",
    issuedOffset: -3,
    status: "issued",
    lineItems: [
      { item: "Key Replacement", quantity: 2, ratePence: 5000, waived: false },
      { item: "Standard Cleaning", quantity: 1, ratePence: 15000, waived: false }
    ]
  },
  {
    id: "inv3",
    invoiceNumber: "HAYH012",
    property: "Hay Hill",
    brand: "Diptyque",
    bookingRef: "B1-2A-F9",
    issuedOffset: -12,
    status: "paid",
    lineItems: [
      { item: "Late Checkout", quantity: 1, ratePence: 10000, waived: false }
    ]
  },
  {
    id: "inv4",
    invoiceNumber: "PADD003",
    property: "Paddington",
    brand: "Allbirds",
    bookingRef: "B1-6E-B2",
    issuedOffset: -20,
    status: "void",
    lineItems: [
      { item: "Standard Cleaning", quantity: 1, ratePence: 15000, waived: false },
      { item: "Collection Services", quantity: 1, ratePence: 12000, waived: false }
    ]
  }
];

function buildItem(seed: Seed, todayIso: string): InvoiceItem {
  const totals = computeTotals(seed.lineItems);
  const issued = addDaysIso(todayIso, seed.issuedOffset);
  return {
    id: seed.id,
    invoiceNumber: seed.invoiceNumber,
    propertyId: `p-${seed.property.toLowerCase().replace(/[^a-z]/g, "")}`,
    propertyName: seed.property,
    bookingId: `bk-${seed.id}`,
    bookingRef: seed.bookingRef,
    brandName: seed.brand,
    billedToName: `${seed.brand.toUpperCase()} LIMITED`,
    billedToAddress: null,
    issuedDate: issued,
    lineItems: seed.lineItems,
    subtotalPence: totals.subtotalPence,
    vatPence: totals.vatPence,
    totalPence: totals.totalPence,
    status: seed.status,
    notes: null,
    createdAt: `${issued}T10:00:00Z`
  };
}

export function generateMockInvoices(now: Date = new Date()): InvoicesData {
  const todayIso = londonToday(now);
  const items = SEEDS.map((s) => buildItem(s, todayIso)).sort((a, b) =>
    (b.issuedDate ?? "").localeCompare(a.issuedDate ?? "")
  );
  return {
    items,
    issuedCount: items.filter((it) => it.status === "issued").length,
    totalIssuedPence: items
      .filter((it) => it.status !== "void")
      .reduce((sum, it) => sum + it.totalPence, 0),
    source: "mock",
    generatedAt: now.toISOString()
  };
}

export function findMockInvoice(id: string, now: Date = new Date()): InvoiceItem | null {
  return generateMockInvoices(now).items.find((it) => it.id === id) ?? null;
}
