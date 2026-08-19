import os
import numpy as np
import pandas as pd

def generate_dataset(n_samples=2000, seed=42):
    rng = np.random.default_rng(seed)

    cgpa          = rng.uniform(2.0, 10.0, n_samples)
    prev_grade    = rng.uniform(30,  100,  n_samples)
    exam_score    = rng.uniform(25,  100,  n_samples)
    study_hours   = rng.uniform(0,   40,   n_samples)
    attendance    = rng.uniform(30,  100,  n_samples)
    lms           = rng.uniform(1,   10,   n_samples)
    assignments   = rng.uniform(20,  100,  n_samples)
    participation = rng.uniform(1,   10,   n_samples)
    adaptive      = rng.uniform(1,   10,   n_samples)
    cont_eval     = rng.uniform(1,   10,   n_samples)
    semester      = rng.integers(1, 9, n_samples).astype(float)
    programme     = rng.integers(0, 4, n_samples).astype(float)

    lc = (0.35 * adaptive   / 10.0 +
          0.30 * cont_eval  / 10.0 +
          0.20 * lms        / 10.0 +
          0.15 * np.clip(study_hours / 40.0, 0, 1))

    base_score = (
        0.12 * cgpa / 10.0 * 100 +
        0.10 * prev_grade         +
        0.08 * exam_score         +
        0.10 * attendance                  +
        0.06 * lms          / 10.0 * 100  +
        0.05 * assignments                 +
        0.04 * participation / 10.0 * 100 +
        0.20 * lc           * 100         +
        0.08 * adaptive     / 10.0 * 100  +
        0.07 * cont_eval    / 10.0 * 100  +
        0.05 * (1 - abs(semester - 4.5) / 4.5) * 100 +
        0.05 * 50
    )
    final_score = np.clip(np.clip(base_score, 0, 100) + rng.normal(0, 3.5, n_samples), 0, 100)

    X = np.column_stack([
        cgpa,
        prev_grade    / 100.0,
        exam_score    / 100.0,
        study_hours   / 40.0,
        attendance    / 100.0,
        lms           / 10.0,
        assignments   / 100.0,
        participation / 10.0,
        adaptive      / 10.0,
        cont_eval     / 10.0,
        lc,
        semester      / 8.0,
        programme     / 3.0,
    ])
    return X, final_score

def generate_csv(path="data/student_data.csv", n_samples=1000, seed=42):
    rng  = np.random.default_rng(seed)
    prgs = ["BTech", "BCA", "MCA", "MBA"]

    cgpa          = np.round(rng.uniform(2.0, 10.0, n_samples), 1)
    prev_grade    = rng.integers(30, 101, n_samples)
    exam_score    = rng.integers(25, 101, n_samples)
    study_hours   = rng.integers(0,  41,  n_samples)
    attendance    = rng.integers(30, 101, n_samples)
    lms           = rng.integers(1,  11,  n_samples)
    assignments   = rng.integers(20, 101, n_samples)
    participation = rng.integers(1,  11,  n_samples)
    adaptive      = rng.integers(1,  11,  n_samples)
    cont_eval     = rng.integers(1,  11,  n_samples)
    semester      = rng.integers(1,  9,   n_samples)
    prog_idx      = rng.integers(0,  4,   n_samples)

    lc = (0.35 * adaptive / 10 + 0.30 * cont_eval / 10 +
          0.20 * lms / 10 + 0.15 * np.clip(study_hours / 40, 0, 1))

    final_score = np.clip(
        0.12*cgpa/10*100 + 0.10*prev_grade + 0.08*exam_score +
        0.10*attendance + 0.06*lms/10*100 + 0.05*assignments +
        0.04*participation/10*100 + 0.20*lc*100 +
        0.08*adaptive/10*100 + 0.07*cont_eval/10*100 +
        rng.normal(0, 3.5, n_samples), 0, 100
    ).round(1)

    def to_grade(s):
        for thr, g in [(90,"O"),(80,"A+"),(70,"A"),(60,"B+"),(50,"B"),(40,"C")]:
            if s >= thr: return g
        return "F"

    df = pd.DataFrame({
        "student_id"               : [f"S{i+1:04d}" for i in range(n_samples)],
        "programme"                : [prgs[p] for p in prog_idx],
        "semester"                 : semester,
        "cgpa"                     : cgpa,
        "previous_grade"           : prev_grade,
        "exam_score"               : exam_score,
        "study_hours_per_week"     : study_hours,
        "attendance_pct"           : attendance,
        "lms_activity"             : lms,
        "assignment_completion_pct": assignments,
        "class_participation"      : participation,
        "adaptive_assessment"      : adaptive,
        "continuous_evaluation"    : cont_eval,
        "learning_coefficient"     : np.round(lc, 4),
        "final_score"              : final_score,
        "grade"                    : [to_grade(s) for s in final_score],
    })

    os.makedirs(os.path.dirname(path), exist_ok=True)
    df.to_csv(path, index=False)
    print(f"[DataGen] ✓ Saved {n_samples} student records → {path}")
    return df

if __name__ == "__main__":
    df = generate_csv()
    print(df.head(10).to_string())
    print(f"\nShape      : {df.shape}")
    print(f"Score range: {df['final_score'].min():.1f} – {df['final_score'].max():.1f}")
    print(f"Grade dist :\n{df['grade'].value_counts()}")
