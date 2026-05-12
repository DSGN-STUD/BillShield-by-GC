import json
from pipeline import analyze_bill

extracted = json.loads(open("bills/bill_a_extracted.json", encoding="utf-8").read())
analysis = analyze_bill(extracted)

flags = analysis.get("flags", [])
print(f"Flags: {len(flags)}")
for f in flags:
    mult = f.get("multiplier")
    mult_str = f"{mult}×" if mult is not None else "—"
    print(f"  [{f['flag_type']}] {f['item_name']} — {mult_str}")
print(f"Total flagged: ₹{analysis.get('total_flagged_amount', 0):,.0f}")
print(f"Letter warranted: {analysis.get('letter_warranted')}")
if analysis.get("letter_threshold_note"):
    print(f"Note: {analysis['letter_threshold_note']}")
