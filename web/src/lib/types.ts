export interface ForecastRecord {
  Datetime: string;
  Station: string;
  Latitude: number;
  Longitude: number;
  Is_Delhi: boolean;
  Location_Type: string;
  Year: number;
  Days_From_Diwali: number;
  Is_Diwali_Night: boolean;
  Temperature: number;
  Humidity: number;
  Wind_Speed: number;
  Wind_Direction: number;
  Pressure: number;
  Precipitation: number;
  "PM2.5_Median": number;
  "PM2.5_Low": number;
  "PM2.5_High": number;
  AQI: number;
  AQI_Category: string;
}

export interface StationCoord {
  Station: string;
  Latitude: number;
  Longitude: number;
  Region: string;
  Locality: string;
  Coordinate_Status: string;
}

export interface MetricRecord {
  Held_Out_Year: number;
  Baseline_MAE: number;
  LGBM_MAE: number;
  Baseline_RMSE: number;
  LGBM_RMSE: number;
  Baseline_Diwali_Night_MAE: number;
  LGBM_Diwali_Night_MAE: number;
  "MAE_Improvement_%": number;
}

export interface TrustRecord {
  Datetime: string;
  Station: string;
  Is_Delhi: boolean;
  Days_From_Diwali: number;
  Is_Diwali_Night: boolean;
  "PM2.5": number;
  Baseline_Pred: number;
  LGBM_Pred: number;
}

export interface ShapRecord {
  Feature: string;
  Mean_Absolute_SHAP: number;
}
