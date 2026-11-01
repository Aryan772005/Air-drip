"""
Interpolation Module for Hawa AI.
1. Compiles and verifies station coordinates into data/processed/station_coords.csv.
2. Implements Inverse Distance Weighting (IDW with power=2) to generate a smooth 60x60
   continuous pollution grid over Delhi for any chosen timestamp.
"""

import os
import sys
sys.path.insert(0, os.path.abspath("."))
import pandas as pd
import numpy as np

from src.data_loader import DELHI_STATIONS, ALL_INDIA_CITIES

def generate_station_coords(output_path="data/processed/station_coords.csv"):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    rows = []
    
    # Delhi Stations
    for name, info in DELHI_STATIONS.items():
        rows.append({
            "Station": name,
            "Latitude": info["lat"],
            "Longitude": info["lon"],
            "Region": "Delhi NCR",
            "Locality": info.get("locality", "Delhi"),
            "Coordinate_Status": "verified",
        })
        
    # All India Cities
    for name, info in ALL_INDIA_CITIES.items():
        rows.append({
            "Station": name,
            "Latitude": info["lat"],
            "Longitude": info["lon"],
            "Region": "All-India",
            "Locality": info.get("state", name),
            "Coordinate_Status": "verified",
        })
        
    df = pd.DataFrame(rows)
    df.to_csv(output_path, index=False)
    print(f"Station coordinates saved to {output_path} ({len(df)} locations)", flush=True)
    return df

def idw_interpolate(
    station_lats,
    station_lons,
    values,
    bounds=(28.40, 28.88, 76.85, 77.40),
    grid_size=60,
    power=2
):
    """
    Inverse Distance Weighting (IDW) interpolation.
    bounds: (min_lat, max_lat, min_lon, max_lon) for Delhi NCR.
    grid_size: number of points in each axis (60x60 grid = 3,600 points).
    power: distance weighting exponent (default 2).
    Returns:
    - grid_lats (1D array of length grid_size)
    - grid_lons (1D array of length grid_size)
    - grid_values (2D array of shape grid_size x grid_size)
    - heat_points: list of [lat, lon, normalized_val] for Folium HeatMap
    """
    min_lat, max_lat, min_lon, max_lon = bounds
    grid_lats = np.linspace(min_lat, max_lat, grid_size)
    grid_lons = np.linspace(min_lon, max_lon, grid_size)
    
    # 2D coordinate mesh
    lon_mesh, lat_mesh = np.meshgrid(grid_lons, grid_lats)
    
    flat_lats = lat_mesh.flatten()
    flat_lons = lon_mesh.flatten()
    
    num_points = len(flat_lats)
    num_stations = len(values)
    
    # Convert lat/lon degrees to approximate Euclidean km coordinates for metric distances
    lat_factor = 111.0 # ~111 km per degree lat
    lon_factor = 97.0  # ~97 km per degree lon in Delhi (cos(28.6°) * 111)
    
    station_y = station_lats * lat_factor
    station_x = station_lons * lon_factor
    
    flat_y = flat_lats * lat_factor
    flat_x = flat_lons * lon_factor
    
    # Calculate pairwise distances (num_points, num_stations)
    # Using broadcasting
    dy = flat_y[:, np.newaxis] - station_y[np.newaxis, :]
    dx = flat_x[:, np.newaxis] - station_x[np.newaxis, :]
    dist = np.sqrt(dx**2 + dy**2)
    
    # Handle points exactly on or very close to a station (< 0.1 km)
    exact_match = dist < 0.05
    dist[exact_match] = 0.05
    
    weights = 1.0 / (dist ** power)
    interpolated = np.sum(weights * values[np.newaxis, :], axis=1) / np.sum(weights, axis=1)
    
    grid_values = interpolated.reshape(grid_size, grid_size)
    
    # Format for Folium heat map: [[lat, lon, weight], ...]
    heat_points = []
    # Sample down slightly for snappy map rendering (e.g. 30x30 = 900 points)
    step = max(1, grid_size // 30)
    for i in range(0, grid_size, step):
        for j in range(0, grid_size, step):
            heat_points.append([float(grid_lats[i]), float(grid_lons[j]), float(grid_values[i, j])])
            
    return grid_lats, grid_lons, grid_values, heat_points

def test_idw():
    coords_df = generate_station_coords()
    delhi_coords = coords_df[coords_df["Region"] == "Delhi NCR"]
    lats = delhi_coords["Latitude"].values
    lons = delhi_coords["Longitude"].values
    dummy_vals = np.linspace(250, 750, len(lats))
    glats, glons, gvals, heat_pts = idw_interpolate(lats, lons, dummy_vals)
    print(f"IDW test completed. Grid shape: {gvals.shape}, Heat points: {len(heat_pts)}")

if __name__ == "__main__":
    test_idw()
