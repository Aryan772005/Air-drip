"""
Page 1: Interactive Forecast Map & Station Cards
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
from folium.plugins import HeatMap
from streamlit_folium import folium_static

from src.advice import get_health_advice, calculate_best_time_window
from src.interpolate import idw_interpolate

st.set_page_config(page_title="Forecast Map - Hawa AI", page_icon="📍", layout="wide")

@st.cache_data
def load_forecast_data():
    csv_path = "outputs/forecast_diwali_2026.csv"
    if not os.path.exists(csv_path):
        st.error(f"Missing {csv_path}. Please run src/predict.py first.")
        st.stop()
    df = pd.read_csv(csv_path)
    df["Datetime"] = pd.to_datetime(df["Datetime"])
    return df

@st.cache_data
def load_coords():
    csv_path = "data/processed/station_coords.csv"
    if os.path.exists(csv_path):
        return pd.read_csv(csv_path)
    return None

df_forecast = load_forecast_data()
coords_df = load_coords()

st.title("📍 Diwali 2026 Air Quality Forecast")
st.caption("Hourly PM2.5 & AQI forecasts across Delhi NCR neighborhoods & All-India cities (Nov 5 - Nov 11, 2026)")

# Quick Buttons
c1, c2, c3, _ = st.columns([1.5, 1.5, 1.5, 4])
default_time = pd.to_datetime("2026-11-08 22:00:00")

if "selected_time" not in st.session_state:
    st.session_state["selected_time"] = default_time

with c1:
    if st.button("⏮️ Before Diwali (Nov 6 18:00)"):
        st.session_state["selected_time"] = pd.to_datetime("2026-11-06 18:00:00")
with c2:
    if st.button("🎆 Diwali Night Peak (Nov 8 22:00)"):
        st.session_state["selected_time"] = pd.to_datetime("2026-11-08 22:00:00")
with c3:
    if st.button("⏭️ After Diwali (Nov 10 08:00)"):
        st.session_state["selected_time"] = pd.to_datetime("2026-11-10 08:00:00")

# Timeline Slider
all_times = sorted(df_forecast["Datetime"].unique())
time_strings = [pd.to_datetime(t).strftime("%Y-%m-%d %H:00") for t in all_times]
current_time_str = st.session_state["selected_time"].strftime("%Y-%m-%d %H:00")
current_idx = time_strings.index(current_time_str) if current_time_str in time_strings else 0

selected_idx = st.select_slider(
    "Select Forecast Hour (Nov 5 to Nov 11):",
    options=range(len(time_strings)),
    value=current_idx,
    format_func=lambda i: time_strings[i],
)

active_timestamp = pd.to_datetime(all_times[selected_idx])
st.session_state["selected_time"] = active_timestamp

# Filter current snapshot
snapshot_df = df_forecast[df_forecast["Datetime"] == active_timestamp].copy()

# Sidebar: Region and Station Selector
with st.sidebar:
    st.header("🔍 Location Inspector")
    region_filter = st.radio("Region:", ["Delhi NCR Neighborhoods", "All-India Metros & Hubs", "All Locations"])
    
    if region_filter == "Delhi NCR Neighborhoods":
        filtered_stations = sorted(df_forecast[df_forecast["Is_Delhi"] == True]["Station"].unique())
    elif region_filter == "All-India Metros & Hubs":
        filtered_stations = sorted(df_forecast[df_forecast["Is_Delhi"] == False]["Station"].unique())
    else:
        filtered_stations = sorted(df_forecast["Station"].unique())
        
    chosen_station = st.selectbox("Select Station / City:", filtered_stations, index=0)
    
    show_idw = st.toggle("Enable Smooth IDW Heat Layer (Delhi)", value=True)
    
    st.divider()
    st.markdown("### **CPCB AQI Categories**")
    st.markdown("""
    - <span style='color:#00B050;'>■</span> **Good**: 0 - 30 µg/m³
    - <span style='color:#92D050;'>■</span> **Satisfactory**: 31 - 60 µg/m³
    - <span style='color:#FFC000;'>■</span> **Moderate**: 61 - 90 µg/m³
    - <span style='color:#FF7A00;'>■</span> **Poor**: 91 - 120 µg/m³
    - <span style='color:#FF0000;'>■</span> **Very Poor**: 121 - 250 µg/m³
    - <span style='color:#780000;'>■</span> **Severe**: 250+ µg/m³
    """, unsafe_allow_html=True)

# Station Details Card
st_snap = snapshot_df[snapshot_df["Station"] == chosen_station]
if len(st_snap) > 0:
    st_row = st_snap.iloc[0]
    pm_med = st_row["PM2.5_Median"]
    pm_low = st_row["PM2.5_Low"]
    pm_high = st_row["PM2.5_High"]
    aqi_cat = st_row["AQI_Category"]
    adv = get_health_advice(aqi_cat)
    
    st_all_hours = df_forecast[df_forecast["Station"] == chosen_station]
    best_window = calculate_best_time_window(st_all_hours)
    
    colA, colB, colC, colD = st.columns([1.5, 1.2, 1.8, 3.5])
    with colA:
        st.metric(
            label=f"Predicted PM2.5",
            value=f"{pm_med} µg/m³",
            help="Median forecast from LightGBM ensemble",
        )
    with colB:
        st.markdown(f"**AQI Category**")
        st.markdown(f"<div style='background:{adv['color']}; padding:6px 14px; border-radius:20px; font-weight:bold; color:white; display:inline-block;'>{adv['badge']}</div>", unsafe_allow_html=True)
    with colC:
        st.metric(
            label="80% Confidence Interval",
            value=f"{pm_low} - {pm_high} µg/m³",
            help="10th to 90th percentile bounds",
        )
    with colD:
        st.markdown(f"**Safest Outdoor Window Today:** `{best_window}`")
        st.markdown(f"**Health Action**: {adv['general']}")
        
    with st.expander("🩺 Detailed Health Plan by Demographic Group", expanded=False):
        t1, t2, t3 = st.columns(3)
        with t1:
            st.markdown("#### 🏃 General Public")
            st.info(adv["general"])
        with t2:
            st.markdown("#### 👶 Children & Elderly")
            st.warning(adv["vulnerable"])
        with t3:
            st.markdown("#### 🫁 Asthma / Heart Disease")
            st.error(adv["sensitive"])

# Layout: Map on left, Station Timeline chart on right
map_col, chart_col = st.columns([1.1, 1.0])

with map_col:
    st.subheader(f"🗺️ AQI Map @ {active_timestamp.strftime('%d %b %Y, %I:%M %p')}")
    
    # Map center (Delhi NCR default, or pan to selected city if outside Delhi)
    sel_lat = st_row["Latitude"] if len(st_snap) > 0 else 28.61
    sel_lon = st_row["Longitude"] if len(st_snap) > 0 else 77.21
    zoom_start = 10 if (len(st_snap) > 0 and st_row["Is_Delhi"]) else 6
    
    m = folium.Map(location=[sel_lat, sel_lon], zoom_start=zoom_start, tiles="CartoDB dark_matter")
    
    # Optional IDW continuous layer for Delhi
    if show_idw:
        delhi_snaps = snapshot_df[snapshot_df["Is_Delhi"] == True]
        if len(delhi_snaps) >= 3:
            _, _, _, heat_pts = idw_interpolate(
                delhi_snaps["Latitude"].values,
                delhi_snaps["Longitude"].values,
                delhi_snaps["PM2.5_Median"].values,
            )
            # Add HeatMap
            HeatMap(
                heat_pts,
                radius=18,
                blur=14,
                max_zoom=12,
                min_opacity=0.35,
                gradient={0.2: "#00B050", 0.4: "#92D050", 0.6: "#FFC000", 0.75: "#FF7A00", 0.88: "#FF0000", 1.0: "#780000"}
            ).add_to(m)
            
    # Add station markers
    for _, r in snapshot_df.iterrows():
        p_val = r["PM2.5_Median"]
        cat = r["AQI_Category"]
        c_info = get_health_advice(cat)
        color = c_info["color"]
        
        is_active = (r["Station"] == chosen_station)
        radius = 12 if is_active else 8
        weight = 3 if is_active else 1
        
        popup_html = f"""
        <div style="font-family:sans-serif; min-width:160px;">
            <b>{r['Station']}</b><br/>
            PM2.5: <b>{p_val} µg/m³</b><br/>
            Range: [{r['PM2.5_Low']} - {r['PM2.5_High']}]<br/>
            AQI: <span style="color:{color}; font-weight:bold;">{cat}</span>
        </div>
        """
        
        folium.CircleMarker(
            location=[r["Latitude"], r["Longitude"]],
            radius=radius,
            color="#ffffff" if is_active else color,
            weight=weight,
            fill=True,
            fill_color=color,
            fill_opacity=0.85,
            popup=folium.Popup(popup_html, max_width=250),
            tooltip=f"{r['Station']}: {p_val} µg/m³ ({cat})",
        ).add_to(m)
        
    folium_static(m, width=680, height=500)

with chart_col:
    st.subheader(f"📈 7-Day Forecast: {chosen_station}")
    st_full = df_forecast[df_forecast["Station"] == chosen_station].sort_values("Datetime")
    
    fig_st = go.Figure()
    # Upper bound
    fig_st.add_trace(go.Scatter(
        x=st_full["Datetime"],
        y=st_full["PM2.5_High"],
        mode="lines",
        line=dict(width=0),
        showlegend=False,
    ))
    # Low bound fill
    fig_st.add_trace(go.Scatter(
        x=st_full["Datetime"],
        y=st_full["PM2.5_Low"],
        mode="lines",
        line=dict(width=0),
        fill="tonexty",
        fillcolor="rgba(239, 68, 68, 0.2)",
        name="80% Range",
    ))
    # Median line
    fig_st.add_trace(go.Scatter(
        x=st_full["Datetime"],
        y=st_full["PM2.5_Median"],
        mode="lines+markers",
        line=dict(color="#ef4444", width=3),
        name="Predicted PM2.5",
    ))
    # Vertical line for current selected time
    fig_st.add_vline(
        x=active_timestamp.timestamp() * 1000,
        line_width=2,
        line_color="#38bdf8",
        line_dash="dot",
        annotation_text="Selected Time",
    )
    # Highlight Diwali Night
    fig_st.add_vrect(
        x0="2026-11-08 19:00:00",
        x1="2026-11-09 03:00:00",
        fillcolor="rgba(255, 75, 75, 0.25)",
        layer="below",
        line_width=1,
        line_color="#ff4b4b",
        annotation_text="Diwali Night Firecrackers",
    )
    fig_st.update_layout(
        paper_bgcolor="#11151c",
        plot_bgcolor="#18202c",
        font=dict(color="#f0f3f6"),
        xaxis=dict(gridcolor="#283548"),
        yaxis=dict(gridcolor="#283548", title="PM2.5 (µg/m³)"),
        margin=dict(l=40, r=20, t=30, b=40),
        height=480,
    )
    st.plotly_chart(fig_st, use_container_width=True)

