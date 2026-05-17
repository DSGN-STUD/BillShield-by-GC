import os
import json
import tempfile
from datetime import date

from flask import Flask, request, jsonify
from flask_cors import CORS

from pipeline import extract_bill, analyze_bill, generate_letter

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])


@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/api/upload", methods=["POST"])
def upload():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    f = request.files["file"]
    if not f.filename:
        return jsonify({"error": "Empty filename"}), 400

    ext = os.path.splitext(f.filename)[1].lower()
    if ext not in (".pdf", ".jpg", ".jpeg", ".png"):
        return jsonify({"error": "Unsupported file type"}), 400

    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
            f.save(tmp.name)
            tmp_path = tmp.name
        extracted = extract_bill(tmp_path)
        return jsonify(extracted)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)


@app.route("/api/analyse", methods=["POST"])
def analyse():
    extracted = request.get_json()
    if not extracted:
        return jsonify({"error": "No JSON body provided"}), 400
    try:
        analysis = analyze_bill(extracted)
        return jsonify(analysis)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/letter", methods=["POST"])
def letter():
    body = request.get_json()
    if not body:
        return jsonify({"error": "No JSON body provided"}), 400

    analysis = body.get("analysis")
    extracted = body.get("extracted")
    if not analysis:
        return jsonify({"error": "Missing analysis field"}), 400

    try:
        text = generate_letter(analysis)
        today = date.today().strftime("%d %B %Y")
        text = text.replace("[DATE]", today)
        if extracted:
            hospital = extracted.get("hospital") or {}
            meta = extracted.get("bill_metadata") or {}
            text = text.replace("[Hospital Name]", hospital.get("name", ""))
            text = text.replace("[City]", hospital.get("city", ""))
            text = text.replace("[Bill Number]", meta.get("bill_number", "") or "")
            text = text.replace("[Patient Name]", extracted.get("patient_name", "") or "")
        return jsonify({"letter": text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
