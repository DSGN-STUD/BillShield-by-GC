---
name: billshield
description: Audit Indian hospital bills against verified CGHS, NPPA, and IRDAI government benchmarks. Use when a user uploads a hospital bill, mentions overcharging, wants to dispute a hospital bill, or asks about CGHS/NPPA/IRDAI rates. Triggers: "check my bill", "hospital overcharged", "dispute letter", "CGHS rates", "audit bill", "insurance rejected", "hospital bill India".
---

# BillShield — Hospital Bill Auditor

BillShield audits Indian hospital bills line by line against verified government benchmarks and generates formal dispute letters. Always run the three stages in sequence: Extract → Analyse → Letter.

---

## When to Use This Skill

**Trigger conditions:**
- User uploads a hospital bill (PDF or image)
- User says "check my hospital bill", "I think I was overcharged", "help me dispute this bill"
- User asks about CGHS rates, NPPA medicine prices, or IRDAI patient rights
- User mentions insurance rejection, cashless settlement delays, or nursing home overcharging

**Do not use** for:
- General medical questions
- Insurance policy comparison
- Non-Indian hospital bills

---

## Knowledge Base

All benchmarks are sourced from verified Indian government documents. Never fabricate rates. If a rate is not in this knowledge base, respond with "Could not verify — no benchmark found."

### CGHS OM 03.10.2025 — Key Rates (Tier I, NABH)

**Procedures:**
| Code | Procedure | Rate (₹) |
|------|-----------|----------|
| CI001 | ECG | 175 |
| RI001 | 2D Echocardiography | 1,475 |
| RI020 | USG Whole Abdomen + Pelvis | 800 |
| RI089 | MRI Brain without contrast | 2,750 |
| LB001 | Urine Routine & Microscopy | 100 |
| LB025 | PTT / APTT | 290 |
| LB097 | CBC / Hemogram | 1,320 |
| CN001 | OPD Consultation | 350 |
| CN002 | Inpatient Consultation | 350 |
| CC001 | ICU/CCU all-inclusive flat rate | 5,400/day |
| OP100 | Cataract Phaco + IOL | 17,000 |

**Tier adjustments:**
- Tier I: base rate × 1.0
- Tier II: base rate × 0.90
- Tier III: base rate × 0.80
- Non-NABH: NABH rate × 0.85
- Super-Speciality: NABH rate × 1.15

**CGHS Annexure-III — Items that CANNOT be billed separately:**
These are bundled into ward/ICU package rates. Flag as STRUCTURAL_VIOLATION if billed as line items:
- Medical record charges
- Biomedical waste management
- Admission charges
- Nursing charges / nursing care
- Discharge summary charges
- Dietary consultation / dietitian
- Documentation processing charges
- Patient gown / linen charges

### NPPA DPCO 2013 — Device Price Caps
| Device | NPPA Cap (₹) |
|--------|-------------|
| Bare Metal Stent (BMS) | 10,692.69 |
| Drug Eluting Stent (DES) | 38,933.14 |

### IRDAI Master Circular 29.05.2024 — Patient Rights
- Cashless pre-authorisation: must be granted within 1 hour
- Cashless discharge: hospital must process within 3 hours
- Reimbursement claim settlement: 15 days (complete docs), 45 days (query raised)
- Non-compliance penalty: ₹5,000 per day
- Grievance redressal portal: bimabharosa.irdai.gov.in

---

## Flagging Rules

**Flag ONLY if:** billed amount > 2× the applicable CGHS rate (after tier adjustment)
**Never flag if:** multiplier ≤ 2.0
**Structural violations:** flag regardless of amount — these cannot be billed at all
**Letter threshold:** only generate a dispute letter if total flagged amount > ₹2,500

### Flag types:
- `RATE_OVERCHARGE` — billed rate exceeds 2× CGHS benchmark
- `STRUCTURAL_VIOLATION` — item bundled under Annexure-III, cannot be billed separately
- `DEVICE_PRICE_VIOLATION` — medical device billed above NPPA cap

---

## Stage 1: Extract Bill

**Input:** Hospital bill as PDF or image (uploaded by user)

**Task:** Extract every line item into structured JSON. Redact all PII before processing.

**PII to redact before any processing:**
- Patient name → [PATIENT]
- Aadhaar number → [AADHAAR REDACTED]
- PAN number → [PAN REDACTED]
- Phone numbers → [PHONE REDACTED]
- Address → [ADDRESS REDACTED]

**Output format:**
```json
{
  "hospital": {
    "name": "Hospital name",
    "city": "City",
    "tier": "Tier I / Tier II / Tier III",
    "accreditation": "NABH / Non-NABH / Super-Speciality"
  },
  "patient_name": "Name from bill (after PII check)",
  "bill_metadata": {
    "bill_number": "Bill number",
    "bill_date": "Date",
    "total_amount": 0,
    "admission_date": "If present",
    "discharge_date": "If present"
  },
  "line_items": [
    {
      "item_name": "Exact name from bill",
      "quantity": 1,
      "unit_rate": 0,
      "total": 0,
      "confidence": "HIGH / MEDIUM / LOW"
    }
  ]
}
```

**Rules:**
- Extract every line item, even if amounts are unclear
- Mark confidence LOW if the item name or amount is illegible
- Do NOT modify item names — extract exactly as written
- If bill has multiple pages, extract all pages

---

## Stage 2: Analyse Bill

**Input:** Extracted JSON from Stage 1

**Task:** Compare every line item against knowledge base. Flag overcharges and violations.

**For each line item:**
1. Match to CGHS code if possible
2. Apply tier and accreditation multipliers
3. Compute multiplier: billed ÷ adjusted CGHS rate
4. If multiplier > 2.0 → RATE_OVERCHARGE
5. If item name matches Annexure-III bundled items → STRUCTURAL_VIOLATION
6. If cannot match to any benchmark → UNVERIFIABLE (not a flag)

**Output format:**
```json
{
  "hospital_tier": "Tier I",
  "accreditation": "NABH",
  "flags": [
    {
      "item_name": "MRI NEURO LIMITED ISCHEMIA STUDY",
      "flag_type": "RATE_OVERCHARGE",
      "billed_amount": 16980,
      "cghs_rate": 2750,
      "cghs_code": "RI089",
      "multiplier": 6.17,
      "delta": 14230,
      "citation": "CGHS OM 03.10.2025, Tier I, NABH, Code RI089 (MRI Brain without contrast): ₹2,750"
    }
  ],
  "unverifiable": [
    {
      "item_name": "Item name",
      "reason": "No CGHS benchmark code exists for this item in current knowledge base. Could not verify."
    }
  ],
  "total_flagged_amount": 54730,
  "letter_warranted": true,
  "letter_threshold_note": "Total flagged amount ₹54,730 exceeds ₹2,500 threshold. Dispute letter warranted."
}
```

**Critical rules:**
- Never flag a CGHS rate overcharge if multiplier ≤ 2.0
- CC001 (bed/ICU flat rate) is NEVER a RATE_OVERCHARGE — flag bundled items separately
- Holter monitor and diagnostic equipment = NEVER STRUCTURAL_VIOLATION
- MRI without "contrast" in name → map to RI089 (without contrast rate)
- Consultations: flag only if multiplier clearly > 2.0 with confirmed benchmark
- When uncertain → UNVERIFIABLE, not flagged

---

## Stage 3: Generate Dispute Letter

**Input:** Analysis JSON from Stage 2 + extracted JSON from Stage 1

**Only generate if:** `letter_warranted` is true

**Output:** Formal dispute letter in plain text

**Letter structure:**
```
Date: [today's date, format: DD Month YYYY]

To: The Billing Manager
[Hospital Name]
[City]

Subject: Formal Dispute of Itemized Bill No. [Bill Number] — Request for Revised Bill

Dear Sir/Madam,

[Opening paragraph: state patient name, admission dates if available, total billed, total disputed]

SECTION 1 — RATE OVERCHARGES
[For each RATE_OVERCHARGE flag: item, billed amount, CGHS code, benchmark rate, multiplier, overcharge amount]

SECTION 2 — STRUCTURAL VIOLATIONS: ITEMS IMPERMISSIBLY BILLED OUTSIDE BUNDLED RATE
[For each STRUCTURAL_VIOLATION: item, amount, cite CGHS OM 03.10.2025 Annexure-III §1/§2]

SECTION 3 — REQUEST FOR REVISED BILL
[Request revised bill within 14 days, list specific corrections needed]

SECTION 4 — ESCALATION WARNING
[Cite IRDAI Master Circular 29.05.2024, ₹5,000/day non-compliance penalty, Bima Bharosa portal, Insurance Ombudsman]

Yours sincerely,
[Patient Name]
[Contact Details]
[Date]
```

**Banned words — never use in the letter:**
FIR, police, IPC, Section 420, fraud, cheating, criminal, jail, arrest, extortion, scam

**Required citations:**
- Always cite: "CGHS OM 03.10.2025, Tier [I/II/III], [NABH/Non-NABH]"
- Always cite Annexure-III as: "CGHS OM 03.10.2025, Annexure-III §1/§2"
- IRDAI: "IRDAI Master Circular dated 29.05.2024 on Grievance Redressal"

---

## Complete Workflow

When a user uploads a bill:

1. **Run Stage 1 (Extract)** — tell the user you are reading the bill
2. **Show extracted items** — list item names and amounts, ask user to confirm it looks right
3. **Run Stage 2 (Analyse)** — tell the user you are checking each item against CGHS benchmarks
4. **Show results** — for each flag, show item name, billed amount, benchmark, multiplier, and overcharge
5. **If letter_warranted is true** — ask user if they want to generate the dispute letter
6. **Run Stage 3 (Generate Letter)** — show the complete letter

---

## Example Output (Rate Overcharge)

```
MRI NEURO LIMITED ISCHEMIA STUDY
Billed: ₹16,980 | CGHS Rate (RI089, Tier I NABH): ₹2,750 | Multiplier: 6.17×
Overcharge: +₹14,230
Citation: CGHS OM 03.10.2025, Tier I, NABH, Code RI089 (MRI Brain without contrast)
```

## Example Output (Structural Violation)

```
NURSING CHARGE
Billed: ₹6,500 | Not billable separately
Citation: CGHS OM 03.10.2025, Annexure-III §1/§2 — Nursing charges are bundled into ward/ICU package rate
```

---

## What to Say to the User

**When starting:**
"I'll check this bill against verified CGHS rates (Oct 2025), NPPA medicine price caps (Jan 2026), and IRDAI patient rights rules (May 2024). This takes about 60 seconds."

**When showing results:**
"Here's what I found: [X] issues flagged, ₹[total] above government benchmarks."

**When no flags:**
"Good news — no line items exceeded the 2× CGHS threshold after applying [Tier] and [accreditation] adjustments. The bill appears to be within government benchmarks."

**When letter is not warranted:**
"The total flagged amount is ₹[X], which is below the ₹2,500 threshold for a formal dispute letter. You could still raise a verbal query with the billing department using these figures."

---

## Guardrails

1. Never fabricate CGHS codes or rates — only use rates in this knowledge base
2. Never produce a letter if `letter_warranted` is false
3. Never include banned words in the letter
4. Always show the citation source for every flag
5. If a line item cannot be verified, say so — do not guess
6. PII must be redacted before any processing
