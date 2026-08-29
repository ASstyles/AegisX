"""
AEGISX FastAPI Backend Server
Provides REST endpoints and WebSockets for real-time payment fraud simulation,
Red Team attack injection, Blue Team detection, Explainable AI diagnostics,
hidden ground-truth evaluation, and AI vs AI scoreboard.
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import uvicorn

from backend.config import SimulationConfig
from backend.simulation.engine import simulation_engine
from backend.data.historical_store import historical_store
from backend.blue_team.pipeline import blue_team_pipeline
from backend.blue_team.layers.graph import global_fraud_graph
from backend.red_team.scenario_generator import red_team_generator, ATTACK_TYPES
from backend.red_team.ledger import hidden_attack_ledger
from backend.evaluation.evaluator import evaluation_engine
from backend.evaluation.scoreboard import global_scoreboard
from backend.learning.adaptation import defense_adaptation_engine
from backend.learning.replayer import global_attack_replayer

app = FastAPI(
    title="AEGISX: AI vs. AI Payment Fraud Defense Lab",
    description="Simulate Tomorrow's Payment Fraud. Defend Today. Mastercard Innovation Challenge @ GFF 2026",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Models
class LaunchAttackRequest(BaseModel):
    attack_type: str = "ACCOUNT_TAKEOVER"
    target_customer: Optional[str] = "C001"
    difficulty: Optional[str] = "MEDIUM"
    intensity: Optional[str] = "MEDIUM"

class ConfigUpdateRequest(BaseModel):
    tps: Optional[float] = None
    contamination_rate: Optional[float] = None
    difficulty: Optional[str] = None
    defense_weights: Optional[Dict[str, float]] = None
    block_threshold: Optional[float] = None
    challenge_threshold: Optional[float] = None

class ReplayRequest(BaseModel):
    attack_id: Optional[str] = None
    attack_type: Optional[str] = "ACCOUNT_TAKEOVER"
    target_customer: Optional[str] = "C001"

@app.get("/")
def root():
    return {
        "name": "AEGISX - AI vs. AI Payment Fraud Defense Lab",
        "tagline": "Simulate Tomorrow's Payment Fraud. Defend Today.",
        "status": "ONLINE",
        "defense_version": defense_adaptation_engine.defense_version
    }

# 1. Simulation Controls
@app.get("/status")
async def get_status():
    return simulation_engine.get_status()

@app.post("/simulation/start")
async def start_simulation():
    await simulation_engine.start()
    return {"message": "Simulation started", "status": simulation_engine.get_status()}

@app.post("/simulation/pause")
async def pause_simulation():
    await simulation_engine.pause()
    return {"message": "Simulation paused", "status": simulation_engine.get_status()}

@app.post("/simulation/reset")
async def reset_simulation():
    await simulation_engine.reset()
    return {"message": "Simulation reset to pristine state", "status": simulation_engine.get_status()}

@app.post("/simulation/config")
async def update_config(req: ConfigUpdateRequest):
    simulation_engine.update_config(req.model_dump(exclude_none=True))
    return {"message": "Configuration updated", "config": simulation_engine.get_status()}

# 2. Red Team Attack Lab
@app.get("/attack/types")
async def get_attack_types():
    return {"attack_types": ATTACK_TYPES}

@app.post("/attack/launch")
async def launch_attack(req: LaunchAttackRequest):
    attack = simulation_engine.launch_attack(
        attack_type=req.attack_type,
        target_customer=req.target_customer,
        difficulty=req.difficulty,
        intensity=req.intensity
    )
    return {
        "message": f"Attack '{req.attack_type}' successfully launched and queued for injection",
        "attack_metadata": {
            "attack_id": attack["attack_id"],
            "attack_type": attack["attack_type"],
            "target_customer": attack["target_customer"],
            "target_name": attack["target_name"],
            "difficulty": attack["difficulty"],
            "objective": attack["objective"],
            "strategy_narrative": attack["strategy_narrative"],
            "injected_count": attack["injected_count"]
        }
    }

# 3. Live Stream & Transactions
@app.get("/transactions/live")
def get_live_transactions(limit: int = 50):
    txns = list(simulation_engine.processed_transactions)
    return {
        "total": simulation_engine.total_transactions_count,
        "transactions": txns[-limit:]
    }

# 4. Customer Baselines (World 1)
@app.get("/customers")
def get_customers(limit: int = 20):
    custs = list(historical_store.customers.values())[:limit]
    return {"total": len(historical_store.customers), "customers": custs}

@app.get("/customer/{customer_id}/baseline")
def get_customer_baseline(customer_id: str):
    baseline = historical_store.get_baseline(customer_id)
    if not baseline:
        raise HTTPException(status_code=404, detail="Customer not found")
    cust = historical_store.get_customer(customer_id)
    return {"customer": cust, "baseline": baseline}

# 5. AI Investigator
@app.get("/investigate/{transaction_id}")
def investigate_transaction(transaction_id: str):
    txns = list(simulation_engine.processed_transactions)
    target_txn = next((t for t in txns if t.get("transaction_id") == transaction_id), None)
    
    if not target_txn:
        # Fallback search or generate on the fly
        raise HTTPException(status_code=404, detail=f"Transaction {transaction_id} not found in recent stream")

    return {
        "transaction": target_txn,
        "customer_baseline": target_txn.get("customer_baseline"),
        "risk_attribution": target_txn.get("risk_attribution"),
        "layer_scores": target_txn.get("layer_scores"),
        "layer_details": target_txn.get("layer_details"),
        "xai": target_txn.get("xai")
    }

# 6. Fraud Entity Network Graph
@app.get("/network/graph")
def get_network_graph():
    return global_fraud_graph.get_subgraph_for_visualization(max_nodes=50)

# 7. Evaluation Engine (World 3 Hidden Truth Reveal)
@app.post("/simulation/evaluate")
def evaluate_simulation():
    processed = list(simulation_engine.processed_transactions)
    preds = blue_team_pipeline.predictions_store
    eval_result = evaluation_engine.evaluate_simulation(preds, processed)
    return eval_result

# 8. AI vs AI Scoreboard
@app.get("/scoreboard")
def get_scoreboard():
    return global_scoreboard.get_scoreboard()

# 9. Continuous Learning & Defense Adaptation
@app.post("/model/adapt")
def adapt_defense():
    processed = list(simulation_engine.processed_transactions)
    preds = blue_team_pipeline.predictions_store
    eval_result = evaluation_engine.evaluate_simulation(preds, processed)
    
    adaptation = defense_adaptation_engine.adapt_defense(
        missed_attacks=eval_result.get("missed_attacks", []),
        simulation_config=simulation_engine.config
    )
    
    # Record to scoreboard as a new round
    round_record = global_scoreboard.record_round_results(
        eval_result=eval_result,
        defense_version=adaptation["version"]
    )
    
    return {
        "message": f"Defense adapted and upgraded to {adaptation['version']}",
        "adaptation": adaptation,
        "new_round": round_record
    }

# 10. Attack Replay Simulator
@app.post("/attack/replay")
def replay_attack(req: ReplayRequest):
    replay_data = global_attack_replayer.replay_attack(
        attack_id=req.attack_id,
        adapted_weights=simulation_engine.config.defense_weights,
        adapted_block_thresh=simulation_engine.config.block_threshold
    )
    return replay_data

# 11. Deterministic First MVP Scenario Runner (Priya Sharma ATO)
@app.post("/demo/run_first_mvp")
def run_first_mvp():
    """
    Executes the exact FIRST MVP scenario end-to-end:
    Priya Sharma baseline -> ATO attack injection -> Layered Blue Team -> BLOCK decision -> Ground truth reveal -> Replay -> Scoreboard.
    """
    # 1. Fetch Priya baseline
    priya_baseline = historical_store.get_baseline("C001")
    
    # 2. Red Team launches Account Takeover
    attack = red_team_generator.generate_attack(
        attack_type="ACCOUNT_TAKEOVER",
        target_customer_id="C001",
        difficulty="MEDIUM"
    )
    injected_txn = attack["injected_transactions"][0]

    # 3. Blue Team analyzes strictly UNLABELED transaction
    assessment = blue_team_pipeline.analyze_unlabeled_transaction(injected_txn, simulation_engine.config)
    simulation_engine.processed_transactions.append(assessment)
    simulation_engine.total_transactions_count += 1
    if assessment["decision"] == "BLOCK":
        simulation_engine.blocked_count += 1
        simulation_engine.total_blocked_inr += assessment["amount"]
    simulation_engine.threat_count += 1

    # 4. Hidden Ground Truth Evaluation
    eval_result = evaluation_engine.evaluate_simulation(
        blue_team_pipeline.predictions_store,
        [assessment]
    )

    # 5. Attack Replay
    replay_result = global_attack_replayer.replay_attack(
        attack_id=attack["attack_id"],
        custom_transactions=[injected_txn],
        adapted_weights=simulation_engine.config.defense_weights
    )

    return {
        "status": "FIRST_MVP_COMPLETE",
        "customer": historical_store.get_customer("C001"),
        "customer_baseline": priya_baseline,
        "red_team_attack": {
            "attack_id": attack["attack_id"],
            "attack_type": attack["attack_type"],
            "difficulty": attack["difficulty"],
            "objective": attack["objective"],
            "strategy": attack["strategy_narrative"]
        },
        "observable_transaction": {
            "transaction_id": injected_txn["transaction_id"],
            "customer_id": injected_txn["customer_id"],
            "amount": injected_txn["amount"],
            "city": injected_txn["city"],
            "device_id": injected_txn["device_id"],
            "timestamp": injected_txn["timestamp"]
        },
        "blue_team_detection": {
            "risk_score": assessment["risk_score"],
            "decision": assessment["decision"],
            "risk_attribution": assessment["risk_attribution"],
            "layer_scores": assessment["layer_scores"],
            "xai_explanation": assessment["xai"]
        },
        "hidden_ground_truth": {
            "is_injected_fraud": hidden_attack_ledger.is_transaction_injected_fraud(injected_txn["transaction_id"]),
            "attack_id": attack["attack_id"]
        },
        "evaluation_metrics": eval_result["metrics"],
        "replay_comparison": replay_result,
        "scoreboard": global_scoreboard.get_scoreboard()
    }

# 12. WebSocket Stream
@app.websocket("/ws/stream")
async def websocket_stream_endpoint(websocket: WebSocket):
    await websocket.accept()
    simulation_engine.connected_websockets.add(websocket)
    try:
        # Send initial status
        await websocket.send_json({
            "type": "INITIAL_STATE",
            "status": simulation_engine.get_status()
        })
        while True:
            # Keep alive and listen for client messages if any
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        simulation_engine.connected_websockets.remove(websocket)
    except Exception:
        if websocket in simulation_engine.connected_websockets:
            simulation_engine.connected_websockets.remove(websocket)

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
