import type { InvoiceItem, InvoicesData } from "./types";
import { findMockInvoice, generateMockInvoices } from "./mock";
import { fetchInvoiceFromSupabase, fetchInvoicesFromSupabase } from "./queries";

export async function getInvoicesData(): Promise<InvoicesData> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    return generateMockInvoices();
  }
  return fetchInvoicesFromSupabase();
}

export async function getInvoiceItem(id: string): Promise<InvoiceItem | null> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    return findMockInvoice(id);
  }
  return fetchInvoiceFromSupabase(id);
}
