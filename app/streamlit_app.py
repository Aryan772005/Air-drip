"""
Hawa AI: Diwali Air Quality Predictor (All-India & Delhi)
Main Streamlit Application.
"""

import os
import sys
sys.path.insert(0, os.path.abspath("."))
import streamlit as st
import pandas as pd
import numpy as np

st.set_page_config(
    page_title="Hawa AI - Diwali Air Quality Predictor",
    page_icon="🌫️",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom Dark Theme Styling
st.markdown("""
<style>
    /* Dark Theme Base */
    .stApp {
        background-color: #0b0f17;
        color: #f0f3f6;
        font-family: 'Inter', -apple-system, sans-serif;
    }
    
    /* Header Banner */
    .hawa-banner {
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        border: 1px solid #334155;
        border-radius: 12px;
        padding: 24px 28px;
        margin-bottom: 24px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    }
    .hawa-title {
        font-size: 2.2rem;
        font-weight: 800;
        letter-spacing: -0.02em;
        background: linear-gradient(90deg, #38bdf8, #818cf8, #f43f5e);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 6px;
    }
    .hawa-tagline {
        font-size: 1.05rem;
        color: #94a3b8;
        font-weight: 400;
    }
    
    /* Metric Cards */
    .metric-card {
        background: #18202c;
        border: 1px solid #283548;
        border-radius: 10px;
        padding: 18px 20px;
        margin-bottom: 12px;
    }
    .metric-label {
        font-size: 0.85rem;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 4px;
    }
    .metric-val {
        font-size: 1.8rem;
        font-weight: 700;
        color: #f8fafc;
    }
    
    /* AQI Badges */
    .aqi-pill {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 9999px;
        font-weight: 700;
        font-size: 0.9rem;
        color: #ffffff;
    }
    
    /* Alert styling */
    .advice-box {
        background: #1e293b;
        border-left: 4px solid #ef4444;
        padding: 16px 18px;
        border-radius: 0 8px 8px 0;
        margin: 12px 0;
    }
</style>
""", unsafe_allow_html=True)

# Top Banner
st.markdown("""
<div class="hawa-banner">
    <div class="hawa-title">🌫️ Hawa AI : Diwali Air Quality Predictor</div>
    <div class="hawa-tagline">Know your neighborhood's air before, during, and after Diwali — with hyper-local forecasts and health planning.</div>
</div>
""", unsafe_allow_html=True)

# Sidebar Quick Info
with st.sidebar:
    st.image("https://img.icons8.com/fluency/96/air-quality.png", width=64)
    st.markdown("### **Hawa AI System**")
    st.markdown("""
    - **Coverage**: Delhi NCR & Major Indian Metros
    - **Forecast Window**: Diwali 2026 (Nov 5 - Nov 11)
    - **Model**: LightGBM Quantile Ensembles
    - **Data Sources**: CPCB Standards & Live Dual-Engine Weather
    """)
    st.divider()
    st.info("💡 **Tip**: Use the navigation above to explore **Live Forecasts**, **Past Diwalis**, **Model Trust**, or simulate **What-If Scenarios**!")

st.markdown("""
### Welcome to Hawa AI
Select an analysis module from the sidebar or click below:

1. **📍 Forecast & Map**: Interactive geographic map with CPCB AQI stations, continuous IDW heatmaps, and neighborhood timeline sliders.
2. **📈 Past Diwalis**: Empirical evidence showing multi-year festival surges, night vs normal comparisons, and peak spike locations.
3. **🛡️ Model Trust**: Leave-one-out cross-validation accuracy, actual vs predicted evaluation on held-out 2019 Diwali, and SHAP explainability.
4. **🧪 What-If Simulator**: Scenario simulator adjusting firecracker intensity (0% to 100%) to forecast pollution reduction impact.
5. **ℹ️ About & Methodology**: Technical architecture, health benchmarks, data lineage, and model bounds.
""")

col1, col2, col3 = st.columns(3)
with col1:
    st.metric("Delhi Baseline PM2.5", "238.6 µg/m³", "Pre-Diwali Ambient")
with col2:
    st.metric("Diwali Night Peak", "738.5 µg/m³", "+2.7x Severe Spike", delta_color="inverse")
with col3:
    st.metric("Model Improvement", "95.6% MAE Drop", "vs Baseline Model")

