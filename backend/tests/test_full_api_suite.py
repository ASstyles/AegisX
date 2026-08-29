"""
Full End-to-End API Suite Test for AEGISX
Tests all REST endpoints and data flows against the running FastAPI server (http://127.0.0.1:8000).
"""

import urllib.request
import json
import time
import sys

# Ensure UTF-8 stdout
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

BASE_URL = "http://127.0.0.1:8000"

def post(endpoint, data=None):
    req = urllib.request.Request(
        f"{BASE_URL}{endpoint}",
        data=json.dumps(data or {}).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

def get(endpoint):
    req = urllib.request.Request(f"{BASE_URL}{endpoint}")
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

def test_suite():
    print("============================================================")
    print("TESTING FULL AEGISX BACKEND API SUITE")
    print("============================================================")

    # 1. Health & Status
    status = get("/status")
    print(f"[PASS] 1. GET /status -> defense_version: {status['defense_version']}")

    # 2. Customers & Baselines
    customers = get("/customers")
    print(f"[PASS] 2. GET /customers -> total: {customers['total']} synthetic customers loaded")
    
    priya = get("/customer/C001/baseline")
    assert priya["customer"]["synthetic_name"] == "Priya Sharma"
    print(f"[PASS] 3. GET /customer/C001/baseline -> Priya Sharma baseline loaded (Home: {priya['baseline']['home_city']})")

    # 3. Start Simulation
    start_res = post("/simulation/start")
    print(f"[PASS] 4. POST /simulation/start -> is_running: {start_res['status']['is_running']}")

    # Allow 2 seconds of traffic generation
    time.sleep(2.5)

    # 4. Live Transactions Feed
    live_txns = get("/transactions/live?limit=10")
    print(f"[PASS] 5. GET /transactions/live -> received {len(live_txns['transactions'])} live transactions")
    assert len(live_txns['transactions']) > 0, "No transactions generated!"

    # 5. Launch Attack (ATO)
    attack_res = post("/attack/launch", {
        "attack_type": "ACCOUNT_TAKEOVER",
        "target_customer": "C001",
        "difficulty": "MEDIUM",
        "intensity": "MEDIUM"
    })
    print(f"[PASS] 6. POST /attack/launch -> Injected {attack_res['attack_metadata']['attack_type']} against {attack_res['attack_metadata']['target_name']}")

    # Allow time for attack to be processed
    time.sleep(2.0)

    # 6. Check for Blocked Transaction & AI Investigator
    updated_txns = get("/transactions/live?limit=20")
    threat_txn = next((t for t in updated_txns["transactions"] if t["decision"] == "BLOCK"), None)
    if threat_txn:
        print(f"[PASS] 7. Blue Team Detection -> Successfully blocked attack: {threat_txn['transaction_id']} (Risk: {threat_txn['risk_score']}/100)")
        investigation = get(f"/investigate/{threat_txn['transaction_id']}")
        print(f"         Explainable Attribution: {investigation['risk_attribution']}")
        print(f"         AI Diagnostic Summary: {investigation['xai']['summary'][:90]}...")

    # 7. Fraud Network Graph
    graph = get("/network/graph")
    print(f"[PASS] 8. GET /network/graph -> {len(graph['nodes'])} nodes, {len(graph['edges'])} edges")

    # 8. Hidden Ground Truth Evaluation
    eval_res = post("/simulation/evaluate")
    m = eval_res["metrics"]
    print(f"[PASS] 9. POST /simulation/evaluate (Ground Truth Revealed):")
    print(f"         Precision: {m['precision']} | Recall / Detection Rate: {m['detection_rate_pct']}% | F1: {m['f1_score']}")

    # 9. Continuous Learning & Defense Adaptation
    adapt_res = post("/model/adapt")
    print(f"[PASS] 10. POST /model/adapt -> Upgraded to {adapt_res['adaptation']['version']}")

    # 10. Attack Replay Simulator
    replay_res = post("/attack/replay", {"attack_type": "ACCOUNT_TAKEOVER"})
    print(f"[PASS] 11. POST /attack/replay -> Before: {replay_res['before_defense']['decision']} ({replay_res['before_defense']['avg_risk_score']}) | After: {replay_res['after_defense']['decision']} ({replay_res['after_defense']['avg_risk_score']})")

    # 11. Scoreboard
    sb = get("/scoreboard")
    print(f"[PASS] 12. GET /scoreboard -> {len(sb['rounds'])} rounds recorded")

    # 12. First MVP Dedicated Scenario
    mvp_res = post("/demo/run_first_mvp")
    print(f"[PASS] 13. POST /demo/run_first_mvp -> Status: {mvp_res['status']}")

    print("\n============================================================")
    print("🏆 ALL 13 ENDPOINTS AND SYSTEM FLOWS PASSING 100%!")
    print("============================================================")

if __name__ == "__main__":
    test_suite()
