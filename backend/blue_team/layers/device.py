"""
AEGISX Blue Team - Layer 2: Device Intelligence
Checks device trust status, fingerprint matching, new device anomalies, and cross-customer device reuse.
"""

from typing import Dict, Any, Tuple, Optional

def analyze_device_intelligence(
    txn: Dict[str, Any],
    baseline: Dict[str, Any],
    global_device_registry: Optional[Dict[str, Any]] = None
) -> Tuple[float, Dict[str, Any]]:
    """
    Returns (sub_score_0_to_100, details_dict)
    """
    device_id = txn.get("device_id", "")
    customer_id = txn.get("customer_id", "")
    trusted_devices = baseline.get("trusted_devices", []) if baseline else []

    sub_score = 0.0
    is_trusted = device_id in trusted_devices
    is_new_device = False
    is_shared_device = False
    device_owner = None

    if not device_id:
        sub_score = 50.0
        return sub_score, {"reason": "Missing device telemetry", "sub_score": sub_score}

    if is_trusted:
        # Recognized trusted device
        sub_score = 5.0
    else:
        # Untrusted / New Device
        is_new_device = True
        sub_score = 65.0  # Base penalty for unfamiliar device

        # Check if this device is registered to another customer in the registry
        if global_device_registry and device_id in global_device_registry:
            reg_info = global_device_registry[device_id]
            registered_cust = reg_info.get("customer_id")
            if registered_cust and registered_cust != customer_id:
                is_shared_device = True
                device_owner = registered_cust
                sub_score = 90.0  # High penalty for device belonging to someone else!
        elif "NEW" in device_id or "UNKNOWN" in device_id or "EMULATOR" in device_id:
            sub_score = 80.0

    details = {
        "device_id": device_id,
        "is_trusted": is_trusted,
        "is_new_device": is_new_device,
        "is_shared_device": is_shared_device,
        "device_owner": device_owner,
        "trusted_devices": list(trusted_devices),
        "sub_score": round(sub_score, 1)
    }

    return sub_score, details
