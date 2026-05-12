import json
import sys
from pipeline import analyze_bill

extracted = json.loads(open("bills/bill_b_extracted.json", encoding="utf-8").read())
analysis = analyze_bill(extracted)

flags = analysis.get("flags", [])
print(f"Total flags: {len(flags)}")
print(f"Total flagged amount: ₹{analysis.get('total_flagged_amount', 0):,.0f}")
print(f"Letter warranted: {analysis.get('letter_warranted')}")
print()

for f in flags:
    mult = f.get("multiplier")
    mult_str = f"{mult}×" if mult is not None else "—"
    print(f"  [{f['flag_type']:22}] {f['item_name'][:50]}")
    print(f"    Billed: ₹{f['billed_amount']:,.0f}  CGHS: ₹{f['cghs_rate']:,.0f}  Mult: {mult_str}  Delta: ₹{f['delta']:,.0f}")
    print(f"    {f['citation']}")
    print()
