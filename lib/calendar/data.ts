import type { CalendarData } from "./types";
import { generateMockCalendar } from "./mock";
import { fetchCalendarFromSupabase } from "./queries";

export async function getCalendarData(): Promise<CalendarData> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    return generateMockCalendar();
  }
  return fetchCalendarFromSupabase();
}
