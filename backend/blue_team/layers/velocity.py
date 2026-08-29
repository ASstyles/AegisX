"""
AEGISX Blue Team - Layer 4: Velocity & Burst Analysis
Tracks short-term burst transactions, frequency spikes, micro-charge card testing, and merchant hopping.
"""

from typing import Dict, List, Any, Tuple
from collections import deque
from datetime import datetime, timedelta

class VelocityTracker:
    def __init__(self, window_seconds: int = 300):
        # Maps customer_id -> deque of (timestamp_dt, amount, merchant_id)
        self.customer_history: Dict[str, deque] = {}
        self.window_seconds = window_seconds

    def record_and_analyze(
        self,
        txn: Dict[str, Any],
        baseline: Dict[str, Any]
    ) -> Tuple[float, Dict[str, Any]]:
        customer_id = txn.get("customer_id", "UNKNOWN")
        amount = float(txn.get("amount", 0.0))
        merchant_id = txn.get("merchant_id", "UNKNOWN")
        
        # Parse timestamp
        now = datetime.now()
        ts_str = txn.get("timestamp")
        if ts_str:
            try:
                now = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
            except Exception:
                pass

        if customer_id not in self.customer_history:
            self.customer_history[customer_id] = deque()

        queue = self.customer_history[customer_id]
        
        # Clean older than window_seconds
        cutoff = now - timedelta(seconds=self.window_seconds)
        while queue and queue[0][0] < cutoff:
            queue.popleft()

        # Check existing state BEFORE adding current txn
        txns_in_1m = [item for item in queue if (now - item[0]).total_seconds() <= 60]
        txns_in_5m = list(queue)
        
        count_1m = len(txns_in_1m)
        count_5m = len(txns_in_5m)
        
        # Append current transaction
        queue.append((now, amount, merchant_id))

        # 1. Micro-charge Card Testing detection (e.g. amounts <= ₹10 happening 3+ times in 1m)
        micro_charges = [item for item in txns_in_1m if item[1] <= 15.0]
        is_card_testing = False
        if amount <= 15.0 and len(micro_charges) >= 2:
            is_card_testing = True

        # 2. Burst Frequency Score
        sub_score = 5.0
        if is_card_testing:
            sub_score = 92.0
        elif count_1m >= 4:
            sub_score = 88.0
        elif count_1m >= 2:
            sub_score = 65.0
        elif count_5m >= 6:
            sub_score = 70.0
        elif count_5m >= 3:
            sub_score = 40.0

        # 3. Merchant hopping (multiple different merchants in short span)
        recent_merchants = set(item[2] for item in txns_in_1m)
        merchant_hopping = len(recent_merchants) >= 3

        if merchant_hopping:
            sub_score = min(100.0, max(sub_score, 78.0))

        details = {
            "txns_last_1min": count_1m + 1,
            "txns_last_5min": count_5m + 1,
            "is_card_testing": is_card_testing,
            "merchant_hopping": merchant_hopping,
            "sub_score": round(sub_score, 1)
        }

        return sub_score, details

    def clear(self):
        self.customer_history.clear()

# Global velocity tracker instance
global_velocity_tracker = VelocityTracker()
