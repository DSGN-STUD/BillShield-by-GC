# BillShield 🛡️
AI-powered hospital bill auditor for Indian families

> *"Most of them are helpless, fact-less — no data at their thumbs to argue with or compare with, so they give up."*

BillShield checks every line of your hospital bill against verified Indian government rates — CGHS, NPPA, and IRDAI — and generates a formal dispute letter you can send directly to the hospital or insurer. Free. No login. Under 2 minutes.

---

## The Problem

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

---

## MCP Server

BillShield is packaged as a **Model Context Protocol (MCP) server**, allowing any MCP-compatible client — Claude Desktop, Claude Code, or any LLM tool — to audit hospital bills directly without the web interface.

### MCP Architecture

```
┌──────────────────────────────────────────────────────┐
│              BillShield MCP Server                   │
│                billshield_mcp.py                     │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │                 4 MCP Tools                     │ │
│  │                                                 │ │
│  │  billshield_extract(file_path)                  │ │
│  │  → Bill PDF/photo → structured JSON             │ │
│  │                                                 │ │
│  │  billshield_analyze(extracted_json)             │ │
│  │  → JSON → flags with CGHS citations             │ │
│  │                                                 │ │
│  │  billshield_letter(extracted, analysis)         │ │
│  │  → Flags → formal dispute letter                │ │
│  │                                                 │ │
│  │  billshield_audit(file_path)                    │ │
│  │  → Full pipeline in one call                    │ │
│  └────────────────────────────────────────────────┘  │
│                        │                             │
│            Calls pipeline.py internally              │
│  (same extract_bill / analyze_bill / generate_letter)│
└──────────────────────────────────────────────────────┘
```

### Installation

```bash
pip install fastmcp anthropic
```

### Claude Desktop Setup

Add to `~/.claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "billshield": {
      "command": "python3",
      "args": ["/path/to/BillShield-by-GC/billshield_mcp.py"],
      "env": {
        "ANTHROPIC_API_KEY": "your-key-here"
      }
    }
  }
}
```

Restart Claude Desktop. All four tools are available in any Claude session.

### MCP Tool Reference

| Tool | Input | Output |
|------|-------|--------|
| `billshield_extract` | `file_path` — absolute path to PDF/JPG/PNG | JSON with hospital info, line items, metadata |
| `billshield_analyze` | `extracted_json` — output from extract | JSON with flags, citations, total flagged, letter warranted |
| `billshield_letter` | `extracted_json` + `analysis_json` | Plain text dispute letter or threshold message |
| `billshield_audit` | `file_path` — absolute path to bill | Full formatted audit report + letter if warranted |

### MCP Usage Example

In Claude Desktop after connecting the server:

```
Audit this hospital bill: /Users/gc/bills/bill.pdf
```

Claude calls `billshield_audit` and returns:
- Hospital name, city, tier, accreditation
- All flagged items with CGHS codes and multipliers
- Total flagged amount
- Dispute letter if total > ₹2,500

---

## Claude Code Skill

BillShield ships as a **Claude Code skill** — a self-contained knowledge file that teaches any Claude Code session how to audit hospital bills using only its context window. No Flask server. No MCP. No dependencies.

### Skill Structure

```
skills/billshield/SKILL.md
├── Trigger conditions (when to use this skill)
├── Complete knowledge base
│   ├── CGHS OM 03.10.2025 — 11 key rates + tier multipliers
│   ├── CGHS Annexure-III — bundled items that cannot be billed separately
│   ├── NPPA DPCO 2013 — stent price caps
│   └── IRDAI Master Circular 29.05.2024 — patient rights
├── Flagging rules (>2× threshold · structural violations · unverifiable)
├── Three-stage workflow (Extract → Analyse → Letter)
├── Structured JSON output format
├── Dispute letter format (4-section)
└── Guardrails (PII · banned words · citations only · ₹2,500 threshold)
```

### How to Use the Skill

In any Claude Code session:

```bash
# The skill is already in the repo at skills/billshield/SKILL.md
# Just reference it in your prompt:

"Read skills/billshield/SKILL.md.
Here is a hospital bill: [upload file]
Run the full BillShield audit."
```

Claude Code reads the embedded knowledge base and runs the full 3-stage pipeline in its context window — no API server needed.

### Trigger Phrases

The skill activates on:
- "check my hospital bill"
- "I think I was overcharged"
- "help me dispute this bill"
- "CGHS rates"
- "audit bill"
- "insurance rejected"
- "hospital bill India"

### When to Use Skill vs MCP vs Web App

| Method | Best for | Requires |
|--------|----------|---------|
| **Web app** | End users uploading bills via browser | Flask + API key running |
| **MCP server** | Claude Desktop · developer workflows | fastmcp + API key |
| **Claude Code Skill** | Claude Code sessions · no server needed | SKILL.md file only |
| **Public API** | External integrations · other LLMs | Running server + Bearer token |

---

## Public API

REST API with Bearer token authentication and rate limiting (60 req/hour).

```bash
curl -X POST https://your-api-url/v1/audit \
  -H "Authorization: Bearer your-api-key" \
  -F "file=@hospital_bill.pdf"
```

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/health` | GET | Health check — no auth required |
| `/v1/rates` | GET | CGHS benchmark rates by tier |
| `/v1/extract` | POST | File → extracted JSON |
| `/v1/analyze` | POST | JSON → flags with citations |
| `/v1/letter` | POST | Analysis → dispute letter |
| `/v1/audit` | POST | Full pipeline in one call |

See [API_DOCS.md](./API_DOCS.md) for full documentation.

---

## Guardrails

1. **PII redaction** — Aadhaar, PAN, phone stripped before any LLM call
2. **Prompt injection resistance** — adversarial inputs tested and blocked
3. **No fabricated citations** — "Could not verify" instead of guessing
4. **Banned language** — FIR, IPC, Section 420 removed from all letters
5. **Sanity check UI** — user confirms extracted items before analysis
6. **Empty extraction guard** — analyst blocked if no line items extracted
7. **₹2,500 threshold** — no letter unless total flagged exceeds threshold

---

## Evaluation — 4 Golden Dataset Bills

| Bill | Type | Result |
|------|------|--------|
| **A** | Clean cataract · ₹18,198 | ✅ 0 flags — true negative |
| **B** | Brain stroke · ₹1,35,820 | ✅ 15 flags · ₹54,730 flagged |
| **C** | Adversarial (PII + injection) | ✅ Blocked |
| **D** | Real photo · fever · ₹20,500 | ✅ 6 flags detected |

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
│   ├── landing.html
│   ├── index.html
│   └── advisors.html
│
├── skills/
│   └── billshield/
│       └── SKILL.md                # Claude Code skill
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

| Feature | Status |
|---------|--------|
| MCP server | ✅ Built |
| Public REST API | ✅ Built |
| Claude Code Skill | ✅ Built |
| Empty extraction guard | ✅ Built |
| Real legal advisor integrations | Planned |
| Case study page | Planned |
| Mobile app | Future |
| Vernacular support (Hindi, Tamil) | Future |

---

## Cost

**Total: ₹15,000 INR** — API subscriptions, Claude Pro, Google AI Studio, Lovable, tools.

---

## Built By

**Gurucharan** — Design Student, 100x Cohort · May 2026

*Informational tool only. Not legal advice.*
