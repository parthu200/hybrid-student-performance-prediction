# 🎓 EduPredict AI
### Hybrid Student Performance Prediction System

> **Final Year Project** — Department of Computer Science, Joy University  
> **Author:** Pathi Partha Saradhi Reddy · `bcai23002@joyuniversity.edu.in`  
> **Paper:** *Hybrid Student Performance Prediction Using Machine Learning and Learning Coefficients*

---

## 📁 Project Structure

```
EduPredict-AI/
│
├── frontend/                       ← Static web UI (open index.html in browser)
│   ├── index.html                  ← Main HTML entry point
│   ├── css/
│   │   └── style.css               ← All styles (dark theme, charts, forms)
│   └── js/
│       ├── data.js                 ← Static data, field definitions, config
│       ├── charts.js               ← Chart.js chart renderers
│       ├── predict.js              ← Claude API call + local fallback predictor
│       └── app.js                  ← Tab switching, form builder, boot sequence
│
├── backend/                        ← Python Flask REST API + ML models
│   ├── app.py                      ← Flask server with /predict, /models routes
│   ├── model.py                    ← HybridPredictor (LR+DT+RF+SVR+ANN ensemble)
│   ├── data_generator.py           ← Synthetic dataset generator
│   ├── train.py                    ← Standalone training + evaluation script
│   └── requirements.txt            ← Python dependencies
│
├── data/
│   └── student_data.csv            ← Sample dataset (auto-generated on first run)
│
└── README.md                       ← This file
```

---

## ✨ Features

| Tab | What it does |
|-----|-------------|
| 📊 **Dashboard** | Model accuracy bar chart, feature importance donut, full metrics table |
| 🔮 **Predict** | 10-slider input form → AI-powered hybrid prediction → grade + risk + suggestions |
| 📈 **Analytics** | Training curve, confusion matrix, score distribution, multi-metric comparison |
| 📄 **Research** | Paper metadata, system pipeline diagram, research gaps, references |

---

## 🚀 Quick Start (Frontend Only)

No installation needed — just open the file in your browser:

```bash
cd EduPredict-AI/frontend
# Double-click index.html  OR  run a local server:
python -m http.server 8080
# Then open: http://localhost:8080
```

The **Predict** tab calls the Claude API automatically.  
If the API is unavailable, a local weighted formula runs as fallback.

---

## 🐍 Backend Setup (Flask API)

```bash
cd EduPredict-AI/backend

# 1. Create a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Train the model (first time only)
python train.py

# 4. Start the API server
python app.py
# → Running on http://localhost:5000
```

### API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET    | `/`          | Health check |
| POST   | `/predict`   | Predict student performance |
| GET    | `/models`    | Return model accuracy metrics |
| POST   | `/retrain`   | Re-train the model |

### Example POST /predict

```json
{
  "cgpa": 7.5,
  "prevGrade": 72,
  "examScore": 68,
  "studyHours": 15,
  "attendance": 80,
  "lms": 6,
  "assignments": 85,
  "participation": 5,
  "adaptive": 6,
  "contEval": 7,
  "semester": "4",
  "programme": "BTech"
}
```

### Example Response

```json
{
  "predictedScore": 74,
  "grade": "A",
  "riskLevel": "Low",
  "lrScore": 70,
  "rfScore": 74,
  "annScore": 73,
  "hybridScore": 74,
  "suggestions": [
    "Increase LMS engagement: complete quizzes and watch recordings regularly.",
    "Aim for at least 10 focused study hours per week with spaced repetition."
  ],
  "radarScores": [7.5, 8.0, 6.0, 8.5, 6.0, 5.0],
  "breakdown": {
    "linearRegression": 70,
    "decisionTree": 72,
    "randomForest": 74,
    "svr": 73,
    "ann": 75
  }
}
```

---

## 🧠 Model Architecture

```
Student Input
     │
     ▼
Feature Engineering
  ├── Academic      (CGPA, Prev Grade, Exam Score, Study Hours)
  ├── Behavioral    (Attendance, LMS, Assignments, Participation)
  └── Learning Coeff (Adaptive × 0.35 + ContEval × 0.30 + LMS × 0.20 + Hours × 0.15)
     │
     ▼
StandardScaler (zero mean, unit variance)
     │
     ├──► Linear Regression        weight: 0.10
     ├──► Decision Tree (depth 8)  weight: 0.10
     ├──► Random Forest (200 trees) weight: 0.30
     ├──► SVR (RBF kernel)          weight: 0.15
     └──► ANN (128→64→32)           weight: 0.35
                          │
                          ▼
               Weighted Ensemble → Final Score (0–100)
```

---

## 📊 Model Performance (from paper)

| Model | Accuracy | Precision | Recall | F1-Score |
|-------|----------|-----------|--------|----------|
| Linear Regression | 88.5% | 85.2 | 83.6 | 84.3 |
| Decision Tree | 91.7% | 89.5 | 88.2 | 88.8 |
| Random Forest | 95.4% | 93.8 | 92.6 | 93.2 |
| SVR | 93.2% | 91.4 | 90.1 | 90.7 |
| ANN | 94.6% | 92.9 | 91.7 | 92.3 |
| **Hybrid Model** | **96.2%** | **94.8** | **93.9** | **94.3** |

---

## 🔧 Technologies Used

**Frontend:** HTML5 · CSS3 · Vanilla JavaScript · Chart.js 4 · Google Fonts  
**Backend:** Python 3.11 · Flask · scikit-learn · NumPy · Pandas  
**AI Prediction:** Claude API (`claude-sonnet-4-20250514`)  
**ML Models:** LinearRegression · DecisionTreeRegressor · RandomForestRegressor · SVR · MLPRegressor

---

## 📖 References

1. P. Cortez & A. Silva — *Using Data Mining to Predict Secondary School Student Performance*, 2008  
2. C. Romero & S. Ventura — *Educational Data Mining: A Review*, IEEE, 2010  
3. S. B. Kotsiantis et al. — *Predicting Students' Performance*, 2004  
4. R. Baker & K. Yacef — *The State of Educational Data Mining*, 2009  
5. A. Shahiri et al. — *A Review on Predicting Student Performance*, 2015  
6. Y. Baashar et al. — *Predicting Student Performance using ML*, 2021  
7. P. Asthana et al. — *Learning Coefficient-Based Prediction*, IEEE Access, 2023  
8. A. Ashraf et al. — *Comparative Study of ML Models*, 2018  

---

*Joy University · Department of Computer Science · BCAI23002*
