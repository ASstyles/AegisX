"""
AEGISX Blue Team - Layer 7: Unsupervised Anomaly Detection
Uses Isolation Forest trained on standardized baseline feature representations.
Operates strictly without fraud labels during live inference.
"""

import numpy as np
from sklearn.ensemble import IsolationForest
from typing import Dict, Any, Tuple, List, Optional

class UnsupervisedAnomalyDetector:
    def __init__(self, random_state: int = 2026):
        self.model = IsolationForest(
            n_estimators=100,
            contamination=0.03,
            random_state=random_state
        )
        self.is_fitted = False
        self._fit_on_synthetic_baseline()

    def _extract_features(
        self,
        amount: float,
        mean_amount: float,
        hour: int,
        is_trusted_device: bool,
        is_common_city: bool,
        merchant_trust: float
    ) -> List[float]:
        amt_ratio = amount / max(10.0, mean_amount)
        log_amt = np.log1p(amount)
        hour_sin = np.sin(2 * np.pi * hour / 24.0)
        hour_cos = np.cos(2 * np.pi * hour / 24.0)
        dev_flag = 1.0 if is_trusted_device else 0.0
        city_flag = 1.0 if is_common_city else 0.0
        m_trust = merchant_trust / 100.0

        return [amt_ratio, log_amt, hour_sin, hour_cos, dev_flag, city_flag, m_trust]

    def _fit_on_synthetic_baseline(self):
        """
        Fits unsupervised Isolation Forest on synthetic normal variations.
        """
        np.random.seed(2026)
        n_samples = 1500
        
        # Synthesize normal baseline vectors
        X_train = []
        for _ in range(n_samples):
            # Normal distribution: amount ratio ~ 0.8 - 1.5, daytime hours, trusted device, common city
            amt_ratio = np.random.normal(1.0, 0.3)
            amt_ratio = max(0.2, min(3.0, amt_ratio))
            base_amt = 2500.0
            amt = base_amt * amt_ratio
            hour = int(np.random.normal(14, 3)) % 24
            is_trusted = np.random.random() > 0.05
            is_common = np.random.random() > 0.08
            trust = np.random.normal(92, 5)
            
            vec = self._extract_features(amt, base_amt, hour, is_trusted, is_common, trust)
            X_train.append(vec)

        self.model.fit(X_train)
        self.is_fitted = True

    def analyze_anomaly(
        self,
        txn: Dict[str, Any],
        baseline: Dict[str, Any],
        device_details: Dict[str, Any],
        location_details: Dict[str, Any],
        merchant_details: Dict[str, Any]
    ) -> Tuple[float, Dict[str, Any]]:
        """
        Returns (sub_score_0_to_100, details_dict)
        """
        if not self.is_fitted:
            self._fit_on_synthetic_baseline()

        amount = float(txn.get("amount", 0.0))
        mean_amt = baseline.get("mean_amount", 2500.0) if baseline else 2500.0
        
        # Determine hour in local target timezone (Asia/Kolkata)
        hour = 14
        try:
            from datetime import datetime, timezone
            from zoneinfo import ZoneInfo
            ts_str = txn.get("timestamp", "")
            if ts_str:
                dt = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                kolkata_tz = ZoneInfo("Asia/Kolkata")
                hour = dt.astimezone(kolkata_tz).hour
        except Exception:
            pass

        is_trusted = device_details.get("is_trusted", True)
        is_common = location_details.get("is_common_location", True)
        merchant_trust = merchant_details.get("trust_score", 90.0)

        vec = self._extract_features(amount, mean_amt, hour, is_trusted, is_common, merchant_trust)
        
        # Isolation Forest score: lower (negative) is more anomalous
        raw_score = float(self.model.decision_function([vec])[0])
        
        # Map raw score [-0.3, 0.3] -> [100.0, 0.0]
        # raw_score <= -0.15 is highly anomalous
        normalized_score = np.clip(50.0 - (raw_score * 160.0), 0.0, 100.0)
        
        details = {
            "raw_decision_score": round(raw_score, 4),
            "is_anomaly": bool(raw_score < 0.0),
            "feature_vector": [round(x, 2) for x in vec],
            "sub_score": round(normalized_score, 1)
        }

        return float(normalized_score), details

# Global unsupervised anomaly detector instance
global_anomaly_detector = UnsupervisedAnomalyDetector()
