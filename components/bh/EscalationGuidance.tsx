// Escalation guidance for brand hosts, adapted from the Brand Host Hub
// escalation tree. Content only, styled with Tailwind to match the ops console.
// Uses native details/summary so it needs no client JavaScript.

import { Badge } from "@/components/ui/Badge";

const OPS_PHONE = "+44 7862 144607";
const OFFICE_PHONE = "+44 (0)203 096 2180";

type Tone = "alert" | "accent" | "neutral";

type Row = { situation: string; action: string; callOps?: boolean; callOffice?: boolean };

type Section = { title: string; tone: Tone; rows: Row[] };

const SECTIONS: Section[] = [
  {
    title: "Access and key issues",
    tone: "accent",
    rows: [
      {
        situation: "KeyNest code not working",
        action:
          "Generate a new code in the app. If it still fails, log out and back in. If the code still will not generate, call Ops.",
        callOps: true
      },
      {
        situation: "KeyNest store is closed",
        action:
          "Check the space guide for backup keys stored nearby. If there are none, call Ops immediately.",
        callOps: true
      },
      {
        situation: "Key does not open the lock",
        action:
          "Check you have the right key and the right door, labelled in the space guide. Troubleshoot doors and shutters thoroughly and try any backup sets before calling Ops. Only call if a key seems genuinely missing.",
        callOps: true
      },
      {
        situation: "Alarm going off",
        action:
          "Check the space guide for the alarm code. If you do not have it or it does not work, call Ops. Do not leave the alarm sounding.",
        callOps: true
      }
    ]
  },
  {
    title: "Space condition on arrival",
    tone: "accent",
    rows: [
      {
        situation: "Space is dirty or not presentable",
        action:
          "Flag it in your condition report with clear photos and message Ops on Slack. For a check in, make it as presentable as you can and flag for a proper clean. For a viewing, reassure the brand the space is thoroughly cleaned before any tenancy."
      },
      {
        situation: "Damage found on arrival",
        action:
          "Photograph anything that looks excessively damaged and complete your condition report as normal. This is critical for deposit decisions, so also flag to Ops on Slack."
      },
      {
        situation: "Utilities not working (power, water, heating)",
        action:
          "Check the fuse box, stopcock or thermostat (locations in the space guide). If you cannot fix it, call Ops. If a brand is checking in, let them know you are on it.",
        callOps: true
      }
    ]
  },
  {
    title: "Viewings, check ins and check outs",
    tone: "neutral",
    rows: [
      {
        situation: "Brand is late to a viewing or check in",
        action:
          "Message the brand after 5 to 10 minutes. If there is no show and no reply, message concierge on Slack and wait another 15 minutes. After 30 minutes total, call the office to be told how to proceed, then log it as a no show.",
        callOffice: true
      },
      {
        situation: "Brand asks about pricing or discounts",
        action:
          "Direct them to their concierge. Do not quote prices, negotiate or promise discounts. You can say their concierge will talk through pricing and availability."
      },
      {
        situation: "Brand not ready to leave at checkout",
        action:
          "Politely remind them of the checkout time. Late fees apply per hour against the deposit. If they need more time, call Ops. Do not discuss deposit deductions with the brand.",
        callOps: true
      }
    ]
  },
  {
    title: "Your shift",
    tone: "neutral",
    rows: [
      {
        situation: "You cannot make your shift",
        action:
          "Message the BH group chat as soon as you know. If it is less than 2 hours before, also call Ops. On day cancellations are logged and 3 in total means removal from the roster.",
        callOps: true
      },
      {
        situation: "You are running late",
        action:
          "Message Ops on Slack immediately with your ETA. If you will be more than 15 minutes late, call Ops so we can manage the brand.",
        callOps: true
      },
      {
        situation: "You are asked to do something outside your role",
        action:
          "You are not expected to carry out repairs, handle money, accept deliveries for brands or make promises about bookings. Politely say you will pass it to the team, then message Ops on Slack."
      }
    ]
  },
  {
    title: "Emergency and safety",
    tone: "alert",
    rows: [
      {
        situation: "Fire, gas smell or smoke",
        action: "Evacuate immediately. Call 999. Do not re enter. Then call Ops.",
        callOps: true
      },
      {
        situation: "Flood or water leak",
        action:
          "Turn off the water at the stopcock if safe (location in the space guide). Move brand stock away from the water. Call Ops immediately.",
        callOps: true
      },
      {
        situation: "Break in, theft or suspicious activity",
        action: "Do not confront anyone. Leave the space and call Ops. If you feel unsafe, call 999 first.",
        callOps: true
      },
      {
        situation: "Medical emergency",
        action: "Call 999. Stay with the person until help arrives. Then notify Ops.",
        callOps: true
      }
    ]
  }
];

export function EscalationGuidance() {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 px-4 py-3">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-700">
            Escalation guidance
          </h2>
          <p className="mt-0.5 text-[11px] text-neutral-500">
            What to do when something goes wrong on a shift.
          </p>
        </div>
        <a
          href={`tel:${OPS_PHONE.replace(/[^+\d]/g, "")}`}
          className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
        >
          Call Ops: {OPS_PHONE}
        </a>
      </div>

      <div className="divide-y divide-neutral-100">
        {SECTIONS.map((section) => (
          <details key={section.title} className="group px-4 py-2">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 py-1.5 text-sm font-medium text-neutral-800 marker:hidden">
              <span className="flex items-center gap-2">
                <Badge tone={section.tone}>{section.tone === "alert" ? "Urgent" : "Guide"}</Badge>
                {section.title}
              </span>
              <span className="text-neutral-400 transition group-open:rotate-180">v</span>
            </summary>
            <div className="flex flex-col gap-2 pb-2 pt-1">
              {section.rows.map((row) => (
                <div key={row.situation} className="rounded-md bg-neutral-50 px-3 py-2">
                  <p className="text-[13px] font-medium text-neutral-900">{row.situation}</p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-neutral-600">{row.action}</p>
                  {row.callOps ? (
                    <a
                      href={`tel:${OPS_PHONE.replace(/[^+\d]/g, "")}`}
                      className="mt-1.5 inline-flex items-center rounded bg-neutral-200 px-2 py-0.5 text-[11px] font-medium text-neutral-800 hover:bg-neutral-300"
                    >
                      Call Ops
                    </a>
                  ) : null}
                  {row.callOffice ? (
                    <a
                      href={`tel:${OFFICE_PHONE.replace(/[^+\d]/g, "")}`}
                      className="mt-1.5 inline-flex items-center rounded bg-neutral-200 px-2 py-0.5 text-[11px] font-medium text-neutral-800 hover:bg-neutral-300"
                    >
                      Call Office
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>

      <div className="flex flex-col gap-1 border-t border-neutral-100 px-4 py-3 text-[11px] text-neutral-500">
        <span className="font-semibold uppercase tracking-wide text-neutral-400">Key contacts</span>
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          <span>
            Ops{" "}
            <a className="text-neutral-700 hover:underline" href={`tel:${OPS_PHONE.replace(/[^+\d]/g, "")}`}>
              {OPS_PHONE}
            </a>
          </span>
          <span>
            Office{" "}
            <a className="text-neutral-700 hover:underline" href={`tel:${OFFICE_PHONE.replace(/[^+\d]/g, "")}`}>
              {OFFICE_PHONE}
            </a>
          </span>
          <span>Slack #brandhostxconcierge</span>
        </div>
      </div>
    </section>
  );
}
