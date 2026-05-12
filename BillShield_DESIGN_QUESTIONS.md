# BillShield — Design Questions

**Status:** All 8 questions locked
**Maps to:** Axis 1 (Structured Thinking) — primary; Axis 4 (Narrative) — supporting

The questions were answered in order. Each one constrains the next. Reading them in sequence is the fastest way to understand why BillShield is shaped the way it is.

---

## Q1 — Who exactly, at what moment?

### Primary user: Meera

Post-discharge, digitally savvy, manages family health insurance. Ankit's billing-counter crisis is the *emotional hook* in landing-page copy, not the product's primary use case.

### Trigger moment

A week after discharge. Patient is home, recovering. Meera has the itemized bill in one tab, the insurance reimbursement portal in the other. Either the insurer has rejected part of the claim, or a line item doesn't match what was discussed at admission. She half-remembers a WhatsApp forward about hospital overcharging. She thinks: *"Let me just check."*

### What this moment has that Ankit's doesn't

1. **Time** — she can spend 2 minutes uploading and reading
2. **A laptop or a calm phone** — not a frantic one-handed photo
3. **A real follow-through path** — she can actually send the dispute letter

### What BillShield replaces

"Pays and stews" + "Googles and gives up." Most people lose the fight before it starts — not because they accept the charges, but because they have no evidence and no playbook.

### Downstream decisions this locked in

| Decision | Set by Q1 |
|---|---|
| Landing hero copy | Ankit's pain as hook → Meera's moment as product |
| Mobile-first? | No. Desktop-first, mobile-responsive. |
| Dispute letter tone | Corporate-lawyer firm, citation-heavy. Not urgent. |
| Primary channel | WhatsApp forwards, LinkedIn, insurance-reimbursement SEO |
| Demo video opening | Ankit's pain (hook) → cut to Meera's calm audit (product) |

---

## Q2 — What does BillShield replace?

### The competitive alternatives

| Alternative | Why it fails |
|---|---|
| Pay and stew (most common) | She loses the money and the sleep |
| Argue at the counter | No evidence → gaslit → loses |
| Google the charges | 47 forum threads, no benchmark, gives up |
| Ask a CA / "uncle" | Slow, expensive, vague, often wrong |
| Office HR escalation | Only works if salaried + only for insurance, not the bill |

### The wedge

BillShield replaces **giving up**. The dominant Meera behavior is to either pay-and-stew or argue-and-lose — both end in the same place: she eats the loss because she has no data.

### Positioning statement

> For Indian families filing an insurance claim or auditing a hospital bill at home, BillShield is the only tool that gives them **verified government-rate evidence in under 2 minutes** — data they can defend.

### The killer interview quote

> *"Most of them are helpless, fact-less, no data at their thumbs to argue with or compare with, so they give up after everything or at the beginning."*

Working subhead: **"Stop arguing without evidence. Get verified rates for every line item."**

---

## Q3 — Why a 3-Prompt Pipeline?

### The locked architecture

| Stage | Owns | Does NOT own |
|---|---|---|
| **Extractor** | What the bill *says* + confidence levels | Whether the bill is *right* |
| **Analyst** | Whether each line is fair, overcharged, or unverifiable — with citations | Reading the bill, generating prose |
| **Letter Writer** | Turning the Analyst's verdict into a letter | Independent judgment about the bill |

### Alternatives considered and rejected

**Alt 1 — Mega-Prompt.** Cannot be guardrailed at the seams. Fabricated citations are undetectable.

**Alt 2 — Two Prompts.** Analysis and letter-writing optimize for different things. Conservative judgment (Analyst) vs. persuasive structure (Letter Writer) cannot coexist in one prompt.

**Alt 3 — Filter-Based UI.** Indian hospital bills don't print CGHS-matchable language. "CT brain plain" ≠ "CT Scan – Head/Brain (Plain Study), Code 401." LLM reasoning required for fuzzy matching.

**Alt 4 — Human-in-the-Loop.** Rejected for live product (no operator economics). Retained for eval phase: advocate reviews 2–3 letters during build.

### The seams — where risk lives

| Seam | Risk | Mitigation |
|---|---|---|
| Format mismatch | Extractor type drift breaks Analyst | Strict JSON schema validated programmatically |
| Info loss | Confidence signal stripped → hallucinated reads flagged | Confidence levels passed through every stage |
| Cross-stage hallucination | Extractor invents line item → Analyst matches it to CGHS → fabricated complaint | Sanity-check UI (user veto before letter) |

---

## Q4 — What's the irreducible core flow?

### Tier 0 — Non-negotiable (cut any of these and the product is dead)

1. Upload + file-type validation (PDF/JPG/PNG only, MIME-checked)
2. PII redaction before any text leaves the device
3. Extractor — line items + confidence levels
4. Analyst — flags + source citations (no citation = no flag)
5. Letter Writer — downloadable letter with banned-language filter
6. Results screen — what was flagged, why, with evidence
7. **Sanity-check UI** — user sees original bill alongside extracted items, confirms before letter generation

**Sanity-check UI rule:** Extracted-items panel renders *line items only*. Patient identity block (Aadhaar, PAN, phone, MRN) is NOT echoed back even in redacted form.

### The soul of BillShield: the proof moment

If forced to demo in 60 seconds, it is the moment a line item turns red and a CGHS citation appears next to it. *"Your CT was billed at ₹19,000. CGHS Code 401: ₹2,500. That's 660% above benchmark."*

Not the upload. Not the PII redaction. Not the letter. The flag-with-citation is what makes the user believe.

### Tier 1 — Defendable, cuttable under pressure

- "Try with a sample bill" button
- Total ₹ summary at top of results
- Download letter as PDF

### Tier 2 — Cut first

- Hindi/regional language bill handling
- Multi-page PDF handling beyond page 1
- Email-the-letter feature

### Deferred to v2

- In-app scan/photo capture module (auto edge detection, perspective correction, glare reduction)
- Accounts and bill history

### Out of scope for v1

- Handwritten bills. Target user (Meera) interacts exclusively with printed itemized bills from formal hospitals.

---

## Q5 — What's in the Knowledge Base?

Three primary pillars + one ceiling system. All four verified from primary sources.

### Pillar 1 — CGHS Rate Card

**Source:** OM F.No.5-16/CGHS(HQ)/HEC/2024(PartI), dated 03.10.2025, effective 13.10.2025.

All three CGHS tiers covered. Tier I rates explicit; Tier II/III derived as −10% / −20%. Three accreditation columns: Non-NABH / NABH / Super Speciality.

**Analyst complexity:** 5 decision layers per line item — rate matching, tier adjustment, accreditation adjustment, package-period awareness (follow-on procedures within package = 75% of rate), confidence cascade.

### Pillar 2 — NPPA Medicine Price List

**Source:** NPPA Updated Price List 30.01.2026. 3,681 medicine line items.

**Flagging rule:** Billed > NPPA ceiling = flag. Within ceiling = no flag, regardless of margin. Pharmacy margins within the legal band are permitted and not disputable.

### Pillar 3 — NPPA Device Price Caps

**Source:** DPCO 2013 Schedule I + Para 19.

- BMS: ₹10,692.69 + GST
- DES: ₹38,933.14 + GST
- Knee implants: capped till Nov 2026

Device line flagged. Implantation procedure fees absorb margin legally — out of scope.

### Pillar 4 — IRDAI Master Circular on Health Insurance

**Source:** IRDAI Master Circular, Version 1, 29.05.2024.

9 citable patient-rights rules — cashless 1hr/3hr TATs, reimbursement 15/45 days, Ombudsman ₹5,000/day penalty, Cashless Everywhere, lifetime renewal, 5-year moratorium.

### Deliberately out of v1

PMJAY, state rate cards, ESIC, insurer policy schedules, hospital package rates. Three earlier IRDAI uploads (Fraud Monitoring 2025, Cybersecurity 2026, Expenses of Management 2016) are **CLOSED** — insurer-governance docs, not patient rights.

---

## Q6 — What does "it works" mean?

BillShield works on an unseen bill when **all five** are true:

1. Every flag has a citation
2. Every citation is real (code exists, rate correct, math right)
3. No flag for unverifiable items — "Unverifiable" only
4. Letter passes advocate's tone test
5. User veto step ran before letter generation

**Threshold:** 3 unseen bills must pass all 5 bars at the revalidation gate.

---

## Q7 — Where does the product say "I don't know"?

**Organizing principle:** Every "I don't know" includes *what* was unknown and *why*. No silent failures.

| Stage | Failure mode | UX response |
|---|---|---|
| **Stage 1 — Extraction** | Bill too blurry or unreadable | Refuse to proceed: *"We can't read this bill clearly. Try a PDF or a clearer scan."* No partial output. |
| **Stage 2 — Analysis** | Real charge, no KB benchmark | *"Could not verify"* tag. Not included in dispute letter. |
| **Stage 3 — Letter generation** | Total flagged amount < ₹2,500 | *"We found ₹X in small overcharges. These may not be worth a formal dispute, but here's the breakdown."* No letter. |

**Threshold:** ₹2,500 minimum total flagged amount before a letter is offered.

**Deferred to v2:** In-app scan module. v1 ships with PDF upload + photograph fallback with named-reason error states.

---

## Q8 — Why now?

### The thesis (memorize for demo)

> *BillShield exists now because four things came together in the last 18 months. CGHS published its first comprehensive rate revision in years (October 2025), creating the verified benchmark that makes flagged charges defensible. NPPA's January 2026 medicine list extended that benchmarking to every pharmacy line. IRDAI's May 2024 Master Circular gave patients real leverage — 15-day claim settlements, 1-hour cashless approvals, ₹5,000-a-day penalties on insurers who ignore the Ombudsman. And vision-language models finally got good enough to read messy Indian hospital bills at three prompts for a few rupees, not forty. By 2027, CGHS rates revise again and incumbents like PolicyBazaar and ACKO will move deeper into claim help — but they're insurer-aligned and can't be patient-side trustworthy. The window for a free, no-login, independent tool to earn that trust is open right now.*

### Four enablers

1. **CGHS Oct 2025 overhaul** — primary. Condition of possibility. Effective 13.10.2025.
2. **NPPA Jan 2026 medicine list** — extends benchmarking to every pharmacy line.
3. **IRDAI Master Circular 29.05.2024** — gives the dispute letter teeth.
4. **Vision-language models at low cost** — three prompts at a few rupees vs ₹40+ previously.

### The failure state

PolicyBazaar makes money selling policies. ACKO is itself an insurer. Both have structural conflicts when advising patients on disputes *against* insurers. If they move first, they capture the *"I have a question about my hospital bill"* mental category. **The patient-side independent trust seat is open right now and probably occupied by 2027.**

### Landing page implication

Three negative claims incumbents cannot match:
- **No login**
- **No insurer affiliation**
- **No commission on your dispute**

---

## Cross-Question Synthesis

BillShield is built for the user who has already crossed from "let it go" into "I want to fight, but I don't know how" (Q1) — replacing the act of giving up (Q2) — architected so no single stage can fabricate a complaint (Q3) — scoped to a 7-element irreducible core with the proof moment as its soul (Q4) — grounded in three verified primary KB pillars (Q5) — acceptance-tested against five non-negotiable bars (Q6) — honest about what it doesn't know (Q7) — timed for an 18-month window that closes again in 2027 (Q8).

---

## Status Tracker

| Question | Status |
|---|---|
| Q1 — Who, at what moment? | ✅ Locked |
| Q2 — What does it replace? | ✅ Locked |
| Q3 — Why 3 prompts? | ✅ Locked |
| Q4 — Irreducible core? | ✅ Locked |
| Q5 — KB scope? | ✅ Locked |
| Q6 — What does "it works" mean? | ✅ Locked |
| Q7 — Where product says "I don't know"? | ✅ Locked |
| Q8 — Why now? | ✅ Locked |

**Design phase complete. Build phase active.**
