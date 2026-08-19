import argparse, os, time
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics         import mean_absolute_error, mean_squared_error, r2_score
from sklearn.linear_model    import LinearRegression
from sklearn.tree             import DecisionTreeRegressor
from sklearn.ensemble         import RandomForestRegressor
from sklearn.svm              import SVR
from sklearn.neural_network   import MLPRegressor
from sklearn.preprocessing    import StandardScaler
from data_generator           import generate_dataset
from model                    import HybridPredictor, score_to_grade, score_to_risk

parser = argparse.ArgumentParser()
parser.add_argument("--samples", type=int, default=2000)
parser.add_argument("--output",  type=str, default="models/hybrid_model.pkl")
parser.add_argument("--seed",    type=int, default=42)
args = parser.parse_args()

def acc_within(y_true, y_pred, tol=5.0):
    """Percentage of predictions within ±tol of the true score."""
    return np.mean(np.abs(y_true - y_pred) <= tol) * 100

def evaluate(name, model, X_tr, X_te, y_tr, y_te, scaler):
    X_tr_s, X_te_s = scaler.transform(X_tr), scaler.transform(X_te)
    t0 = time.time()
    model.fit(X_tr_s, y_tr)
    preds = np.clip(model.predict(X_te_s), 0, 100)
    print(f"\n  {name}")
    print(f"    MAE={mean_absolute_error(y_te, preds):.2f}  "
          f"RMSE={np.sqrt(mean_squared_error(y_te, preds)):.2f}  "
          f"R²={r2_score(y_te, preds):.4f}  "
          f"Acc±5={acc_within(y_te, preds):.1f}%  "
          f"({time.time()-t0:.2f}s)")
    return preds

def hybrid_predict(all_preds, weights=(0.10, 0.10, 0.30, 0.15, 0.35)):
    """Weighted ensemble: LR=10% DT=10% RF=30% SVR=15% ANN=35%"""
    return np.dot(np.column_stack(all_preds), weights)

def main():
    print("=" * 55)
    print("  EduPredict AI — Model Training & Evaluation")
    print("=" * 55)

    print(f"\n[1/4] Generating {args.samples} samples…")
    X, y = generate_dataset(n_samples=args.samples, seed=args.seed)
    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=args.seed)
    print(f"      Train: {len(X_tr)}  Test: {len(X_te)}  "
          f"Score range: {y.min():.1f}–{y.max():.1f}  Mean: {y.mean():.1f}")

    scaler = StandardScaler()
    scaler.fit(X_tr)

    print("\n[2/4] Training individual models…")
    models = {
        "Linear Regression": LinearRegression(),
        "Decision Tree"    : DecisionTreeRegressor(max_depth=8, random_state=args.seed),
        "Random Forest"    : RandomForestRegressor(n_estimators=200, max_depth=10, random_state=args.seed),
        "SVR"              : SVR(kernel="rbf", C=100, gamma=0.1, epsilon=0.1),
        "ANN"              : MLPRegressor(hidden_layer_sizes=(128, 64, 32), activation="relu",
                                          solver="adam", max_iter=500, random_state=args.seed,
                                          early_stopping=True),
    }
    all_preds = [evaluate(n, m, X_tr, X_te, y_tr, y_te, scaler)
                 for n, m in models.items()]

    print("\n[3/4] Hybrid ensemble…")
    hp = np.clip(hybrid_predict(all_preds), 0, 100)
    print(f"  MAE={mean_absolute_error(y_te, hp):.2f}  "
          f"RMSE={np.sqrt(mean_squared_error(y_te, hp)):.2f}  "
          f"R²={r2_score(y_te, hp):.4f}  "
          f"Acc±5={acc_within(y_te, hp):.1f}%")

    grade_acc = np.mean([score_to_grade(p)==score_to_grade(t)
                         for p, t in zip(hp, y_te)]) * 100
    print(f"  Grade accuracy: {grade_acc:.1f}%")

    risk_counts = {}
    for s in hp:
        r = score_to_risk(s)
        risk_counts[r] = risk_counts.get(r, 0) + 1
    print(f"  Risk distribution: {risk_counts}")

    print(f"\n[4/4] Saving model to {args.output}…")
    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    predictor = HybridPredictor()
    predictor.train()
    predictor.save(args.output)
    print(f"\n✓ Done. Run `python app.py` to start the server.")

if __name__ == "__main__":
    main()
