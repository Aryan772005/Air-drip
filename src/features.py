"""
Features Module for Hawa AI.
Extracts calendar, meteorological, festival, and spatial features without recent lags.
"""

import pandas as pd
import numpy as np

def build_features(df):
    """
    Constructs feature matrix X and target y from the air quality dataframe.
    Features:
    - Hour (0-23)
    - Day of week (0-6)
    - Month (1-12)
    - Is_Rush_Hour (8-11 and 17-21)
    - Weather: Temperature, Humidity, Wind_Speed, Wind_Direction, Pressure, Precipitation
    - Days_From_Diwali: clipped to -7..+7, or 99 ("far from Diwali")
    - Is_Diwali_Night: boolean / int (19:00 to 02:00 around Diwali)
    - Station: categorical
    - Latitude, Longitude: float
    """
    data = df.copy()
    data["Datetime"] = pd.to_datetime(data["Datetime"])
    
    # Time features
    data["hour"] = data["Datetime"].dt.hour
    data["day_of_week"] = data["Datetime"].dt.dayofweek
    data["month"] = data["Datetime"].dt.month
    
    # Rush hour flags (morning 8-11, evening 17-21)
    data["is_rush_hour"] = data["hour"].apply(lambda h: 1 if (8 <= h <= 11) or (17 <= h <= 21) else 0)
    
    # Diwali features
    if "Days_From_Diwali" in data.columns:
        # Clip to -7..+7, any row with |Days_From_Diwali| > 7 gets 99
        data["days_from_diwali_feat"] = np.where(
            data["Days_From_Diwali"].abs() <= 7,
            data["Days_From_Diwali"],
            99
        )
    else:
        data["days_from_diwali_feat"] = 99
        
    if "Is_Diwali_Night" in data.columns:
        data["is_diwali_night_feat"] = data["Is_Diwali_Night"].astype(int)
    else:
        data["is_diwali_night_feat"] = 0
        
    # Station as categorical
    data["station_cat"] = data["Station"].astype("category")
    
    feature_cols = [
        "hour",
        "day_of_week",
        "month",
        "is_rush_hour",
        "Temperature",
        "Humidity",
        "Wind_Speed",
        "Wind_Direction",
        "Pressure",
        "Precipitation",
        "days_from_diwali_feat",
        "is_diwali_night_feat",
        "station_cat",
        "Latitude",
        "Longitude",
    ]
    
    X = data[feature_cols].copy()
    y = data["PM2.5"].values if "PM2.5" in data.columns else None
    
    return X, y, data

