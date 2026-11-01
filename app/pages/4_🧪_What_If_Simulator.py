"""
Page 4: What-If Policy & Scenario Simulator
"""

import os
import sys
sys.path.insert(0, os.path.abspath("."))
import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
import folium
from streamlit_folium import folium_static

from src.advice import get_health_advice

st.set_page_config(page_title="What-If Simulator - Hawa AI", page_icon="🧪", layout="wide")

st.title("🧪 What-If Policy & Firecracker Scenario Simulator")
st.markdown("""
<div style='background:#1e293b; border-left:4px solid #38bdf8; padding:12px 16px; border-radius:0 8px 8px 0; margin-bottom:20px;'>
    <b>⚠️ Important Disclaimer</b>: This is a <i>scenario estimate</i> based on physical emission scaling, not a definitive regulatory measurement.
</div>
""", unsafe_allow_html=True)

@st.cache_data
def load_data():
    df = pd.read_csv("outputs/forecast_diwali_2026.csv")
    df["Datetime"] = pd.to_datetime(df["Datetime"])
    return df

df_forecast = load_data()

# Controls
st.subheader("1. Configure Firecracker Emission Intensity")
intensity_pct = st.slider(
    "Firecracker Emission Level:",
    min_value=0,
    max_value=100,
    value=100,
    step=10,
    format="%d%%",
    help="100% = Normal historical intensity, 50% = Reduced/Green Crackers compliance, 0% = Complete firecracker ban enforcement"
)

intensity_factor = intensity_pct / 100.0

# Calculate scenario values
# Normal night baseline level is approx 230 µg/m³ for Delhi, 140 µg/m³ for other cities
scenario_df = df_forecast.copy()
is_night = scenario_df["Is_Diwali_Night"] == True

# Baseline level without firecracker burst
normal_night_base = np.where(scenario_df["Is_Delhi"], 235.0, 130.0)

# Uplift = predicted - normal_night_base
uplift = np.maximum(0.0, scenario_df["PM2.5_Median"] - normal_night_base)
scenario_df["Scenario_PM2.5"] = np.where(
    is_night,
    np.round(normal_night_base + intensity_factor * uplift, 1),
    scenario_df["PM2.5_Median"]
)

# Comparison Metrics for Diwali Night
diwali_night_orig = scenario_df[is_night]["PM2.5_Median"].mean()
diwali_night_scen = scenario_df[is_night]["Scenario_PM2.5"].mean()
reduction_abs = diwali_night_orig - diwali_night_scen
reduction_pct = (reduction_abs / diwali_night_orig) * 100 if diwali_night_orig > 0 else 0

m1, m2, m3 = st.columns(3)
with m1:
    st.metric("Diwali Night Normal (100%)", f"{diwali_night_orig:.1f} µg/m³", "Severe AQI")
with m2:
    st.metric("Simulated Scenario PM2.5", f"{diwali_night_scen:.1f} µg/m³", f"-{reduction_abs:.1f} µg/m³ Drop", delta_color="normal")
with m3:
    st.metric("Total Pollution Reduction", f"{reduction_pct:.1f}%", f"{intensity_pct}% Firecracker Level")

st.divider()

# Timeline Comparison
st.subheader("2. Delhi Timeline: Normal vs Simulated Scenario")
delhi_scen = (
    scenario_df[scenario_df["Is_Delhi"] == True]
    .groupby("Datetime")[["PM2.5_Median", "Scenario_PM2.5"]]
    .mean()
    .reset_index()
)

fig_sim = go.Figure()
fig_sim.add_trace(go.Scatter(
    x=delhi_scen["Datetime"],
    y=delhi_scen["PM2.5_Median"],
    mode="lines",
    line=dict(color="#ef4444", width=2, dash="dash"),
    name="Standard Forecast (100% Crackers)",
))
fig_sim.add_trace(go.Scatter(
    x=delhi_scen["Datetime"],
    y=delhi_scen["Scenario_PM2.5"],
    mode="lines+markers",
    line=dict(color="#38bdf8", width=3),
    name=f"What-If Scenario ({intensity_pct}% Intensity)",
))
fig_sim.update_layout(
    paper_bgcolor="#11151c",
    plot_bgcolor="#18202c",
    font=dict(color="#f0f3f6"),
    xaxis=dict(gridcolor="#283548"),
    yaxis=dict(gridcolor="#283548", title="PM2.5 (µg/m³)"),
    title="Impact of Firecracker Policies on Peak Pollution Curve",
)
st.plotly_chart(fig_sim, use_container_width=True)

# Station Impact Table
st.subheader("3. Station-Level Impact on Diwali Night")
st_table = (
    scenario_df[is_night]
    .groupby("Station")[["PM2.5_Median", "Scenario_PM2.5"]]
    .mean()
    .reset_index()
)
st_table["Saved_PM2.5"] = st_table["PM2.5_Median"] - st_table["Scenario_PM2.5"]
st_table["Saved_PM2.5_%"] = (st_table["Saved_PM2.5"] / st_table["PM2.5_Median"]) * 100
st_table = st_table.sort_values("Saved_PM2.5", ascending=False)

st.dataframe(
    st_table.style.format({
        "PM2.5_Median": "{:.1f}",
        "Scenario_PM2.5": "{:.1f}",
        "Saved_PM2.5": "{:.1f}",
        "Saved_PM2.5_%": "{:.1f}%",
    }).background_gradient(subset=["Saved_PM2.5"], cmap="Blues"),
    use_container_width=True,
)

