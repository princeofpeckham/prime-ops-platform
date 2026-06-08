// Minimal typed Gmail REST client for server-side ingestion.
// Uses an OAuth refresh token (single inbox, read-only). No external SDK.

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const GMAIL_BASE = "https://gmail.googleapis.com/gmail/v1/users/me";

type TokenResponse = { access_token?: string; error?: string; error_description?: string };
type ListResponse = { messages?: { id: string }[]; resultSizeEstimate?: number };
type GmailHeader = { name: string; value: string };
type GmailPart = {
  mimeType?: string;
  headers?: GmailHeader[];
  body?: { data?: string };
  parts?: GmailPart[];
};
type GmailMessage = {
  id: string;
  threadId: string;
  snippet?: string;
  internalDate?: string;
  payload?: GmailPart;
};

export type RawEmail = {
  id: string;
  threadId: string;
  from: string;       // bare lowercased address
  to: string;
  subject: string;
  body: string;
  receivedAt: string; // ISO
};

export async function getAccessToken(): Promise<string> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      refresh_token: process.env.GMAIL_REFRESH_TOKEN ?? "",
      grant_type: "refresh_token"
    })
  });
  const json = (await res.json()) as TokenResponse;
  if (!res.ok || !json.access_token) {
    throw new Error(`Gmail token exchange failed: ${json.error ?? res.status} ${json.error_description ?? ""}`);
  }
  return json.access_token;
}

export async function listLabelMessageIds(accessToken: string, labelId: string, max = 25): Promise<string[]> {
  const res = await fetch(`${GMAIL_BASE}/messages?labelIds=${encodeURIComponent(labelId)}&maxResults=${max}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!res.ok) throw new Error(`Gmail list failed: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as ListResponse;
  return (json.messages ?? []).map((m) => m.id);
}

function headerValue(payload: GmailPart | undefined, name: string): string {
  const h = (payload?.headers ?? []).find((x) => x.name.toLowerCase() === name.toLowerCase());
  return h?.value ?? "";
}

function decodeBase64Url(data?: string): string {
  return data ? Buffer.from(data, "base64url").toString("utf8") : "";
}

function extractPlainText(part: GmailPart | undefined): string {
  if (!part) return "";
  if (part.mimeType === "text/plain" && part.body?.data) return decodeBase64Url(part.body.data);
  for (const child of part.parts ?? []) {
    const found = extractPlainText(child);
    if (found) return found;
  }
  if (part.mimeType === "text/html" && part.body?.data) {
    return decodeBase64Url(part.body.data).replace(/<[^>]+>/g, " ");
  }
  return "";
}

function bareAddress(from: string): string {
  const m = from.match(/<([^>]+)>/);
  return (m ? m[1] ?? from : from).trim().toLowerCase();
}

export async function getMessage(accessToken: string, id: string): Promise<RawEmail> {
  const res = await fetch(`${GMAIL_BASE}/messages/${id}?format=full`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!res.ok) throw new Error(`Gmail get failed: ${res.status} ${await res.text()}`);
  const msg = (await res.json()) as GmailMessage;
  const body = (extractPlainText(msg.payload) || msg.snippet || "").replace(/\s+/g, " ").trim().slice(0, 8000);
  const ts = Number(msg.internalDate ?? 0);
  return {
    id: msg.id,
    threadId: msg.threadId,
    from: bareAddress(headerValue(msg.payload, "From")),
    to: headerValue(msg.payload, "To"),
    subject: headerValue(msg.payload, "Subject"),
    body,
    receivedAt: new Date(ts).toISOString()
  };
}
