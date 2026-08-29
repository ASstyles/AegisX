"""
AEGISX Explainable AI (XAI) Diagnostic Engine
Generates human-readable signal explanations and executive natural-language summaries for investigators.
"""

from typing import Dict, Any, List

def generate_explanation(
    txn: Dict[str, Any],
    baseline: Dict[str, Any],
    layer_scores: Dict[str, float],
    layer_details: Dict[str, Any],
    risk_score: float,
    decision: str
) -> Dict[str, Any]:
    """
    Synthesizes layer signals into bullet-point reasons and an investigation narrative.
    """
    reasons: List[str] = []
    
    b_det = layer_details.get("behavioral", {})
    d_det = layer_details.get("device", {})
    l_det = layer_details.get("location", {})
    v_det = layer_details.get("velocity", {})
    m_det = layer_details.get("merchant", {})
    g_det = layer_details.get("graph", {})
    a_det = layer_details.get("anomaly", {})

    amount = float(txn.get("amount", 0.0))
    cust_id = txn.get("customer_id", "Unknown")
    cust_name = baseline.get("synthetic_name", cust_id) if baseline else cust_id

    # 1. Behavioral
    if b_det.get("amount_multiplier", 1.0) >= 3.0:
        mult = b_det["amount_multiplier"]
        mean_amt = b_det.get("baseline_mean", 0.0)
        reasons.append(f"Transaction amount (₹{amount:,.2f}) is {mult:.1f}× higher than normal baseline (avg ₹{mean_amt:,.2f}).")
    elif b_det.get("z_score", 0.0) >= 2.5:
        reasons.append(f"Transaction amount ₹{amount:,.2f} deviates significantly (Z={b_det['z_score']}) from customer range.")

    if b_det.get("is_off_hours"):
        reasons.append(f"Transaction initiated at {b_det.get('txn_hour', 'unusual hours')} outside customer's normal window ({b_det.get('normal_hours')}).")

    if b_det.get("category_deviation"):
        reasons.append(f"Merchant category '{txn.get('merchant_category')}' is outside customer's preferred categories.")

    # 2. Device
    if d_det.get("is_shared_device"):
        reasons.append(f"Device '{txn.get('device_id')}' is recognized as belonging to another customer ({d_det.get('device_owner')}).")
    elif d_det.get("is_new_device"):
        reasons.append(f"Device '{txn.get('device_id')}' is completely new and unverified for this account.")

    # 3. Location
    if l_det.get("impossible_travel"):
        reasons.append(f"Impossible travel detected: {l_det.get('distance_from_last_km')} km at {l_det.get('travel_speed_kmh')} km/h from last recorded city.")
    elif not l_det.get("is_common_location"):
        reasons.append(f"Transaction location '{txn.get('city')}' differs from customer's home/common cities ({l_det.get('home_city')}).")

    # 4. Velocity
    if v_det.get("is_card_testing"):
        reasons.append("Card testing pattern detected: rapid burst of micro-transactions within 60 seconds.")
    elif v_det.get("txns_last_1min", 0) >= 3:
        reasons.append(f"High transaction velocity: {v_det.get('txns_last_1min')} transactions in under 1 minute.")
    elif v_det.get("merchant_hopping"):
        reasons.append("Rapid merchant hopping observed across multiple checkout endpoints.")

    # 5. Merchant
    if m_det.get("is_fake_or_shell"):
        reasons.append(f"Merchant '{txn.get('merchant_name')}' flagged as newly formed shell entity (Trust Score: {m_det.get('trust_score')}/100).")

    # 6. Graph
    if g_det.get("is_fraud_ring"):
        reasons.append(f"Graph Intelligence: Device is actively shared across {g_det.get('connected_customers_count')} distinct customer accounts (Fraud Ring cluster).")

    # 7. Anomaly
    if a_det.get("is_anomaly") and len(reasons) < 2:
        reasons.append(f"Unsupervised Isolation Forest flagged statistical vector anomaly (Decision score: {a_det.get('raw_decision_score')}).")

    if not reasons:
        reasons.append("Transaction characteristics align with established behavioral baseline.")

    # Generate natural language narrative
    city = txn.get("city", "Unknown")
    dev = txn.get("device_id", "Unknown")
    home = baseline.get("home_city", "Unknown") if baseline else "Unknown"
    range_str = f"₹{baseline['spending_range'][0]:,}–₹{baseline['spending_range'][1]:,}" if baseline else "N/A"

    narrative = (
        f"Customer {cust_name} ({cust_id}) normally transacts between {range_str} from {home}. "
        f"This transaction is ₹{amount:,.2f} originating from {city} via device '{dev}'. "
        f"Aggregated behavioral, device, and environmental anomalies result in a composite risk score of {risk_score}/100, triggering a {decision} action."
    )

    return {
        "summary": narrative,
        "reasons": reasons,
        "recommended_action": decision
    }
