"""
Explainability Module for Hawa AI using SHAP.
Generates SHAP summary values for the LightGBM model explaining the relative impact
of Wind Speed, Diwali Night, Temperature, Humidity, and Spatial factors.
"""

import os
import sys
sys.path.insert(0, os.path.abspath("."))
import joblib
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import shap

from src.features import build_features

def generate_shap_analysis(models_dir="models", data_path="data/processed/all_india_hourly.parquet", outputs_dir="outputs"):
    os.makedirs(outputs_dir, exist_ok=True)
    print("Computing SHAP values for LightGBM model...", flush=True)
    
    lgb_model = joblib.load(os.path.join(models_dir, "lgb_main.pkl"))
    df = pd.read_parquet(data_path)
    
    # Sample 800 representative rows for fast explainability
    sample_df = df.sample(min(800, len(df)), random_state=42)
    X, _, _ = build_features(sample_df)
    
    # Feature friendly names
    readable_names = {
        "hour": "Hour of Day",
        "day_of_week": "Day of Week",
        "month": "Month",
        "is_rush_hour": "Rush Hour (Traffic)",
        "Temperature": "Temperature (°C)",
        "Humidity": "Humidity (%)",
        "Wind_Speed": "Wind Speed (km/h)",
        "Wind_Direction": "Wind Direction (°)",
        "Pressure": "Pressure (hPa)",
        "Precipitation": "Precipitation (mm)",
        "days_from_diwali_feat": "Days from Diwali",
        "is_diwali_night_feat": "Diwali Night Spike",
        "station_cat": "Neighborhood/City",
        "Latitude": "Latitude",
        "Longitude": "Longitude",
    }
    
    X_renamed = X.rename(columns=readable_names)
    
    # TreeExplainer for LightGBM
    explainer = shap.TreeExplainer(lgb_model)
    shap_values = explainer.shap_values(X)
    
    # Generate Matplotlib figure in Dark Theme
    plt.style.use("dark_background")
    fig, ax = plt.subplots(figsize=(10, 6), dpi=150)
    fig.patch.set_facecolor("#11151c")
    ax.set_facecolor("#18202c")
    
    shap.summary_plot(
        shap_values,
        X_renamed,
        show=False,
        plot_size=None,
        color_bar=True,
    )
    plt.title("Hawa AI - Feature Importance & Direction (SHAP Values)", color="#f0f3f6", fontsize=14, pad=15)
    plt.xlabel("SHAP value (Impact on PM2.5 µg/m³)", color="#f0f3f6")
    plt.tight_layout()
    
    out_img = os.path.join(outputs_dir, "shap_summary.png")
    plt.savefig(out_img, facecolor=fig.get_facecolor(), edgecolor="none")
    plt.close()
    
    # Compute mean absolute SHAP importance table
    mean_abs_shap = np.abs(shap_values).mean(axis=0)
    shap_df = pd.DataFrame({
        "Feature": [readable_names.get(c, c) for c in X.columns],
        "Mean_Absolute_SHAP": np.round(mean_abs_shap, 2)
    }).sort_values("Mean_Absolute_SHAP", ascending=False)
    
    shap_df.to_csv(os.path.join(outputs_dir, "shap_importance.csv"), index=False)
    print(f"SHAP summary chart saved to {out_img}", flush=True)
    print("\nTop 5 Most Influential Features:")
    print(shap_df.head(5).to_string(index=False), flush=True)

if __name__ == "__main__":
    generate_shap_analysis()

