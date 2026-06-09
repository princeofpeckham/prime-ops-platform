# PRIME Ops Platform: Product Outline

> A living, editable outline of where this product is headed. Read it, scribble
> on it, change anything. Lines marked **EDIT:** are open questions for you.
> Nothing here is locked. Last updated as part of Phase A (multi tenancy).

---

## 1. What we are building, in one line

An all in one operations tool for short term retail landlords: every enquiry
that lands in your inbox becomes a tracked card, moves through a funnel, and
when it turns into a booking the platform runs the whole operation (viewings,
check ins, check outs, cleans, maintenance, deposits) as autonomously as
possible.

**Who it is for:** first Appear Here (in house), then other short term retail
landlords. The product is multi tenant from day one, so each landlord sees only
their own properties, enquiries, and team.

**EDIT:** in your words, what is the single biggest pain this removes? (mine:
"enquiries and ops live in 6 different tools and nothing talks to each other").

automated rule sending - having property condition remain consistent as rules are clear and adhered to by tenants.

[insert note with wisper flow about how landlords hire property mangaers who have deal with high volume input from appear here and other similar platforms or their own audience. FAQs are a bottleneck - autonomy is justified] 
[no real crm built for this] [no access to vendor and automated triggers with brandhosts] [an all-in-one property management system (not just software but hardware too)]
[the machinery behind prime]
[also add note about offering landlords bhs - keynest storing, painting, contractors, just in general offering the prime machine to any landlord who wants it]

---

## 2. The two halves of the product

**Front of funnel (new): the Inbox + Pipeline.**
Inbound enquiries (mostly email) get read, understood, and filed as cards. Each
card carries: brand or tenant name, value of the request, dates requested,
property or area of interest, and a funnel stage. This is the CRM that did not
exist before.

**Back of house (already built in Phase 1): the Ops Engine.**
Bookings, brand host shifts, cleaning jobs, condition reports, vendors, and
deposits. This is the machinery that runs once an enquiry becomes a booking.

The new front of funnel sits in front of the existing engine. When a card
reaches "in offer", it promotes into a real booking and the engine takes over.
Nothing from Phase 1 is thrown away.

---

## 3. The funnel (enquiry stages)

```
request  ->  viewing  ->  in offer  ->  pre check in  ->  in tenancy  ->  post check out
                                                                              |
                                                                          (lost / declined)
```

- **request:** a new enquiry just arrived, not yet qualified.
- **viewing:** a viewing is being arranged or has happened.
- **in offer:** terms are out, this is becoming a booking.
- **pre check in:** booked, getting the space and tenant ready.
- **in tenancy:** tenant is in the space.
- **post check out:** stay finished, deposit and condition being settled.

**EDIT:** are these the right six stages? Add, remove, or rename freely.

---

## 4. The agents (what runs autonomously, in tandem)

Think of these as a small team of always on workers. Each one has a trigger,
a narrow job, and clear inputs and outputs. They share one database, so the
output of one becomes the input of the next. None of them act blindly: early
on, anything they send to a human goes out as a draft for one click approval.

| Agent                 | Trigger                                         | What it does                                                                           | Writes to                     |
| --------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------- | ----------------------------- |
| **Inbox Scanner**     | New email (Gmail now; forwarding address later) | Reads the message, decides if it is an enquiry, a space query, or noise                | email_messages                |
| **Enquiry Extractor** | New enquiry email                               | Pulls structured fields (brand, value, dates, space) into a card, flags "needs review" | enquiries                     |
| **Reply Drafter**     | New or updated enquiry                          | Drafts a reply grounded in that space's facts, for ops to approve or auto send         | enquiry_events, notifications |
| **Scheduler**         | Card reaches viewing / in offer                 | Proposes and books viewing, check in, check out slots; creates the shifts and cleans   | shifts, cleaning_jobs         |
| **Space Concierge**   | A "space query" email (rules, access, hours)    | Answers common questions from the space knowledge base                                 | notifications                 |
| **Chase Agent**       | Daily                                           | Nudges stalled enquiries, unconfirmed cleaners, and silent vendors                     | notifications, vendor_jobs    |
| **Deposit Agent**     | Daily                                           | Watches the 14 day deposit window, proposes deductions, auto refunds on time           | deposits                      |
| **Briefing Agent**    | Each morning                                    | One summary of today: arrivals, gaps, overdue items, deadlines                         | (report only)                 |

[needs whatsapp / sms integration so LLs or prop managers can interact easily. also needs to be an iphone app eventually.]

**EDIT:** which of these matter most to you, and which should never act without
you pressing a button? Mark them.

**EDIT:** any agent missing? (candidates: pricing/availability quoter, invoice
pre filler, review/feedback collector.) [upsell]

---

## 5. How it runs (plain architecture)

```
   Email inbox (Gmail / forwarded mail)
              |
        [ Inbox Scanner ]            <- background job, triggered per email
              |
        Supabase database  <------------------------------+
        (all data + access rules, one row per org)        |
              |                                            |
   +----------+-----------+                                |
   |                      |                                |
[ The app ]          [ Background jobs ]                   |
 Next.js on Vercel    scheduled + event driven workers ----+
 the screens you      (the agents above), each one a
 click: Inbox,        small step that reads and writes
 Calendar, Ops        the database, calls Claude when it
 Command Centre       needs to read or write language
```

Pieces in real terms:
- **The app:** Next.js, hosted on Vercel. The screens (Inbox, Calendar, Command
  Centre, Settings). Server rendered, fast.
- **The database:** Supabase (Postgres). One source of truth. Row level security
  keeps each landlord's data separate. This is done and live.
- **Background jobs / cron:** the agents. Some run on a clock (morning briefing,
  daily chase, deposit watch). Some run on an event (email arrives, card moves
  stage). Recommended engine: **Inngest** (writes like normal code, runs durably,
  good fit with Vercel). This replaces the old n8n plan for anything we ship to
  customers; n8n stays only as optional internal glue for Appear Here's Looker.
- **The language brain:** **Claude** does the reading (turn an email into a card)
  and the writing (draft a grounded reply). Always cited to that space's own
  facts so it cannot invent policy.
- **Comms out:** email replies, and SMS via Aircall for time sensitive nudges.

**EDIT:** comfortable with Inngest as the job engine, or do you want to see one
alternative (Trigger.dev) first?

---

## 6. The screens

- **Inbox:** kanban of enquiry cards by funnel stage. Click a card for the full
  thread, parsed details, a drafted reply, and stage controls. *(Phase B)*
- **Calendar:** one multi property view of viewings, check ins, check outs,
  cleans, and one off maintenance. *(Phase D)*
- **Command Centre:** the 14 day operational timeline and property health.
  *(built in Phase 1)* [wtf is property health]
  [we don't really care too much about this : put thoughts here]
- **Settings:** per landlord automation rules and the space knowledge base that
  grounds the agents. *(Phase E)*
- Plus the brand host and cleaner views from Phase 1.

**EDIT:** is the Inbox the right home screen for a landlord, or should the
Calendar be the front door?

---

## 7. Safety model (so autonomy does not bite)

1. **Draft first, send later.** Every agent action starts as a draft a human
   approves. Per landlord, you can later flip high confidence actions to auto.
2. **Grounded answers only.** The Space Concierge answers from the landlord's own
   space knowledge, never from guesses.
	1. [landlord could change certain things about the space - send a text to the agent and it will be updated in the correct db so future queries are informed with up to date info]
3. **Org isolation.** Enforced in the database, not just the app. Proven in
   testing: one landlord can never see another's data.
4. **Everything logged.** Each message and stage change is recorded per card.

---

## 8. Build phases

- [x] **Phase 1:** Foundation, auth, Ops Command Centre. Live.
- [x] **Phase A:** Multi tenancy (organizations, memberships, org scoped rules).
- [ ] **Phase B:** Inbox + pipeline CRM (cards, kanban, manual entry first,
      promote to booking). The first new screen you will use.
- [ ] **Phase C:** Email ingestion (Gmail scan, Claude extraction into cards).
- [ ] **Phase D:** Calendar + one off maintenance.
- [ ] **Phase E:** Automation rules + space knowledge + grounded replies.
- [ ] **Phase F:** More autonomy (auto send high confidence actions) + analytics.

**EDIT:** is this the order you want, or should something jump the queue?

---

## 9. Open questions to settle

- **EDIT:** Gmail access for Appear Here: connect the whole inbox, or a single
  label/address we forward enquiries into? (smaller scope is safer to start.)
	- "[PLUS] label"
- **EDIT:** For other landlords, is "forward your enquiries to one address" an
  acceptable setup step, or must we read their inbox directly?
	- I suggest we create a new inbox for them - ie auto forward or setup a new domain and email for their enquiries - most will already have one.  
- **EDIT:** What counts as a "space query" we should auto answer vs always
  escalate to a human?
- **EDIT:** Pricing model later (per property, per seat, flat)? Affects how we
  meter usage, worth noting now even if not built.
- **EDIT:** Any landlord you already have in mind as the second tenant, so we
  build for a real second case and not a hypothetical one?

---

*How to use this doc: edit anything, especially the EDIT lines. When you are
happy, tell me and I will fold your changes into the build plan and keep this
file in sync as we ship each phase.*
