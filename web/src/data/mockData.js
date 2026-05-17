export const mockSanityItems = [
  { id: 1, description: "Room Charges (ICU/CCU) — 3 days", billed: 45000, confidence: "HIGH" },
  { id: 2, description: "MRI Brain without contrast", billed: 16980, confidence: "HIGH" },
  { id: 3, description: "2D Echocardiography", billed: 8500, confidence: "HIGH" },
  { id: 4, description: "USG Whole Abdomen + Pelvis", billed: 3200, confidence: "MEDIUM" },
  { id: 5, description: "ECG (12-lead)", billed: 850, confidence: "HIGH" },
  { id: 6, description: "CBC / Hemogram", billed: 1200, confidence: "HIGH" },
  { id: 7, description: "Serum Creatinine", billed: 450, confidence: "HIGH" },
  { id: 8, description: "Inpatient Consultation × 4", billed: 6400, confidence: "MEDIUM" },
  { id: 9, description: "Super-speciality Consultation × 2", billed: 5600, confidence: "LOW" },
  { id: 10, description: "Nursing Charges (bundled)", billed: 4500, confidence: "HIGH" },
  { id: 11, description: "Biomedical Waste Disposal", billed: 800, confidence: "HIGH" },
  { id: 12, description: "Admission / Registration Fee", billed: 1500, confidence: "HIGH" },
];

export const mockResults = {
  totalBilled: 95480,
  totalFlagged: 58480,
  issuesFound: 8,
  flags: [
    {
      id: 1,
      type: "RATE_VIOLATION",
      item: "MRI BRAIN WITHOUT CONTRAST",
      explanation: "Billed at ₹16,980 — exceeds 2× CGHS benchmark rate of ₹2,750 (CGHS RI089)",
      billed: 16980,
      expected: 2750,
      overcharge: 14230,
      citation: "CGHS OM 03.10.2025, Code RI089"
    },
    {
      id: 2,
      type: "RATE_VIOLATION",
      item: "2D ECHOCARDIOGRAPHY",
      explanation: "Billed at ₹8,500 — exceeds 2× CGHS benchmark of ₹1,475 (CGHS RI001)",
      billed: 8500,
      expected: 1475,
      overcharge: 7025,
      citation: "CGHS OM 03.10.2025, Code RI001"
    },
    {
      id: 3,
      type: "RATE_VIOLATION",
      item: "USG WHOLE ABDOMEN + PELVIS",
      explanation: "Billed at ₹3,200 — exceeds 2× CGHS benchmark of ₹800 (CGHS RI020)",
      billed: 3200,
      expected: 800,
      overcharge: 2400,
      citation: "CGHS OM 03.10.2025, Code RI020"
    },
    {
      id: 4,
      type: "RATE_VIOLATION",
      item: "ECG (12-LEAD)",
      explanation: "Billed at ₹850 — exceeds 2× CGHS benchmark of ₹175 (CGHS CI001)",
      billed: 850,
      expected: 175,
      overcharge: 675,
      citation: "CGHS OM 03.10.2025, Code CI001"
    },
    {
      id: 5,
      type: "STRUCTURAL_VIOLATION",
      item: "NURSING CHARGES",
      explanation: "Nursing care is bundled under ICU/CCU flat rate and cannot be billed separately per CGHS Annexure-III §1",
      billed: 4500,
      expected: 0,
      overcharge: 4500,
      citation: "CGHS OM 03.10.2025, Annexure-III §1"
    },
    {
      id: 6,
      type: "STRUCTURAL_VIOLATION",
      item: "BIOMEDICAL WASTE DISPOSAL",
      explanation: "Biomedical waste is a bundled item — cannot be charged separately per CGHS Annexure-III §2",
      billed: 800,
      expected: 0,
      overcharge: 800,
      citation: "CGHS OM 03.10.2025, Annexure-III §2"
    },
    {
      id: 7,
      type: "STRUCTURAL_VIOLATION",
      item: "ADMISSION / REGISTRATION FEE",
      explanation: "Admission charges are included in the inpatient bed rate and cannot be billed separately",
      billed: 1500,
      expected: 0,
      overcharge: 1500,
      citation: "CGHS OM 03.10.2025, Annexure-III §1"
    },
    {
      id: 8,
      type: "RATE_VIOLATION",
      item: "INPATIENT CONSULTATIONS × 4",
      explanation: "Billed at ₹1,600/consultation — exceeds 2× CGHS benchmark of ₹350 (CGHS CN002)",
      billed: 6400,
      expected: 1400,
      overcharge: 5000,
      citation: "CGHS OM 03.10.2025, Code CN002"
    }
  ]
};

export const mockLetter = `To,
The Medical Superintendent / Billing Officer,
[Hospital Name],
[Hospital Address]

Subject: Formal Dispute of Hospital Bill — [Patient Name] — Bill No. [XXXX]
Date: [Date]

Dear Sir / Madam,

I write to formally dispute certain charges on the hospital bill issued to [Patient Name] (IP No. [XXXX]) for treatment during [admission date] to [discharge date].

Having reviewed the bill against the Central Government Health Scheme (CGHS) rate schedule (Office Memorandum dated 03 October 2025, effective 13 October 2025), I have identified the following discrepancies:

1. MRI Brain without contrast (Code RI089): Billed ₹16,980 against CGHS benchmark of ₹2,750. Overcharge: ₹14,230.

2. 2D Echocardiography (Code RI001): Billed ₹8,500 against CGHS benchmark of ₹1,475. Overcharge: ₹7,025.

3. USG Whole Abdomen + Pelvis (Code RI020): Billed ₹3,200 against CGHS benchmark of ₹800. Overcharge: ₹2,400.

4. ECG 12-lead (Code CI001): Billed ₹850 against CGHS benchmark of ₹175. Overcharge: ₹675.

5. Inpatient Consultations × 4 (Code CN002): Billed ₹1,600/visit against CGHS benchmark of ₹350. Overcharge: ₹5,000.

6. Nursing Charges (₹4,500): Nursing care is included in the ICU/CCU flat rate (CGHS Annexure-III §1) and cannot be billed separately.

7. Biomedical Waste Disposal (₹800): Biomedical waste handling is a bundled service and cannot be charged separately (CGHS Annexure-III §2).

8. Admission/Registration Fee (₹1,500): Admission charges are bundled within the inpatient bed rate and cannot be billed separately.

Total disputed amount: ₹36,130.

I request a revised bill reflecting the CGHS-compliant rates within 14 days of this letter, as required under IRDAI Master Circular dated 29 May 2024.

Should this matter remain unresolved, I reserve the right to escalate to:
• The State Insurance Ombudsman
• The National Consumer Disputes Redressal Commission (NCDRC)
• The CGHS Additional Director for the relevant region

I am available to discuss this matter at [Contact Number / Email].

Yours faithfully,
[Patient / Guardian Name]
[Date]
[Contact Details]`;
