"""
AEGISX Blue Team - Layer 1: Behavioral Deviation Analysis
Analyzes amount deviations (z-scores, percentiles), unusual hours, and category anomalies
relative to historical baseline.
"""

from typing import Dict, Any, Tuple

def analyze_behavioral_deviation(
    txn: Dict[str, Any],
    baseline: Dict[str, Any],
    hour_override: int = None
) -> Tuple[float, Dict[str, Any]]:
    """
    Returns (sub_score_0_to_100, details_dict)
    """
    if not baseline:
        return 30.0, {"reason": "No customer baseline available"}

    amount = float(txn.get("amount", 0.0))
    mean_amt = baseline.get("mean_amount", 2500.0)
    std_amt = max(10.0, baseline.get("std_amount", 500.0))
    max_amt = baseline.get("max_amount", 6000.0)
    p95_amt = baseline.get("p95_amount", 5000.0)
    
    # 1. Amount Z-score & Multiplier
    z_score = max(0.0, (amount - mean_amt) / std_amt)
    multiplier = amount / mean_amt if mean_amt > 0 else 1.0
    
    amount_score = 0.0
    if multiplier >= 10.0:  # e.g. 78,000 vs 2,800 = 27.8x
        amount_score = min(100.0, 85.0 + (multiplier - 10.0) * 0.8)
    elif multiplier >= 4.0:
        amount_score = min(85.0, 60.0 + (multiplier - 4.0) * 4.0)
    elif multiplier >= 2.0 or amount > max_amt:
        amount_score = min(60.0, 35.0 + (amount - max_amt) / max_amt * 25.0)
    elif amount > p95_amt:
        amount_score = 25.0
    else:
        amount_score = 5.0

    # 2. Time-of-Day Anomaly
    normal_start, normal_end = baseline.get("normal_hours", [9, 22])
    txn_hour = hour_override
    if txn_hour is None:
        try:
            from datetime import datetime, timezone
            from zoneinfo import ZoneInfo
            ts_str = txn.get("timestamp", "")
            if ts_str:
                dt = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                kolkata_tz = ZoneInfo("Asia/Kolkata")
                dt_ist = dt.astimezone(kolkata_tz)
                txn_hour = dt_ist.hour
        except Exception:
            txn_hour = 14
            
    time_score = 0.0
    is_off_hours = False
    if txn_hour is not None:
        if normal_start <= normal_end:
            is_off_hours = not (normal_start <= txn_hour <= normal_end)
        else:
            is_off_hours = not (txn_hour >= normal_start or txn_hour <= normal_end)
            
        if is_off_hours:
            if 0 <= txn_hour <= 5:  # Deep night 00:00 - 05:00
                time_score = 75.0
            else:
                time_score = 45.0
        else:
            time_score = 5.0

    # 3. Category & Payment Method deviation
    cat = txn.get("merchant_category", "")
    pref_cats = baseline.get("preferred_categories", [])
    cat_score = 5.0
    if cat and pref_cats and cat not in pref_cats:
        cat_score = 40.0

    pay_method = txn.get("payment_method", "")
    typ_methods = baseline.get("typical_payment_methods", [])
    method_score = 5.0
    if pay_method and typ_methods and pay_method not in typ_methods:
        method_score = 30.0

    # Composite Behavioral Sub-Score with non-linear scaling on extreme amount surges
    if amount_score >= 80.0:
        raw_behavioral = amount_score * 0.85 + (15.0 if is_off_hours else 0.0) + (cat_score * 0.08) + (method_score * 0.07)
    else:
        raw_behavioral = (
            amount_score * 0.60 +
            time_score * 0.25 +
            cat_score * 0.08 +
            method_score * 0.07
        )
        if is_off_hours:
            raw_behavioral = min(100.0, raw_behavioral + 10.0)

    composite_subscore = min(100.0, max(0.0, raw_behavioral))

    details = {
        "z_score": round(z_score, 2),
        "amount_multiplier": round(multiplier, 2),
        "baseline_mean": mean_amt,
        "baseline_range": baseline.get("spending_range", [0, 0]),
        "normal_hours": f"{normal_start:02d}:00 - {normal_end:02d}:00",
        "txn_hour": f"{txn_hour:02d}:00" if txn_hour is not None else "N/A",
        "is_off_hours": is_off_hours,
        "category_deviation": cat not in pref_cats if pref_cats else False,
        "sub_score": round(composite_subscore, 1)
    }

    return composite_subscore, details
