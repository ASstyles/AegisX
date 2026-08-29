"""
AEGISX Evaluation Engine
Reveals Hidden Ground Truth post-simulation and calculates exact, un-fabricated confusion matrix,
precision, recall, F1, FPR, and missed attack attribution.
"""

from typing import Dict, List, Any
from backend.red_team.ledger import hidden_attack_ledger

class EvaluationEngine:
    def __init__(self):
        pass

    def evaluate_simulation(
        self,
        predictions: Dict[str, Dict[str, Any]],
        processed_transactions: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Matches real-time Blue Team predictions against World 3 Hidden Attack Ledger.
        """
        tp = 0
        fp = 0
        tn = 0
        fn = 0

        evaluated_txns = []
        missed_attacks = []
        detected_attacks = []

        for txn in processed_transactions:
            txn_id = txn.get("transaction_id")
            pred = predictions.get(txn_id, {})
            
            # Prediction
            decision = pred.get("decision", txn.get("decision", "APPROVE"))
            is_predicted_fraud = decision in ["BLOCK", "CHALLENGE"]
            risk_score = pred.get("risk_score", txn.get("risk_score", 10.0))

            # Ground Truth from isolated ledger
            is_actual_fraud = hidden_attack_ledger.is_transaction_injected_fraud(txn_id)
            attack_record = hidden_attack_ledger.get_attack_for_transaction(txn_id)

            if is_actual_fraud and is_predicted_fraud:
                tp += 1
                detected_attacks.append({
                    "transaction_id": txn_id,
                    "attack_type": attack_record.get("attack_type") if attack_record else "FRAUD",
                    "risk_score": risk_score,
                    "decision": decision
                })
            elif not is_actual_fraud and is_predicted_fraud:
                fp += 1
            elif not is_actual_fraud and not is_predicted_fraud:
                tn += 1
            elif is_actual_fraud and not is_predicted_fraud:
                fn += 1
                missed_attacks.append({
                    "transaction_id": txn_id,
                    "attack_type": attack_record.get("attack_type") if attack_record else "FRAUD",
                    "difficulty": attack_record.get("difficulty") if attack_record else "UNKNOWN",
                    "amount": txn.get("amount"),
                    "risk_score": risk_score,
                    "decision": decision,
                    "target_customer": txn.get("customer_id"),
                    "reasons": txn.get("xai", {}).get("reasons", []),
                    "layer_scores": txn.get("layer_scores", {})
                })

            evaluated_txns.append({
                "transaction_id": txn_id,
                "customer_id": txn.get("customer_id"),
                "amount": txn.get("amount"),
                "risk_score": risk_score,
                "decision": decision,
                "is_actual_fraud": is_actual_fraud,
                "is_predicted_fraud": is_predicted_fraud,
                "classification": "TP" if (is_actual_fraud and is_predicted_fraud) else
                                  "FP" if (not is_actual_fraud and is_predicted_fraud) else
                                  "TN" if (not is_actual_fraud and not is_predicted_fraud) else "FN"
            })

        # Calculate exact metrics
        total = tp + fp + tn + fn
        total_positives = tp + fn
        total_negatives = tn + fp

        precision = (tp / (tp + fp)) if (tp + fp) > 0 else (1.0 if tp == 0 and fp == 0 else 0.0)
        recall = (tp / total_positives) if total_positives > 0 else 1.0
        f1 = (2 * precision * recall / (precision + recall)) if (precision + recall) > 0 else 0.0
        fpr = (fp / total_negatives) if total_negatives > 0 else 0.0
        detection_rate = recall * 100.0
        attack_success_rate = ((fn / total_positives) * 100.0) if total_positives > 0 else 0.0

        return {
            "confusion_matrix": {
                "true_positives": tp,
                "false_positives": fp,
                "true_negatives": tn,
                "false_negatives": fn,
                "total_transactions": total
            },
            "metrics": {
                "precision": round(precision, 4),
                "recall": round(recall, 4),
                "f1_score": round(f1, 4),
                "detection_rate_pct": round(detection_rate, 1),
                "false_positive_rate_pct": round(fpr * 100.0, 2),
                "attack_success_rate_pct": round(attack_success_rate, 1),
                "total_attacks_injected": total_positives,
                "total_attacks_detected": tp,
                "total_attacks_missed": fn
            },
            "missed_attacks": missed_attacks,
            "detected_attacks": detected_attacks,
            "evaluated_transactions_sample": evaluated_txns[-20:]  # Recent sample
        }

# Global evaluation engine
evaluation_engine = EvaluationEngine()
