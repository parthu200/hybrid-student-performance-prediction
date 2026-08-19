import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from model import HybridPredictor

BASE_DIR     = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, '..', 'frontend')

app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path='')
CORS(app)

predictor = HybridPredictor()
try:
    predictor.load("models/hybrid_model.pkl")
    print("[EduPredict] ✓ Loaded saved model from disk.")
except FileNotFoundError:
    print("[EduPredict] No saved model found — training now...")
    predictor.train()
    os.makedirs("models", exist_ok=True)
    predictor.save("models/hybrid_model.pkl")
    print("[EduPredict] ✓ Model trained and saved.")

@app.route('/')
def serve_frontend():
    return send_from_directory(FRONTEND_DIR, 'index.html')

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "service": "EduPredict AI"}), 200

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json(force=True)
        required = ["cgpa", "prevGrade", "examScore", "studyHours",
                    "attendance", "lms", "assignments", "participation",
                    "adaptive", "contEval"]
        for field in required:
            if field not in data:
                return jsonify({"error": f"Missing field: {field}"}), 400
        return jsonify(predictor.predict(data)), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/models', methods=['GET'])
def model_info():
    return jsonify(predictor.model_metrics()), 200

@app.route('/api/retrain', methods=['POST'])
def retrain():
    predictor.train()
    predictor.save("models/hybrid_model.pkl")
    return jsonify({"status": "retrained successfully"}), 200

if __name__ == "__main__":
    port  = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("DEBUG", "true").lower() == "true"
    print("=" * 50)
    print("  EduPredict AI is starting...")
    print(f"  Open browser at: http://localhost:{port}")
    print("=" * 50)
    app.run(host="0.0.0.0", port=port, debug=debug)
