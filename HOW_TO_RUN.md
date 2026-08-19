# 🚀 HOW TO RUN — EduPredict AI (Fixed Clean Version)
### Author: Pathi Partha Saradhi Reddy · Joy University · BCAI23002

---

## ✅ QUICKEST — Open in Browser (No Python needed)

```
1. Extract the zip
2. Open:  EduPredict-AI/frontend/index.html
```
Uses JS formula for predictions. All charts and tabs work instantly.

---

## ✅ FULL METHOD — All 5 Real ML Models (ONE terminal only)

> Flask now serves both the frontend AND the API together.
> You only need ONE terminal — not two.

### Step 1 — Go to backend folder
```bash
cd EduPredict-AI/backend
```

### Step 2 — Install packages (once only)
```bash
pip install -r requirements.txt
```

### Step 3 — Train all 5 ML models (once only)
```bash
python train.py
```
You will see accuracy for all 5 models printed in the terminal.

### Step 4 — Start the server
```bash
python app.py
```

### Step 5 — Open browser
```
http://localhost:5000
```

That's it. One terminal. One URL. All 5 models running.

---

## 📂 Project Structure (Clean — No Duplicates)

```
EduPredict-AI/
├── frontend/                  ← All UI files (served by Flask at /)
│   ├── index.html
│   ├── css/style.css
│   └── js/
│       ├── app.js
│       ├── charts.js
│       ├── data.js
│       ├── predict.js         ← Calls /api/predict (real ML)
│       └── upload.js          ← Calls /api/predict for batch
│
├── backend/                   ← Python Flask server
│   ├── app.py                 ← Serves frontend + API routes
│   ├── model.py               ← LR + DT + RF + SVR + ANN hybrid
│   ├── data_generator.py
│   ├── train.py
│   └── requirements.txt
│
├── data/
│   └── student_data.csv
│
├── HOW_TO_RUN.md
└── README.md
```

---

## 🔗 API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET  | http://localhost:5000/ | Opens the frontend app |
| GET  | http://localhost:5000/api/health | Check server is running |
| POST | http://localhost:5000/api/predict | Predict one student |
| GET  | http://localhost:5000/api/models | Model accuracy metrics |
| POST | http://localhost:5000/api/retrain | Retrain all models |

---

## 🛠 Fix Common Errors

| Error | Fix |
|-------|-----|
| ModuleNotFoundError | pip install flask scikit-learn numpy pandas flask-cors |
| 'python' not found | Use: py train.py / py app.py |
| Port 5000 in use | Change PORT=5001 in app.py |
| Charts blank | Use http://localhost:5000 (not file://) |
| CSV missing columns | Download the template from the Upload tab |

---
*Joy University · BCAI23002 · bcai23002@joyuniversity.edu.in*
