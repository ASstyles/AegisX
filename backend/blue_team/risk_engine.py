"""
AEGISX Blue Team Risk Engine
Aggregates 7-layer detection signals into Explainable Risk Attribution and Mitigation Actions.
Includes Compound Threat Correlation to prevent high-severity anomalies from being diluted.
"""

from typing import Dict, Any, Tuple
from backend.config import DEFAULT_DEFENSE_WEIGHTS

def calculate_composite_risk(
    layer_scores: Dict[str, float],
    weights: Dict[str, float] = None,
    challenge_thresh: float = 60.0,
    block_thresh: float = 80.0
) -> Tuple[float, str, Dict[str, float]]:
    """
    Computes weighted composite risk score (0 - 100), decision, and Explainable Risk Attribution.
    """
    if weights is None:
        weights = DEFAULT_DEFENSE_WEIGHTS

    total_weight = sum(weights.values())
    if total_weight <= 0:
        total_weight = 100.0

    raw_risk = 0.0
    risk_attribution: Dict[str, float] = {}

    layer_display_names = {
        "behavioral": "Behavioral Deviation",
        "device": "Device Intelligence",
        "location": "Location & Travel",
        "velocity": "Transaction Velocity",
        "merchant": "Merchant Trust",
        "graph": "Graph & Entity Network",
        "anomaly": "Unsupervised ML Anomaly"
    }

    # Base weighted attribution
    for layer_key, score in layer_scores.items():
        w = weights.get(layer_key, 10.0)
        contrib = (w / total_weight) * score
        raw_risk += contrib
        display_name = layer_display_names.get(layer_key, layer_key.title())
        risk_attribution[display_name] = round(contrib, 1)

    # Compound Multi-Vector Correlation:
    # If 2 or more major layers exhibit severe anomalies (> 70), boost composite risk
    b_score = layer_scores.get("behavioral", 0.0)
    d_score = layer_scores.get("device", 0.0)
    l_score = layer_scores.get("location", 0.0)
    v_score = layer_scores.get("velocity", 0.0)
    g_score = layer_scores.get("graph", 0.0)

    severe_count = sum(1 for s in [b_score, d_score, l_score, v_score, g_score] if s >= 70.0)
    
    if severe_count >= 3:
        raw_risk = max(raw_risk, 92.0)
    elif severe_count >= 2:
        raw_risk = max(raw_risk, 84.0)
    elif severe_count == 1 and (b_score >= 90.0 or v_score >= 90.0 or g_score >= 90.0):
        raw_risk = max(raw_risk, 76.0)

    # Re-normalize attribution to sum to final composite score
    composite_score = round(max(0.0, min(100.0, raw_risk)), 1)
    current_sum = sum(risk_attribution.values())
    if current_sum > 0:
        scale = composite_score / current_sum
        risk_attribution = {k: round(v * scale, 1) for k, v in risk_attribution.items()}

    # Decision Matrix
    if composite_score >= block_thresh:
        decision = "BLOCK"
    elif composite_score >= challenge_thresh:
        decision = "CHALLENGE"
    elif composite_score >= 31.0:
        decision = "MONITOR"
    else:
        decision = "APPROVE"

    return composite_score, decision, risk_attribution
