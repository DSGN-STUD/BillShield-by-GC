import re
import json
import sys
import base64
from datetime import date
from pathlib import Path

import anthropic

# --- Stage 0: PII Redaction (runs BEFORE any LLM call) ---

AADHAAR_RE = re.compile(r"\b\d{4}\s\d{4}\s\d{4}\b")
PAN_RE = re.compile(r"\b[A-Z]{5}\d{4}[A-Z]\b")
PHONE_RE = re.compile(r"\b(?:\+91[\s-]?)?[6-9]\d{9}\b")

def redact_pii(text: str) -> str:
    text = AADHAAR_RE.sub("[AADHAAR REDACTED]", text)
    text = PAN_RE.sub("[PAN REDACTED]", text)
    text = PHONE_RE.sub("[PHONE REDACTED]", text)
    return text


# --- Stage 1: Extractor ---

def extract_bill(bill_path: str) -> dict:
    path = Path(bill_path)
    system_prompt = Path("prompts/extractor.txt").read_text(encoding="utf-8")
    client = anthropic.Anthropic()

    if path.suffix.lower() == ".pdf":
        # Send PDF natively as base64; API handles text extraction internally
        pdf_b64 = base64.standard_b64encode(path.read_bytes()).decode("utf-8")
        user_content = [
            {
                "type": "document",
                "source": {"type": "base64", "media_type": "application/pdf", "data": pdf_b64},
            },
            {"type": "text", "text": "Here is the hospital bill. Extract all line items."},
        ]
    else:
        bill_text = redact_pii(path.read_text(encoding="utf-8", errors="replace"))
        user_content = f"Here is the hospital bill:\n\n{bill_text}"

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=16000,
        system=system_prompt,
        messages=[{"role": "user", "content": user_content}],
    )

    raw = message.content[0].text
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw.strip(), flags=re.MULTILINE)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        Path("outputs/debug_extractor_raw.txt").write_text(cleaned, encoding="utf-8")
        raise RuntimeError(f"Extractor JSON parse failed at char {e.pos}: {e.msg}") from e


# --- Stage 2: Analyst ---

def analyze_bill(extracted_json: dict) -> dict:
    system_prompt = Path("prompts/analyst.txt").read_text(encoding="utf-8")

    client = anthropic.Anthropic()
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=16000,
        system=system_prompt,
        messages=[
            {"role": "user", "content": json.dumps(extracted_json, ensure_ascii=False)}
        ],
    )

    raw = message.content[0].text
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw.strip(), flags=re.MULTILINE)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        Path("outputs/debug_analyst_raw.txt").write_text(cleaned, encoding="utf-8")
        raise RuntimeError(f"Analyst JSON parse failed at char {e.pos}: {e.msg}") from e


# --- Stage 3: Letter Writer ---

def generate_letter(analysis_json: dict) -> str:
    system_prompt = Path("prompts/letter_writer.txt").read_text(encoding="utf-8")

    client = anthropic.Anthropic()
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        system=system_prompt,
        messages=[
            {"role": "user", "content": json.dumps(analysis_json, ensure_ascii=False)}
        ],
    )

    return message.content[0].text


# --- Main ---

def main():
    if len(sys.argv) < 2:
        print("Usage: python pipeline.py <path_to_bill>")
        sys.exit(1)

    bill_path = sys.argv[1]
    bill_name = Path(bill_path).stem

    extracted = extract_bill(bill_path)
    analysis = analyze_bill(extracted)
    letter = generate_letter(analysis)

    letter = letter.replace("[DATE]", date.today().strftime("%d %B %Y"))
    letter = letter.replace("[Hospital Name]", extracted.get("hospital", {}).get("name", ""))
    letter = letter.replace("[City]", extracted.get("hospital", {}).get("city", ""))
    letter = letter.replace("[Bill Number]", extracted.get("bill_metadata", {}).get("bill_number", ""))
    letter = letter.replace("[Patient Name]", extracted.get("patient_name", ""))

    result = {
        "bill": bill_name,
        "extracted": extracted,
        "analysis": analysis,
        "letter": letter,
    }

    out_path = Path("outputs") / f"{bill_name}_result.json"
    out_path.write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")

    letter_path = Path("outputs") / f"{bill_name}_letter.txt"
    letter_path.write_text(letter, encoding="utf-8")

    print("Done")


if __name__ == "__main__":
    main()
