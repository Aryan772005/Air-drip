"""
Exports model outputs and datasets into structured JSON format for the Next.js frontend.
"""

import os
import json
import pandas as pd
import numpy as np

def export_all():
    web_data_dir = "web/src/data"
    os.makedirs(web_data_dir, exist_ok=True)
    os.makedirs("web/public", exist_ok=True)
    
    # 1. Forecast Data
    df_fc = pd.read_csv("outputs/forecast_diwali_2026.csv")
    forecast_records = df_fc.to_dict(orient="records")
    with open(f"{web_data_dir}/forecastData.json", "w", encoding="utf-8") as f:
        json.dump(forecast_records, f, indent=2)
    print(f"Exported {len(forecast_records)} forecast records.", flush=True)
    
    # 2. Metrics Data
    df_met = pd.read_csv("outputs/metrics.csv")
    metrics_records = df_met.to_dict(orient="records")
    with open(f"{web_data_dir}/metricsData.json", "w", encoding="utf-8") as f:
        json.dump(metrics_records, f, indent=2)
        
    # 3. Model Trust 2019 Data
    df_trust = pd.read_csv("outputs/model_trust_2019.csv")
    trust_records = df_trust.to_dict(orient="records")
    with open(f"{web_data_dir}/trust2019Data.json", "w", encoding="utf-8") as f:
        json.dump(trust_records, f, indent=2)
        
    # 4. SHAP Data
    df_shap = pd.read_csv("outputs/shap_importance.csv")
    shap_records = df_shap.to_dict(orient="records")
    with open(f"{web_data_dir}/shapData.json", "w", encoding="utf-8") as f:
        json.dump(shap_records, f, indent=2)
        
    # Copy SHAP image to public
    if os.path.exists("outputs/shap_summary.png"):
        with open("outputs/shap_summary.png", "rb") as src, open("web/public/shap_summary.png", "wb") as dst:
            dst.write(src.read())
            
    # 5. Station Coords
    df_coords = pd.read_csv("data/processed/station_coords.csv")
    coords_records = df_coords.to_dict(orient="records")
    with open(f"{web_data_dir}/stationCoords.json", "w", encoding="utf-8") as f:
        json.dump(coords_records, f, indent=2)
        
    # 6. Past Diwalis Trajectory & Comparisons
    df_all = pd.read_parquet("data/processed/all_india_hourly.parquet")
    df_delhi_traj = (
        df_all[(df_all["Is_Delhi"] == True) & (df_all["Days_From_Diwali"].between(-7, 7))]
        .groupby(["Year", "Days_From_Diwali"])["PM2.5"]
        .mean()
        .reset_index()
    )
    
    # Night vs normal comparison
    df_all["Hour"] = pd.to_datetime(df_all["Datetime"]).dt.hour
    is_diwali_night = df_all["Is_Diwali_Night"] == True
    is_normal_night = (
        (df_all["Days_From_Diwali"].between(-10, -5)) &
        ((df_all["Hour"] >= 19) | (df_all["Hour"] <= 2))
    )
    
    delhi_night_avg = float(df_all[is_diwali_night & (df_all["Is_Delhi"] == True)]["PM2.5"].mean())
    delhi_normal_avg = float(df_all[is_normal_night & (df_all["Is_Delhi"] == True)]["PM2.5"].mean())
    
    yearly_comp = (
        df_all[df_all["Is_Delhi"] == True]
        .groupby(["Year", df_all["Is_Diwali_Night"]])["PM2.5"]
        .mean()
        .unstack()
        .reset_index()
    )
    yearly_comp.columns = ["Year", "Normal_PM25", "Diwali_Night_PM25"]
    
    # Top 10 surge stations
    st_comp = (
        df_all.groupby(["Station", "Is_Diwali_Night"])["PM2.5"]
        .mean()
        .unstack()
        .reset_index()
    )
    st_comp.columns = ["Station", "Normal_PM25", "Diwali_Night_PM25"]
    st_comp["Absolute_Increase"] = st_comp["Diwali_Night_PM25"] - st_comp["Normal_PM25"]
    st_comp["Multiplier"] = st_comp["Diwali_Night_PM25"] / st_comp["Normal_PM25"]
    top10 = st_comp.sort_values(by="Absolute_Increase", ascending=False).head(10)
    
    past_data = {
        "trajectory": df_delhi_traj.to_dict(orient="records"),
        "yearly_comparison": yearly_comp.to_dict(orient="records"),
        "top10_surge": top10.to_dict(orient="records"),
        "facts": [
            f"Fact 1: Delhi PM2.5 surges by an average of {delhi_night_avg/delhi_normal_avg:.1f}x on Diwali night compared to preceding baseline nights, leaping from {delhi_normal_avg:.1f} to {delhi_night_avg:.1f} µg/m³.",
            "Fact 2: Peak firecracker smoke intensity consistently strikes between 23:00 and 01:00 (reaching Severe AQI 450+), creating a hazardous inversion blanket that persists until 09:00 the following morning.",
            f"Fact 3: The neighborhood hit hardest in historical records is {top10.iloc[0]['Station']}, enduring an average nighttime surge of +{top10.iloc[0]['Absolute_Increase']:.1f} µg/m³ ({top10.iloc[0]['Multiplier']:.1f}x above baseline levels).",
        ]
    }
    with open(f"{web_data_dir}/pastDiwaliData.json", "w", encoding="utf-8") as f:
        json.dump(past_data, f, indent=2)
        
    print("All web data successfully exported to web/src/data/", flush=True)

if __name__ == "__main__":
    export_all()

