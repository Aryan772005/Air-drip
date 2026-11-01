"""
Training and Validation Module for Hawa AI.
Implements:
1. Baseline Model (Station + Hour average)
2. LightGBM Regressor with festival sample-weighting
3. LightGBM Quantile Regressors (alpha=0.10, 0.90) for 80% interval
4. Leave-one-Diwali-out Cross-Validation
5. Metrics logging and model serialization
"""

import os
import sys
sys.path.insert(0, os.path.abspath("."))
import joblib
import pandas as pd
import numpy as np
import lightgbm as lgb
from sklearn.metrics import mean_absolute_error, mean_squared_error

from src.features import build_features

class BaselineModel:
    """Historical average PM2.5 grouped by station and hour of day."""
    def __init__(self):
        self.lookup = {}
        self.global_mean = 100.0

    def fit(self, df):
        self.global_mean = float(df["PM2.5"].mean())
        self.lookup = df.groupby(["Station", "hour"])["PM2.5"].mean().to_dict()
        return self

    def predict(self, df):
        preds = []
        for _, row in df.iterrows():
            st = row.get("Station")
            h = row.get("hour")
            val = self.lookup.get((st, h), self.global_mean)
            preds.append(val)
        return np.array(preds)

def train_and_validate(data_path="data/processed/all_india_hourly.parquet", outputs_dir="outputs", models_dir="models"):
    os.makedirs(outputs_dir, exist_ok=True)
    os.makedirs(models_dir, exist_ok=True)
    
    print("Loading preprocessed dataset for training & validation...", flush=True)
    full_df = pd.read_parquet(data_path)
    X, y, df_feats = build_features(full_df)
    
    # -------------------------------------------------------------
    # LEAVE-ONE-DIWALI-OUT VALIDATION
    # -------------------------------------------------------------
    years = sorted(df_feats["Year"].unique())
    metrics_records = []
    trust_2019_df = None
    
    print(f"\n--- Running Leave-One-Diwali-Out Cross-Validation across {years} ---", flush=True)
    
    for held_out_yr in years:
        train_mask = df_feats["Year"] != held_out_yr
        test_mask = (df_feats["Year"] == held_out_yr) & (df_feats["Days_From_Diwali"].abs() <= 7)
        
        train_df = df_feats[train_mask]
        test_df = df_feats[test_mask]
        
        if len(test_df) == 0:
            continue
            
        X_train, y_train, _ = build_features(train_df)
        X_test, y_test, _ = build_features(test_df)
        
        # Sample weights: 3x weight for Diwali window rows (-7 to +7)
        weights_train = np.where(train_df["Days_From_Diwali"].abs() <= 7, 3.0, 1.0)
        
        # 1. Baseline Model
        b_model = BaselineModel().fit(train_df)
        base_preds = b_model.predict(test_df)
        
        # 2. LightGBM Main Regressor
        lgb_model = lgb.LGBMRegressor(
            n_estimators=180,
            learning_rate=0.06,
            num_leaves=31,
            random_state=42,
            verbose=-1,
        )
        lgb_model.fit(X_train, y_train, sample_weight=weights_train)
        lgb_preds = lgb_model.predict(X_test)
        
        # Overall metrics on held-out Diwali window
        base_mae = mean_absolute_error(y_test, base_preds)
        base_rmse = np.sqrt(mean_squared_error(y_test, base_preds))
        lgb_mae = mean_absolute_error(y_test, lgb_preds)
        lgb_rmse = np.sqrt(mean_squared_error(y_test, lgb_preds))
        
        # Diwali Night only metrics
        night_mask = test_df["Is_Diwali_Night"].values == True
        if np.sum(night_mask) > 0:
            base_night_mae = mean_absolute_error(y_test[night_mask], base_preds[night_mask])
            lgb_night_mae = mean_absolute_error(y_test[night_mask], lgb_preds[night_mask])
        else:
            base_night_mae, lgb_night_mae = np.nan, np.nan
            
        metrics_records.append({
            "Held_Out_Year": held_out_yr,
            "Baseline_MAE": round(base_mae, 2),
            "LGBM_MAE": round(lgb_mae, 2),
            "Baseline_RMSE": round(base_rmse, 2),
            "LGBM_RMSE": round(lgb_rmse, 2),
            "Baseline_Diwali_Night_MAE": round(base_night_mae, 2),
            "LGBM_Diwali_Night_MAE": round(lgb_night_mae, 2),
            "MAE_Improvement_%": round((base_mae - lgb_mae) / base_mae * 100, 1),
        })
        
        # Save held-out 2019 for the Model Trust page
        if held_out_yr == 2019:
            trust_2019_df = test_df[["Datetime", "Station", "Is_Delhi", "Days_From_Diwali", "Is_Diwali_Night", "PM2.5"]].copy()
            trust_2019_df["Baseline_Pred"] = np.round(base_preds, 1)
            trust_2019_df["LGBM_Pred"] = np.round(lgb_preds, 1)
            
    metrics_df = pd.DataFrame(metrics_records)
    metrics_path = os.path.join(outputs_dir, "metrics.csv")
    metrics_df.to_csv(metrics_path, index=False)
    
    if trust_2019_df is not None:
        trust_path = os.path.join(outputs_dir, "model_trust_2019.csv")
        trust_2019_df.to_csv(trust_path, index=False)
        print(f"Saved held-out 2019 trust data to {trust_path}", flush=True)
        
    print("\n=== LEAVE-ONE-DIWALI-OUT VALIDATION METRICS ===", flush=True)
    print(metrics_df.to_string(index=False), flush=True)
    
    # -------------------------------------------------------------
    # TRAIN FINAL PRODUCTION MODELS (All Years)
    # -------------------------------------------------------------
    print("\nTraining final production models on full multi-year dataset...", flush=True)
    weights_all = np.where(df_feats["Days_From_Diwali"].abs() <= 7, 3.0, 1.0)
    
    final_baseline = BaselineModel().fit(df_feats)
    joblib.dump(final_baseline, os.path.join(models_dir, "baseline.pkl"))
    
    final_lgb = lgb.LGBMRegressor(
        n_estimators=220,
        learning_rate=0.05,
        num_leaves=31,
        random_state=42,
        verbose=-1,
    )
    final_lgb.fit(X, y, sample_weight=weights_all)
    joblib.dump(final_lgb, os.path.join(models_dir, "lgb_main.pkl"))
    
    # Quantile models for 80% interval: alpha=0.10 (low) and alpha=0.90 (high)
    print("Training 10th percentile uncertainty model (alpha=0.10)...", flush=True)
    lgb_q10 = lgb.LGBMRegressor(
        objective="quantile",
        alpha=0.10,
        n_estimators=180,
        learning_rate=0.06,
        num_leaves=31,
        random_state=42,
        verbose=-1,
    )
    lgb_q10.fit(X, y, sample_weight=weights_all)
    joblib.dump(lgb_q10, os.path.join(models_dir, "lgb_q10.pkl"))
    
    print("Training 90th percentile uncertainty model (alpha=0.90)...", flush=True)
    lgb_q90 = lgb.LGBMRegressor(
        objective="quantile",
        alpha=0.90,
        n_estimators=180,
        learning_rate=0.06,
        num_leaves=31,
        random_state=42,
        verbose=-1,
    )
    lgb_q90.fit(X, y, sample_weight=weights_all)
    joblib.dump(lgb_q90, os.path.join(models_dir, "lgb_q90.pkl"))
    
    print(f"\nAll models serialized successfully into {models_dir}/", flush=True)
    return metrics_df

if __name__ == "__main__":
    train_and_validate()
