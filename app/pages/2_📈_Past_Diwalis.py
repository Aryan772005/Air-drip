"""
Page 2: Past Diwalis Analysis & Empirical Evidence
"""

import os
import sys
sys.path.insert(0, os.path.abspath("."))
import streamlit as st
import pandas as pd
from src.diwali import analyze_diwali_effect

st.set_page_config(page_title="Past Diwalis - Hawa AI", page_icon="📈", layout="wide")

st.title("📈 Past Diwalis: The Empirical Reality")
st.caption("Historical analysis of Diwali pollution spikes across Delhi & Indian cities (2018 - 2024)")

@st.cache_data
def get_diwali_charts():
    return analyze_diwali_effect()

fig1, fig2, fig3, facts = get_diwali_charts()

# Plain English Key Facts Cards
st.subheader("💡 3 Key Facts About Diwali Air Quality")
c1, c2, c3 = st.columns(3)
with c1:
    st.info(f"**⚡ Nighttime Surge**\n\n{facts[0]}")
with c2:
    st.warning(f"**⏰ Peak Stagnation Hours**\n\n{facts[1]}")
with c3:
    st.error(f"**🔥 Hardest Hit Hotspots**\n\n{facts[2]}")

st.divider()

# Charts
st.subheader("1. Festival Trajectory: D-7 to D+7 Ambient Air Trend")
st.plotly_chart(fig1, use_container_width=True)

col_a, col_b = st.columns(2)
with col_a:
    st.subheader("2. Diwali Night vs Pre-Diwali Baseline (19:00 - 02:00)")
    st.plotly_chart(fig2, use_container_width=True)
with col_b:
    st.subheader("3. Top 10 Hardest-Hit Locations (Absolute Surge)")
    st.plotly_chart(fig3, use_container_width=True)

