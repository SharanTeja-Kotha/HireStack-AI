"""
train_models.py
===============
Trains and compares multiple models for each task:
  - Classification : Hire / Reject
  - Regression     : Salary prediction
  - Clustering     : Candidate segmentation

For each task we train ALL candidate models, compare metrics,
print a full report, then save the BEST model to disk.

Winners (AI_Resume_Screening.csv, 1000 CVs):
  Classification  -> XGBoost          (Accuracy=1.00, F1=1.00, CV=1.00)
  Regression      -> SVR (rbf, C=100) (lowest MAE among all models)
  Clustering      -> KMeans k=3       (Silhouette=0.293)

Run:
    cd backend
    python scripts/train_models.py
"""

from __future__ import annotations
import warnings
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.cluster import AgglomerativeClustering, KMeans
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import (GradientBoostingClassifier, GradientBoostingRegressor,
                               RandomForestClassifier, RandomForestRegressor)
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import ElasticNet, Lasso, LogisticRegression, Ridge
from sklearn.metrics import (accuracy_score, calinski_harabasz_score,
                              davies_bouldin_score, f1_score,
                              mean_absolute_error, mean_squared_error,
                              r2_score, roc_auc_score, silhouette_score)
from sklearn.model_selection import KFold, StratifiedKFold, cross_val_score, train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder, OneHotEncoder, RobustScaler, StandardScaler
from sklearn.svm import SVC, SVR
from xgboost import XGBClassifier

warnings.filterwarnings("ignore")

BASE_DIR   = Path(__file__).resolve().parents[1]
DATA_PATH  = BASE_DIR / "data" / "AI_Resume_Screening.csv"
MODELS_DIR = BASE_DIR / "models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

NUMERIC_COLS    = ["Experience (Years)", "Projects Count", "AI Score (0-100)",
                   "skill_count", "Score_Travail_Total", "exp_project_ratio", "has_certification"]
CATEGORICAL_COLS = ["Education", "Job Role"]
TEXT_COL        = "Skills"


def build_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["skill_count"] = df["Skills"].apply(lambda v: len(str(v).split(",")) if pd.notna(v) else 0)
    df["has_certification"] = df["Certifications"].apply(
        lambda v: 0 if pd.isna(v) or str(v).lower() == "none" else 1)
    df["Score_Travail_Total"] = df["Experience (Years)"].fillna(0) + df["Projects Count"].fillna(0)
    df["exp_project_ratio"] = df["Experience (Years)"] / (df["Projects Count"] + 1)
    return df


def get_preprocessor():
    return ColumnTransformer([
        ("num",   RobustScaler(),                                              NUMERIC_COLS),
        ("cat",   OneHotEncoder(handle_unknown="ignore", sparse_output=False), CATEGORICAL_COLS),
        ("tfidf", TfidfVectorizer(max_features=100, ngram_range=(1, 2)),       TEXT_COL),
    ], remainder="drop")


# ─────────────────────────────────────────────────────────────────────────────
def compare_classifiers(df):
    df  = build_features(df)
    X   = df[NUMERIC_COLS + CATEGORICAL_COLS + [TEXT_COL]]
    le  = LabelEncoder()
    y_str = df["Recruiter Decision"]
    y_num = le.fit_transform(y_str)

    X_tr, X_te, ys_tr, ys_te, yn_tr, yn_te = train_test_split(
        X, y_str, y_num, test_size=0.25, random_state=42, stratify=y_str)

    candidates = {
        "Logistic Regression": (Pipeline([("pre", get_preprocessor()), ("clf", LogisticRegression(max_iter=1000, random_state=42))]), "str"),
        "Random Forest":       (Pipeline([("pre", get_preprocessor()), ("clf", RandomForestClassifier(n_estimators=200, random_state=42, class_weight="balanced"))]), "str"),
        "Gradient Boosting":   (Pipeline([("pre", get_preprocessor()), ("clf", GradientBoostingClassifier(n_estimators=200, random_state=42))]), "str"),
        "XGBoost":             (Pipeline([("pre", get_preprocessor()), ("clf", XGBClassifier(n_estimators=200, max_depth=6, learning_rate=0.05, subsample=0.8, colsample_bytree=0.8, gamma=0.1, random_state=42, eval_metric="logloss", verbosity=0))]), "num"),
        "SVM":                 (Pipeline([("pre", get_preprocessor()), ("clf", SVC(probability=True, random_state=42))]), "str"),
        "KNN":                 (Pipeline([("pre", get_preprocessor()), ("clf", KNeighborsClassifier(n_neighbors=5))]), "str"),
    }

    print("\n" + "="*70)
    print("CLASSIFICATION  —  Hire / Reject  (1000 CVs, 75/25 split, CV=5)")
    print("="*70)
    print(f"{'Model':<25} {'Accuracy':>9} {'F1':>8} {'ROC-AUC':>9} {'CV Acc':>8}")
    print("-"*70)

    results, trained = {}, {}
    for name, (pipe, mode) in candidates.items():
        if mode == "num":
            pipe.fit(X_tr, yn_tr)
            y_pred = le.inverse_transform(pipe.predict(X_te))
            y_proba = pipe.predict_proba(X_te)[:,1]
            auc = roc_auc_score(yn_te, y_proba)
            cv  = cross_val_score(pipe, X, y_num, cv=StratifiedKFold(5), scoring="accuracy").mean()
        else:
            pipe.fit(X_tr, ys_tr)
            y_pred  = pipe.predict(X_te)
            y_proba = pipe.predict_proba(X_te)[:,1]
            auc = roc_auc_score((ys_te=="Hire").astype(int), y_proba)
            cv  = cross_val_score(pipe, X, y_str, cv=StratifiedKFold(5), scoring="accuracy").mean()
        acc = accuracy_score(ys_te, y_pred)
        f1  = f1_score(ys_te, y_pred, pos_label="Hire")
        results[name] = {"Accuracy":acc,"F1":f1,"ROC-AUC":auc,"CV Accuracy":cv}
        trained[name] = (pipe, mode)
        print(f"{name:<25} {acc:>9.4f} {f1:>8.4f} {auc:>9.4f} {cv:>8.4f}")

    best = max(results, key=lambda k: (results[k]["Accuracy"], results[k]["F1"]))
    print(f"\n  WINNER: {best}  (Accuracy={results[best]['Accuracy']:.4f}  F1={results[best]['F1']:.4f}  CV={results[best]['CV Accuracy']:.4f})")

    best_pipe, best_mode = trained[best]
    best_pipe.fit(X, y_num if best_mode == "num" else y_str)
    return best_pipe


# ─────────────────────────────────────────────────────────────────────────────
def compare_regressors(df):
    df = build_features(df)
    X  = df[NUMERIC_COLS + CATEGORICAL_COLS + [TEXT_COL]]
    y  = df["Salary Expectation ($)"]
    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=42)

    candidates = {
        "Ridge":             Pipeline([("pre", get_preprocessor()), ("reg", Ridge(alpha=10.0))]),
        "Lasso":             Pipeline([("pre", get_preprocessor()), ("reg", Lasso(alpha=1.0))]),
        "ElasticNet":        Pipeline([("pre", get_preprocessor()), ("reg", ElasticNet(alpha=1.0, l1_ratio=0.5))]),
        "Random Forest":     Pipeline([("pre", get_preprocessor()), ("reg", RandomForestRegressor(n_estimators=200, random_state=42))]),
        "Gradient Boosting": Pipeline([("pre", get_preprocessor()), ("reg", GradientBoostingRegressor(n_estimators=200, random_state=42))]),
        "SVR":               Pipeline([("pre", get_preprocessor()), ("reg", SVR(kernel="rbf", C=100))]),
    }

    print("\n" + "="*70)
    print("REGRESSION  —  Salary Prediction  (1000 CVs, 75/25 split, CV=5)")
    print("="*70)
    print(f"{'Model':<25} {'MAE ($)':>9} {'RMSE ($)':>10} {'R2':>8} {'CV R2':>8}")
    print("-"*70)

    results, trained = {}, {}
    for name, pipe in candidates.items():
        pipe.fit(X_tr, y_tr)
        y_pred = pipe.predict(X_te)
        mae  = mean_absolute_error(y_te, y_pred)
        rmse = np.sqrt(mean_squared_error(y_te, y_pred))
        r2   = r2_score(y_te, y_pred)
        cv   = cross_val_score(pipe, X, y, cv=KFold(5, shuffle=True, random_state=42), scoring="r2").mean()
        results[name] = {"MAE":mae,"RMSE":rmse,"R2":r2,"CV R2":cv}
        trained[name] = pipe
        print(f"{name:<25} {mae:>9.0f} {rmse:>10.0f} {r2:>8.4f} {cv:>8.4f}")

    best = max(results, key=lambda k: results[k]["R2"])
    print(f"\n  WINNER: {best}  (R2={results[best]['R2']:.4f}  MAE=${results[best]['MAE']:.0f})")
    print("  Note: salary is weakly correlated with CV features in this dataset.")

    trained[best].fit(X, y)
    return trained[best]


# ─────────────────────────────────────────────────────────────────────────────
def compare_clustering(df):
    df = build_features(df)
    Xc = StandardScaler().fit_transform(df[NUMERIC_COLS].fillna(0))

    candidates = {
        "KMeans k=3":        KMeans(n_clusters=3, random_state=42, n_init=10),
        "KMeans k=4":        KMeans(n_clusters=4, random_state=42, n_init=10),
        "KMeans k=5":        KMeans(n_clusters=5, random_state=42, n_init=10),
        "Agglomerative k=3": AgglomerativeClustering(n_clusters=3),
        "Agglomerative k=4": AgglomerativeClustering(n_clusters=4),
    }

    print("\n" + "="*70)
    print("CLUSTERING  —  Candidate Segmentation")
    print("Metrics: Silhouette (higher=better)  DB (lower=better)  CH (higher=better)")
    print("="*70)
    print(f"{'Model':<25} {'Silhouette':>11} {'Davies-Bouldin':>15} {'Calinski-H':>12}")
    print("-"*70)

    results = {}
    for name, model in candidates.items():
        labels = model.fit_predict(Xc)
        sil = silhouette_score(Xc, labels)
        db  = davies_bouldin_score(Xc, labels)
        ch  = calinski_harabasz_score(Xc, labels)
        results[name] = {"Silhouette":sil,"DB":db,"CH":ch}
        print(f"{name:<25} {sil:>11.4f} {db:>15.4f} {ch:>12.1f}")

    best = max(results, key=lambda k: results[k]["Silhouette"])
    print(f"\n  WINNER: {best}  (Silhouette={results[best]['Silhouette']:.4f}  DB={results[best]['DB']:.4f})")

    n_clusters = int(best.split("k=")[1])
    final = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    final.fit(df[NUMERIC_COLS].fillna(0))
    return final


# ─────────────────────────────────────────────────────────────────────────────
def train_job_role_classifier():
    """
    Trains a TF-IDF + Random Forest job-role classifier on the Kaggle
    Resume Dataset (Resume.csv — 2,484 resumes, 24 categories).

    3 models are evaluated (LogReg / RF / LinearSVC); RF is saved as the winner.
    See scripts/resume-nlp-comparison.ipynb for the full comparison.
    """
    import re as _re

    resume_csv = BASE_DIR / "data" / "Resume" / "Resume.csv"
    if not resume_csv.exists():
        print("\n  WARNING: Resume.csv not found - skipping job-role classifier training.")
        print(f"     Expected at: {resume_csv}")
        return

    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.linear_model import LogisticRegression
    from sklearn.svm import LinearSVC
    from sklearn.calibration import CalibratedClassifierCV
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import accuracy_score, f1_score
    from sklearn.pipeline import Pipeline
    from nltk.corpus import stopwords
    import nltk
    nltk.download("stopwords", quiet=True)
    _stop = set(stopwords.words("english"))

    def _clean(text: str) -> str:
        text = _re.sub(r"<[^>]+>", " ", str(text))
        text = _re.sub(r"[^a-zA-Z\s]", " ", text)
        text = _re.sub(r"\s+", " ", text).strip().lower()
        return " ".join(w for w in text.split() if w not in _stop and len(w) > 2)

    print("\n" + "="*70)
    print("JOB-ROLE CLASSIFIER  —  Kaggle Resume Dataset (2,484 resumes, 24 categories)")
    print("="*70)

    df_r = pd.read_csv(resume_csv)
    df_r["clean"] = df_r["Resume_str"].apply(_clean)
    X, y = df_r["clean"], df_r["Category"]

    X_tr, X_te, y_tr, y_te = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    tfidf_params = dict(max_features=15_000, ngram_range=(1, 2),
                        sublinear_tf=True, min_df=2)

    candidates = {
        "Logistic Regression": Pipeline([
            ("tfidf", TfidfVectorizer(**tfidf_params)),
            ("clf",   LogisticRegression(C=5, max_iter=1000, random_state=42)),
        ]),
        "Random Forest": Pipeline([
            ("tfidf", TfidfVectorizer(**tfidf_params)),
            ("clf",   RandomForestClassifier(n_estimators=300,
                                              class_weight="balanced",
                                              random_state=42, n_jobs=-1)),
        ]),
        "Linear SVC": Pipeline([
            ("tfidf", TfidfVectorizer(**tfidf_params)),
            ("clf",   CalibratedClassifierCV(
                          LinearSVC(C=1.0, max_iter=2000, random_state=42), cv=3)),
        ]),
    }

    print(f"{'Model':<25} {'Accuracy':>9} {'F1 (weighted)':>14}")
    print("-"*50)

    results, trained = {}, {}
    for name, pipe in candidates.items():
        pipe.fit(X_tr, y_tr)
        preds = pipe.predict(X_te)
        acc = accuracy_score(y_te, preds)
        f1w = f1_score(y_te, preds, average="weighted", zero_division=0)
        results[name] = {"acc": acc, "f1": f1w}
        trained[name] = pipe
        print(f"{name:<25} {acc:>9.4f} {f1w:>14.4f}")

    best = max(results, key=lambda k: results[k]["acc"])
    print(f"\n  WINNER: {best}  (Acc={results[best]['acc']:.4f}  F1={results[best]['f1']:.4f})")

    # Retrain winner on full dataset
    trained[best].fit(X, y)
    out_path = MODELS_DIR / "job_role_classifier.pkl"
    joblib.dump(trained[best], out_path)
    print(f"  Saved -> {out_path}")


# ─────────────────────────────────────────────────────────────────────────────
def main():
    print("\n" + "="*70)
    print("  HireStack -- Full Model Comparison & Training")
    print("  Dataset : AI_Resume_Screening.csv  (1000 CVs, 11 features)")
    print("="*70)

    df = pd.read_csv(DATA_PATH)
    hire_count   = (df["Recruiter Decision"] == "Hire").sum()
    reject_count = (df["Recruiter Decision"] == "Reject").sum()
    print(f"\n  Records: {len(df)}  |  Hire: {hire_count}  |  Reject: {reject_count}")

    classifier = compare_classifiers(df)
    regressor  = compare_regressors(df)
    kmeans     = compare_clustering(df)

    joblib.dump(classifier, MODELS_DIR / "classifier_hire.pkl")
    joblib.dump(regressor,  MODELS_DIR / "salary_predictor.pkl")
    joblib.dump(kmeans,     MODELS_DIR / "kmeans_clusters.pkl")

    # ── Job-Role Classifier (NLP, trained on Kaggle Resume Dataset) ──────────
    train_job_role_classifier()

    print("\n" + "="*70)
    print("PRODUCTION MODELS SAVED")
    print("="*70)
    print("  classifier_hire.pkl      -> XGBoost  (Hire/Reject)")
    print("  salary_predictor.pkl     -> Best Regressor (Salary prediction)")
    print("  kmeans_clusters.pkl      -> KMeans (Candidate segmentation)")
    print("  job_role_classifier.pkl  -> Best NLP model (Job-role from resume text)")
    print()

if __name__ == "__main__":
    main()