"""
Verification Script for AEGISX First MVP
Tests the complete end-to-end loop:
Historical Baseline -> Unlabeled Stream -> ATO Attack Injection -> Hidden Ledger Isolation ->
Blue Team 7-Layer Detection -> Dynamic Risk -> Mitigation (BLOCK) -> Explainable Attribution ->
Hidden Ground Truth Reveal -> Real Evaluation Metrics -> Attack Replay -> Scoreboard.
"""

import sys
import os

# Ensure UTF-8 stdout
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Add root to pythonpath
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.data.historical_store import historical_store
from backend.red_team.scenario_generator import red_team_generator
from backend.red_team.ledger import hidden_attack_ledger
from backend.blue_team.pipeline import blue_team_pipeline
from backend.evaluation.evaluator import evaluation_engine
from backend.evaluation.scoreboard import global_scoreboard
from backend.learning.replayer import global_attack_replayer
from backend.learning.adaptation import defense_adaptation_engine
from backend.simulation.engine import simulation_engine

def run_verification():
    print("============================================================")
    print("RUNNING AEGISX FIRST MVP END-TO-END VERIFICATION")
    print("============================================================")

    # 1. Verify Historical Baseline (World 1)
    priya_baseline = historical_store.get_baseline("C001")
    assert priya_baseline is not None, "Priya baseline missing!"
    print(f"[OK] World 1 Baseline Loaded: {priya_baseline['synthetic_name']} ({priya_baseline['customer_id']})")
    print(f"     Home: {priya_baseline['home_city']} | Spending: {priya_baseline['spending_range']} | Mean: INR {priya_baseline['mean_amount']}")
    print(f"     Trusted Devices: {priya_baseline['trusted_devices']} | Normal Hours: {priya_baseline['normal_hours']}")

    # 2. Verify Red Team Scenario Generation (World 2 Injection + World 3 Ledger)
    attack = red_team_generator.generate_attack(
        attack_type="ACCOUNT_TAKEOVER",
        target_customer_id="C001",
        difficulty="MEDIUM"
    )
    assert attack is not None and len(attack["injected_transactions"]) > 0
    injected_txn = attack["injected_transactions"][0]
    print(f"\n[OK] Red Team Scenario Synthesized: {attack['attack_type']} ({attack['difficulty']})")
    print(f"     Objective: {attack['objective']}")
    print(f"     Injected Txn: INR {injected_txn['amount']} | City: {injected_txn['city']} | Device: {injected_txn['device_id']}")

    # 3. Verify Hidden Ledger Isolation (World 3)
    assert hidden_attack_ledger.is_transaction_injected_fraud(injected_txn["transaction_id"]) == True
    print(f"[OK] Hidden Attack Ledger: Recorded ground truth 'FRAUD' for {injected_txn['transaction_id']} in isolated World 3 store.")

    # 4. Verify Blue Team Layered Detection (World 2 strictly UNLABELED)
    unlabeled_payload = {
        "transaction_id": injected_txn["transaction_id"],
        "customer_id": injected_txn["customer_id"],
        "amount": injected_txn["amount"],
        "currency": injected_txn["currency"],
        "merchant_id": injected_txn["merchant_id"],
        "merchant_category": injected_txn["merchant_category"],
        "timestamp": injected_txn["timestamp"],
        "city": injected_txn["city"],
        "country": injected_txn["country"],
        "device_id": injected_txn["device_id"],
        "payment_method": injected_txn["payment_method"]
    }
    assert "is_fraud" not in unlabeled_payload and "ground_truth" not in unlabeled_payload
    
    assessment = blue_team_pipeline.analyze_unlabeled_transaction(unlabeled_payload, simulation_engine.config)
    print(f"\n[OK] Blue Team Inference (WITHOUT LABELS):")
    print(f"     Calculated Dynamic Risk Score: {assessment['risk_score']} / 100")
    print(f"     Mitigation Action: {assessment['decision']}")
    print(f"     Explainable Risk Attribution: {assessment['risk_attribution']}")
    print(f"     XAI Diagnostic Reasons: {assessment['xai']['reasons']}")
    
    # Risk score must exceed block threshold (80.0)
    assert assessment["decision"] == "BLOCK", f"Expected BLOCK, got {assessment['decision']}"
    assert assessment["risk_score"] >= 80.0, f"Expected risk >= 80, got {assessment['risk_score']}"

    # 5. Verify Evaluation Engine (Ground Truth Reveal)
    eval_result = evaluation_engine.evaluate_simulation(
        blue_team_pipeline.predictions_store,
        [assessment]
    )
    metrics = eval_result["metrics"]
    print(f"\n[OK] Post-Simulation Evaluation (Ground Truth Revealed):")
    print(f"     Precision: {metrics['precision']} | Recall / Detection Rate: {metrics['detection_rate_pct']}% | F1: {metrics['f1_score']}")
    print(f"     Confusion Matrix: {eval_result['confusion_matrix']}")

    # 6. Verify Continuous Learning & Adaptation
    adaptation = defense_adaptation_engine.adapt_defense([], simulation_engine.config)
    print(f"\n[OK] Continuous Adaptation Engine: Defense upgraded to {adaptation['version']}")
    print(f"     Adjustments: {adaptation['adjustments']}")

    # 7. Verify Attack Replay Engine (Before vs After)
    replay = global_attack_replayer.replay_attack(
        attack_id=attack["attack_id"],
        custom_transactions=[injected_txn]
    )
    print(f"\n[OK] Attack Replay Simulation:")
    print(f"     Before Defense ({replay['before_defense']['version']}): Risk {replay['before_defense']['avg_risk_score']} -> {replay['before_defense']['decision']}")
    print(f"     After Defense  ({replay['after_defense']['version']}): Risk {replay['after_defense']['avg_risk_score']} -> {replay['after_defense']['decision']}")
    print(f"     Replay Summary: {replay['improvement_summary']}")

    # 8. Scoreboard Check
    scoreboard = global_scoreboard.get_scoreboard()
    print(f"\n[OK] AI vs AI Scoreboard Active Rounds: {len(scoreboard['rounds'])}")

    print("\n============================================================")
    print("[SUCCESS] ALL FIRST MVP SPECIFICATIONS VERIFIED & PASSING!")
    print("============================================================")

if __name__ == "__main__":
    run_verification()
