"""
AEGISX Blue Team - Layer 5: Merchant Intelligence
Evaluates merchant trust reputation, account age, fake merchant flags, and high-risk category exposure.
"""

from typing import Dict, Any, Tuple, Optional

def analyze_merchant_intelligence(
    txn: Dict[str, Any],
    merchant_profile: Optional[Dict[str, Any]] = None
) -> Tuple[float, Dict[str, Any]]:
    """
    Returns (sub_score_0_to_100, details_dict)
    """
    merchant_id = txn.get("merchant_id", "")
    merchant_name = txn.get("merchant_name", "")
    category = txn.get("merchant_category", "")
    amount = float(txn.get("amount", 0.0))

    if not merchant_profile:
        # Unknown or newly encountered merchant without established profile
        is_unknown = True
        trust_score = 35.0
        account_age = 0.1
    else:
        is_unknown = False
        trust_score = float(merchant_profile.get("trust_score", 85.0))
        account_age = float(merchant_profile.get("account_age_years", 3.0))

    # Base merchant penalty based on trust score
    base_score = max(0.0, 100.0 - trust_score)

    is_fake_or_shell = False
    if "FAKE" in merchant_id or "SHELL" in merchant_id or trust_score < 40.0:
        is_fake_or_shell = True
        base_score = max(base_score, 85.0)

    # Spike on brand new merchant
    if account_age < 0.5 and amount > 25000:
        base_score = min(100.0, base_score + 25.0)

    sub_score = min(100.0, max(0.0, base_score))

    details = {
        "merchant_id": merchant_id,
        "merchant_name": merchant_name,
        "category": category,
        "trust_score": trust_score,
        "account_age_years": account_age,
        "is_unknown_merchant": is_unknown,
        "is_fake_or_shell": is_fake_or_shell,
        "sub_score": round(sub_score, 1)
    }

    return sub_score, details
