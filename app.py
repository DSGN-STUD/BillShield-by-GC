import os
import tempfile
from pathlib import Path

from flask import Flask, request, jsonify, make_response
from flask_cors import CORS

from pipeline import extract_bill, analyze_bill, generate_letter

app = Flask(__name__)
CORS(app)


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
    finally:
        os.unlink(tmp_path)

    return jsonify(result)


@app.post("/api/analyze")
def api_analyze():
    extracted = request.get_json(silent=True)
    if not extracted:
        return jsonify({"error": "Request body must be JSON (the extracted bill object)."}), 400

    result = analyze_bill(extracted)
    return jsonify(result)


@app.post("/api/letter")
def api_letter():
    analysis = request.get_json(silent=True)
    if not analysis:
        return jsonify({"error": "Request body must be JSON (the analysis object)."}), 400

    letter = generate_letter(analysis)
    response = make_response(letter)
    response.headers["Content-Type"] = "text/plain; charset=utf-8"
    return response


if __name__ == "__main__":
    app.run(debug=True, port=5000)
