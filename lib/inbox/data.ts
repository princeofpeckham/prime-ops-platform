import type { InboxData } from "./types";
import { generateMockInbox } from "./mock";
import { fetchInboxFromSupabase } from "./queries";

export async function getInboxData(): Promise<InboxData> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    return generateMockInbox();
  }
  return fetchInboxFromSupabase();
}
