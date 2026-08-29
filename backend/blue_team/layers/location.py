"""
AEGISX Blue Team - Layer 3: Location Intelligence & Impossible Travel
Computes geographic distance, home/common location divergence, and impossible travel velocity.
"""

import math
from datetime import datetime
from typing import Dict, Any, Tuple, Optional
from backend.data.generator import CITY_COORDINATES

def haversine_distance(coord1: Dict[str, float], coord2: Dict[str, float]) -> float:
    """
    Computes distance in km between two lat/lon coordinates.
    """
    R = 6371.0  # Earth radius in km
    lat1 = math.radians(coord1["lat"])
    lon1 = math.radians(coord1["lon"])
    lat2 = math.radians(coord2["lat"])
    lon2 = math.radians(coord2["lon"])

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def analyze_location_intelligence(
    txn: Dict[str, Any],
    baseline: Dict[str, Any],
    last_known_location: Optional[Dict[str, Any]] = None
) -> Tuple[float, Dict[str, Any]]:
    """
    Returns (sub_score_0_to_100, details_dict)
    """
    city = txn.get("city", "")
    country = txn.get("country", "India")
    common_cities = baseline.get("common_cities", []) if baseline else []
    home_city = baseline.get("home_city", "") if baseline else ""

    sub_score = 0.0
    is_common = city in common_cities or city == home_city
    is_foreign = country != "India" and (not baseline or baseline.get("country", "India") == "India")
    impossible_travel = False
    travel_speed_kmh = 0.0
    distance_from_last_km = 0.0

    current_coords = CITY_COORDINATES.get(city, {"lat": 20.5937, "lon": 78.9629})

    if is_common:
        sub_score = 5.0
    else:
        sub_score = 45.0  # Unfamiliar domestic city
        if is_foreign:
            sub_score = 85.0  # Unfamiliar international location

    # Check Impossible Travel vs last known transaction
    if last_known_location and last_known_location.get("city") != city:
        last_city = last_known_location.get("city")
        last_coords = CITY_COORDINATES.get(last_city, {"lat": 20.5937, "lon": 78.9629})
        dist = haversine_distance(last_coords, current_coords)
        distance_from_last_km = dist

        last_time_str = last_known_location.get("timestamp")
        current_time_str = txn.get("timestamp")

        if last_time_str and current_time_str:
            try:
                t1 = datetime.fromisoformat(last_time_str.replace("Z", "+00:00"))
                t2 = datetime.fromisoformat(current_time_str.replace("Z", "+00:00"))
                time_diff_hours = abs((t2 - t1).total_seconds()) / 3600.0

                if time_diff_hours > 0:
                    travel_speed_kmh = dist / time_diff_hours
                    # If speed exceeds commercial airliner flight velocity (> 850 km/h) or rapid jump (> 300 km in < 15 mins)
                    if (travel_speed_kmh > 850.0 and dist > 100.0) or (dist > 300.0 and time_diff_hours < 0.3):
                        impossible_travel = True
                        sub_score = min(100.0, max(sub_score, 95.0))
                    elif travel_speed_kmh > 350.0 and dist > 80.0:
                        sub_score = min(90.0, max(sub_score, 75.0))
            except Exception:
                pass

    details = {
        "city": city,
        "country": country,
        "is_common_location": is_common,
        "home_city": home_city,
        "common_cities": list(common_cities),
        "impossible_travel": impossible_travel,
        "travel_speed_kmh": round(travel_speed_kmh, 1),
        "distance_from_last_km": round(distance_from_last_km, 1),
        "sub_score": round(sub_score, 1)
    }

    return sub_score, details
