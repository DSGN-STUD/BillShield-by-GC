BillShield
AI-powered hospital bill auditor for Indian families

> *"Most of them are helpless, fact-less — no data at their thumbs to argue with or compare with, so they give up."*

BillShield checks every line of your hospital bill against verified Indian government rates — CGHS, NPPA, and IRDAI — and generates a formal dispute letter you can send directly to the hospital or insurer. Free. No login. Under 2 minutes.

---

## The Problem

Indian families are routinely overcharged on hospital bills. When they ask questions, they're met with dismissal or silence. Without verified data, they give up.

| Patient | Bill | What happened |
|---------|------|---------------|
| Brain stroke · Tier I · Bengaluru | ₹1,35,820 | Insurance rejected 3 times. "I didn't wanna fight. I was kept in fear." |
| Cash patient · mid-tier hospital | ₹25,383 | "The billing team laughed when I asked why so much." |
| Cashless network patient | Settlement pending 30+ days | "I don't see the point of having insurance." |
| Eye surgery · Tier I | ₹55,000 | Foreign lens markup, no explanation given |
| Post-cataract (clean bill) | ₹18,198 | **0 flags** — BillShield confirms the bill is correct |

---

## What BillShield Does

```
Upload bill → Extract line items → Analyse against benchmarks → Generate dispute letter
```

1. **Upload** — PDF or photo of the hospital bill
2. **Extract** — AI reads every line item, redacts PII
3. **Sanity check** — user confirms the extracted items look right
4. **Analyse** — each line compared against CGHS/NPPA/IRDAI benchmarks
5. **Results** — flagged items with verified citations and overcharge amounts
6. **Letter** — formal 4-section dispute letter, ready to send in 14 days

---

## Real Results — Bill B (Brain Stroke Patient)

```
Total flagged: ₹54,730  ·  15 issues  ·  7 rate overcharges  ·  8 structural violations
```

| Item | Billed | CGHS Rate | Multiple | Overcharge |
|------|--------|-----------|----------|------------|
| MRI Brain (without contrast) | ₹16,980 | ₹2,750 (RI089) | **6.17×** | +₹14,230 |
| ECG | ₹1,250 | ₹175 (CI001) | **7.14×** | +₹1,075 |
| USG Abdomen & Pelvis | ₹4,060 | ₹800 (RI020) | **5.08×** | +₹3,260 |
| Echo Color Doppler | ₹4,540 | ₹1,475 (RI001) | **3.08×** | +₹3,065 |
| Nursing charges (×3) | ₹15,500 | Bundled | **not billable** | +₹15,500 |
| Medical record charges | ₹750 | Bundled | **not billable** | +₹750 |
| Admission charges | ₹2,000 | Bundled | **not billable** | +₹2,000 |

All structural violations cite **CGHS OM 03.10.2025, Annexure-III §1/§2**.

---

## Knowledge Base

| Source | Date | Coverage |
|--------|------|----------|
| **CGHS Office Memorandum** | 03.10.2025 | Procedure rates · Tier I/II/III · Annexure-III bundled items |
| **NPPA Price List** | 30.01.2026 | 3,681 medicine price ceilings |
| **NPPA DPCO** | 2013 | Device caps — BMS ₹10,692 · DES ₹38,933 |
| **IRDAI Master Circular** | 29.05.2024 | 9 patient rights · ₹5,000/day non-compliance penalty |

**Flagging rule:** Items flagged only if billed at more than **2× the applicable CGHS rate**.
**Letter threshold:** Dispute letter generated only if total flagged > **₹2,500**.

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                BillShield Pipeline              │
│                                                 │
│  Bill PDF / Photo                               │
│        │                                        │
│        ▼                                        │
│  ┌───────────┐   ┌───────────┐   ┌────────────┐ │
│  │  Stage 1  │   │  Stage 2  │   │  Stage 3   │ │
│  │ Extractor │──▶│  Analyst  │──▶│   Letter   │ │
│  │           │   │           │   │   Writer   │ │
│  │ Reads bill│   │ CGHS/NPPA │   │ 4-section  │ │
│  │ JSON out  │   │ IRDAI     │   │ dispute    │ │
│  │ PII clean │   │ Flag items│   │ letter     │ │
│  └───────────┘   └───────────┘   └────────────┘ │
└─────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| AI Model | Claude Sonnet 4.6 (Anthropic) |
| Backend | Python 3 + Flask + flask-cors |
| Frontend | React 18 (CDN) + Babel — no build step |
| Prompts | Separate `.txt` files per stage |
| Deploy | ngrok (demo) → Render (production) |

### API Routes

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/` | Redirects to landing page |
| `GET` | `/landing.html` | Marketing landing page |
| `GET` | `/index.html` | The tool — 4 screens |
| `POST` | `/api/extract` | File upload → extracted JSON |
| `POST` | `/api/analyze` | Extracted JSON → flags with citations |
| `POST` | `/api/letter` | Analysis + extracted → dispute letter |
| `GET` | `/health` | `{"status": "ok"}` |

---

## Guardrails

1. **PII redaction** — Aadhaar, PAN, phone stripped before any LLM call
2. **Prompt injection resistance** — adversarial inputs tested and blocked
3. **No fabricated citations** — "Could not verify" instead of guessing
4. **Banned language** — FIR, IPC, Section 420, fraud removed from letters
5. **Sanity check UI** — user confirms extracted items before analysis
6. **Letter threshold** — no letter unless total flagged > ₹2,500

---

## Evaluation — 4 Bills

| Bill | Type | Extractor | Analyst | Letter |
|------|------|-----------|---------|--------|
| **A** | Clean cataract · ₹18,198 | ✅ 21 items | ✅ **0 flags** | — |
| **B** | Brain stroke · ₹1,35,820 | ✅ 21 items | ✅ 15 flags · ₹54,730 | ✅ |
| **C** | Adversarial (PII + injection) | ✅ Blocked | — | — |
| **D** | Photo · fever · ₹20,500 | ✅ OCR works | ✅ 6 flags | — |

---

## Project Structure

```
BillShield-by-GC/
├── app.py                          # Flask backend
├── pipeline.py                     # 3-stage AI pipeline
├── billshield_mcp.py               # MCP server (4 tools)
├── billshield_api.py               # Public REST API
├── requirements.txt
├── Procfile
│
├── prompts/
│   ├── extractor.txt
│   ├── analyst.txt
│   └── letter_writer.txt
│
├── frontend/
│   ├── landing.html                # Landing page
│   ├── index.html                  # Tool — 4 screens
│   └── advisors.html               # Legal advisor directory
│
├── skills/billshield/SKILL.md      # Claude Code skill
│
├── BillShield_DESIGN_QUESTIONS.md
├── BillShield_INTERVIEW_INSIGHTS.md
├── BillShield_GOLDEN_DATASET.md
├── BillShield_Eval_Design.md
└── API_DOCS.md
```

---

## Running Locally

```bash
git clone https://github.com/DSGN-STUD/BillShield-by-GC.git
cd BillShield-by-GC

pip3 install anthropic flask flask-cors gunicorn

export ANTHROPIC_API_KEY=your-key-here

python3 app.py
# Open http://localhost:8080/landing.html
```

---

## MCP Server

```json
{
  "mcpServers": {
    "billshield": {
      "command": "python3",
      "args": ["/path/to/BillShield-by-GC/billshield_mcp.py"],
      "env": { "ANTHROPIC_API_KEY": "your-key" }
    }
  }
}
```

Four tools: `billshield_extract` · `billshield_analyze` · `billshield_letter` · `billshield_audit`

---

## Design Decisions

Eight questions answered before writing a single line of code:

| # | Question | Decision |
|---|----------|----------|
| Q1 | Who is the user? | Meera — post-discharge, at home |
| Q2 | What does it replace? | Giving up |
| Q3 | Why 3 prompts? | One job per stage — prevents hallucination cascade |
| Q4 | What is the soul? | The proof moment — ₹54,730 with citations |
| Q5 | Which knowledge base? | CGHS · NPPA · IRDAI |
| Q6 | Threshold for flagging? | >2× CGHS rate only |
| Q7 | When to generate a letter? | >₹2,500 total |
| Q8 | Why now? | Window closes ~2027 |

---

## v2 Roadmap

- MCP server — built, not deployed
- Public REST API with auth + rate limiting — built
- Claude Code Skill — built
- Real legal advisor integrations with Whatsapp support - frontend available
- Case study page with 4 patient stories
- Mobile app
- Vernacular support (Hindi, Tamil)

---

## Cost to Build

**Total: ₹15,000 INR** — API subscriptions, Claude Pro, Google AI Studio, Lovable, tools.

---

## Built By

**Gurucharan Ganesan** — · May 2026

*Informational tool only. Not legal advice.*
