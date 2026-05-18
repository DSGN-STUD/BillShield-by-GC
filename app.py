import os
import tempfile
from pathlib import Path

from flask import Flask, request, jsonify, make_response, send_from_directory
from flask_cors import CORS

from pipeline import extract_bill, analyze_bill, generate_letter

app = Flask(__name__)
CORS(app)

@app.after_request
def skip_ngrok_warning(response):
    response.headers["ngrok-skip-browser-warning"] = "true"
    return response

FRONTEND_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "frontend")

if not os.environ.get("ANTHROPIC_API_KEY"):
    print("WARNING: ANTHROPIC_API_KEY is not set. API calls will fail.", flush=True)


@app.route("/")
def index():
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.route("/<path:path>")
def static_files(path):
    return send_from_directory(FRONTEND_DIR, path)


@app.get("/health")
def health():
    return jsonify({"status": "ok"})


@app.post("/api/extract")
def api_extract():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded. Send a multipart/form-data request with field name 'file'."}), 400

    file = request.files["file"]
    if not file.filename:
        return jsonify({"error": "Empty filename."}), 400

    suffix = Path(file.filename).suffix.lower() or ".pdf"

    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp_path = tmp.name
        file.save(tmp_path)

    try:
        result = extract_bill(tmp_path)
    except Exception as e:
        os.unlink(tmp_path)
        return jsonify({"error": str(e)}), 500
    else:
        os.unlink(tmp_path)

    return jsonify(result)


@app.post("/api/analyze")
def api_analyze():
    extracted = request.get_json(silent=True)
    if not extracted:
        return jsonify({"error": "Request body must be JSON (the extracted bill object)."}), 400

    try:
        result = analyze_bill(extracted)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    return jsonify(result)


@app.post("/api/letter")
def api_letter():
    body = request.get_json(silent=True)
    if not body:
        return jsonify({"error": "Request body must be JSON with 'analysis' and 'extracted' keys."}), 400

    analysis  = body.get("analysis")
    extracted = body.get("extracted", {})

    if not analysis:
        return jsonify({"error": "Missing 'analysis' key in request body."}), 400

    try:
        letter = generate_letter(analysis)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    from datetime import date
    today = date.today().strftime("%-d %B %Y")

    hospital = extracted.get("hospital") or {}
    metadata = extracted.get("bill_metadata") or {}

    replacements = {
        "[DATE]":                today,
        "[Hospital Name]":       hospital.get("name")  or "[Hospital Name]",
        "[City]":                hospital.get("city")  or "[City]",
        "[Bill Number]":         str(metadata.get("bill_number") or "[Bill Number]"),
        "[Patient Name]":        extracted.get("patient_name")   or "[Patient Name]",
        "[Total Billed Amount]": str(metadata.get("total_amount") or "[Total Billed Amount]"),
    }
    for placeholder, value in replacements.items():
        letter = letter.replace(placeholder, value)

    response = make_response(letter)
    response.headers["Content-Type"] = "text/plain; charset=utf-8"
    return response


if __name__ == "__main__":
    app.run(debug=True, port=8080)
