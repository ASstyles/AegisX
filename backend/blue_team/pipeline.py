"""
AEGISX Blue Team Defense Pipeline (World 2 Inference)
Coordinates 7-layer defense evaluation on UNLABELED transaction payloads.
Strictly receives NO fraud labels, attack IDs, or Red Team ground truth.
"""

from typing import Dict, Any, Optional
from datetime import datetime

from backend.data.historical_store import historical_store
from backend.blue_team.layers.behavioral import analyze_behavioral_deviation
from backend.blue_team.layers.device import analyze_device_intelligence
from backend.blue_team.layers.location import analyze_location_intelligence
from backend.blue_team.layers.velocity import global_velocity_tracker
from backend.blue_team.layers.merchant import analyze_merchant_intelligence
from backend.blue_team.layers.graph import global_fraud_graph
from backend.blue_team.layers.anomaly import global_anomaly_detector
from backend.blue_team.risk_engine import calculate_composite_risk
from backend.xai.explainer import generate_explanation
from backend.config import SimulationConfig

class BlueTeamPipeline:
    def __init__(self):
        # In-memory customer last known location tracker
        self.last_known_locations: Dict[str, Dict[str, Any]] = {}
        # Stores predictions internally for evaluation matching
        self.predictions_store: Dict[str, Dict[str, Any]] = {}

    def analyze_unlabeled_transaction(
        self,
        txn: Dict[str, Any],
        config: Optional[SimulationConfig] = None
    ) -> Dict[str, Any]:
        """
        Main entry point for real-time inference.
        CRITICAL: Input transaction MUST NOT contain any ground truth labels.
        """
        # Ensure no accidental ground truth leakage into inference
        sanitized_txn = {k: v for k, v in txn.items() if k not in ["is_fraud", "fraud_label", "attack_type", "attack_id", "ground_truth"]}
        
        customer_id = sanitized_txn.get("customer_id", "")
        merchant_id = sanitized_txn.get("merchant_id", "")
        device_id = sanitized_txn.get("device_id", "")
        city = sanitized_txn.get("city", "")
        
        # 1. Fetch World 1 Behavioral Baseline & Metadata
        baseline = historical_store.get_baseline(customer_id)
        merchant_profile = historical_store.get_merchant(merchant_id)
        global_devices = historical_store.devices
        last_location = self.last_known_locations.get(customer_id)

        # 2. Update Graph & Entities
        global_fraud_graph.add_transaction_edges(
            customer_id=customer_id,
            device_id=device_id,
            merchant_id=merchant_id,
            city=city
        )

        # 3. Execute 7 Detection Layers
        l1_score, l1_details = analyze_behavioral_deviation(sanitized_txn, baseline)
        l2_score, l2_details = analyze_device_intelligence(sanitized_txn, baseline, global_devices)
        l3_score, l3_details = analyze_location_intelligence(sanitized_txn, baseline, last_location)
        l4_score, l4_details = global_velocity_tracker.record_and_analyze(sanitized_txn, baseline)
        l5_score, l5_details = analyze_merchant_intelligence(sanitized_txn, merchant_profile)
        l6_score, l6_details = global_fraud_graph.analyze_entity_graph(customer_id, device_id, merchant_id)
        l7_score, l7_details = global_anomaly_detector.analyze_anomaly(
            sanitized_txn, baseline, l2_details, l3_details, l5_details
        )

        layer_scores = {
            "behavioral": l1_score,
            "device": l2_score,
            "location": l3_score,
            "velocity": l4_score,
            "merchant": l5_score,
            "graph": l6_score,
            "anomaly": l7_score
        }

        layer_details = {
            "behavioral": l1_details,
            "device": l2_details,
            "location": l3_details,
            "velocity": l4_details,
            "merchant": l5_details,
            "graph": l6_details,
            "anomaly": l7_details
        }

        # 4. Composite Risk Scoring & Explainable Risk Attribution
        weights = config.defense_weights if config else None
        challenge_th = config.challenge_threshold if config else 60.0
        block_th = config.block_threshold if config else 80.0

        risk_score, decision, risk_attribution = calculate_composite_risk(
            layer_scores=layer_scores,
            weights=weights,
            challenge_thresh=challenge_th,
            block_thresh=block_th
        )

        # 5. Explainable AI Diagnostic
        xai_summary = generate_explanation(
            txn=sanitized_txn,
            baseline=baseline or {},
            layer_scores=layer_scores,
            layer_details=layer_details,
            risk_score=risk_score,
            decision=decision
        )

        # 6. Update last known location (if transaction was not blocked)
        if decision != "BLOCK" and city:
            self.last_known_locations[customer_id] = {
                "city": city,
                "timestamp": sanitized_txn.get("timestamp", datetime.now().isoformat())
            }

        # Assessment package for frontend and evaluation
        result = {
            "transaction_id": sanitized_txn.get("transaction_id"),
            "customer_id": customer_id,
            "amount": sanitized_txn.get("amount"),
            "currency": sanitized_txn.get("currency", "INR"),
            "merchant_id": merchant_id,
            "merchant_category": sanitized_txn.get("merchant_category"),
            "merchant_name": sanitized_txn.get("merchant_name", merchant_id),
            "timestamp": sanitized_txn.get("timestamp"),
            "city": city,
            "device_id": device_id,
            "payment_method": sanitized_txn.get("payment_method"),
            "risk_score": risk_score,
            "decision": decision,
            "risk_attribution": risk_attribution,
            "layer_scores": layer_scores,
            "layer_details": layer_details,
            "xai": xai_summary,
            "customer_baseline": baseline
        }

        # Store prediction internally for post-simulation evaluation
        txn_id = sanitized_txn.get("transaction_id")
        if txn_id:
            self.predictions_store[txn_id] = {
                "transaction_id": txn_id,
                "risk_score": risk_score,
                "decision": decision,
                "is_predicted_fraud": decision in ["BLOCK", "CHALLENGE"]
            }

        return result

    def get_prediction(self, transaction_id: str) -> Optional[Dict[str, Any]]:
        return self.predictions_store.get(transaction_id)

    def clear(self):
        self.last_known_locations.clear()
        self.predictions_store.clear()
        global_velocity_tracker.clear()
        global_fraud_graph.clear()

# Global Blue Team pipeline
blue_team_pipeline = BlueTeamPipeline()
