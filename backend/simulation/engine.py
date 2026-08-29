"""
AEGISX Real-time Simulation & Traffic Mixer Engine
Generates live unlabeled transaction streams, mixes background Red Team attacks,
evaluates in real-time via Blue Team, and broadcasts live telemetry over WebSockets.
"""

import asyncio
import random
import uuid
from datetime import datetime
from typing import Dict, List, Any, Optional, Set
from collections import deque

from backend.config import SimulationConfig, DEFAULT_CONTAMINATION_RATE
from backend.data.historical_store import historical_store
from backend.blue_team.pipeline import blue_team_pipeline
from backend.red_team.scenario_generator import red_team_generator
from backend.red_team.ledger import hidden_attack_ledger
from backend.evaluation.evaluator import evaluation_engine
from backend.evaluation.scoreboard import global_scoreboard
from backend.learning.adaptation import defense_adaptation_engine

class SimulationEngine:
    def __init__(self):
        self.config = SimulationConfig()
        self.total_transactions_count: int = 0
        self.processed_transactions: deque = deque()
        self.injected_attack_queue: deque = deque()
        self.connected_websockets: Set[Any] = set()
        self._loop_task: Optional[asyncio.Task] = None
        self.threat_count: int = 0
        self.blocked_count: int = 0
        self.total_blocked_inr: float = 0.0

    def get_status(self) -> Dict[str, Any]:
        return {
            "is_running": self.config.is_running,
            "tps": self.config.tps,
            "contamination_rate": self.config.contamination_rate,
            "difficulty": self.config.difficulty,
            "defense_version": defense_adaptation_engine.defense_version,
            "total_transactions": self.total_transactions_count,
            "threat_count": self.threat_count,
            "blocked_count": self.blocked_count,
            "total_blocked_inr": round(self.total_blocked_inr, 2),
            "active_weights": self.config.defense_weights,
            "block_threshold": self.config.block_threshold,
            "challenge_threshold": self.config.challenge_threshold
        }

    async def start(self):
        if not self.config.is_running:
            self.config.is_running = True
            if self._loop_task is None or self._loop_task.done():
                self._loop_task = asyncio.create_task(self._simulation_worker())

    async def pause(self):
        self.config.is_running = False

    async def reset(self):
        await self.pause()
        self.processed_transactions.clear()
        self.injected_attack_queue.clear()
        blue_team_pipeline.clear()
        hidden_attack_ledger.clear()
        global_scoreboard.reset()
        defense_adaptation_engine.reset()
        self.threat_count = 0
        self.blocked_count = 0
        self.total_blocked_inr = 0.0
        self.total_transactions_count = 0
        self.config = SimulationConfig()

    def update_config(self, new_config: Dict[str, Any]):
        if "tps" in new_config:
            self.config.tps = float(new_config["tps"])
        if "contamination_rate" in new_config:
            self.config.contamination_rate = float(new_config["contamination_rate"])
        if "difficulty" in new_config:
            self.config.difficulty = str(new_config["difficulty"])
        if "defense_weights" in new_config:
            self.config.defense_weights.update(new_config["defense_weights"])
        if "block_threshold" in new_config:
            self.config.block_threshold = float(new_config["block_threshold"])
        if "challenge_threshold" in new_config:
            self.config.challenge_threshold = float(new_config["challenge_threshold"])

    def launch_attack(
        self,
        attack_type: str = "ACCOUNT_TAKEOVER",
        target_customer: Optional[str] = None,
        difficulty: Optional[str] = None,
        intensity: str = "MEDIUM"
    ) -> Dict[str, Any]:
        """
        Synthesizes an attack and queues its transactions for immediate injection into the live stream.
        """
        diff = difficulty or self.config.difficulty
        attack = red_team_generator.generate_attack(
            attack_type=attack_type,
            target_customer_id=target_customer,
            difficulty=diff,
            intensity=intensity
        )
        for txn in attack["injected_transactions"]:
            self.injected_attack_queue.append(txn)

        return attack

    def _generate_normal_transaction(self) -> Dict[str, Any]:
        """
        Synthesizes a single benign transaction drawn from normal customer distribution.
        """
        # Pick random customer
        all_customers = list(historical_store.customers.values())
        cust = random.choice(all_customers)
        baseline = historical_store.get_baseline(cust["customer_id"])

        min_amt, max_amt = cust["spending_range"]
        avg_amt = cust["average_transaction_amount"]
        std_amt = (max_amt - min_amt) / 4.0
        amount = round(max(min_amt, min(max_amt, random.gauss(avg_amt, std_amt))), 2)

        # Merchant
        all_merchants = list(historical_store.merchants.values())
        merchant = random.choice(all_merchants)

        # Device & City
        device_id = random.choice(cust["trusted_devices"])
        city = random.choice(cust["common_locations"])
        pay_method = random.choice(cust["typical_payment_methods"])

        txn_id = f"TXN_{uuid.uuid4().hex[:8].upper()}"

        return {
            "transaction_id": txn_id,
            "customer_id": cust["customer_id"],
            "amount": amount,
            "currency": "INR",
            "merchant_id": merchant["merchant_id"],
            "merchant_category": merchant["category"],
            "merchant_name": merchant["merchant_name"],
            "timestamp": datetime.now().isoformat(),
            "city": city,
            "country": "India",
            "device_id": device_id,
            "payment_method": pay_method
        }

    async def _simulation_worker(self):
        """
        Continuous async loop generating and streaming transactions.
        """
        while self.config.is_running:
            try:
                # 1. Decide if we inject a queued attack, background auto-attack, or normal transaction
                if self.injected_attack_queue:
                    # Pull queued attack transaction
                    raw_txn = self.injected_attack_queue.popleft()
                elif random.random() < self.config.contamination_rate:
                    # Spontaneous background attack injection
                    atk_types = ["ACCOUNT_TAKEOVER", "CARD_TESTING", "FAKE_MERCHANT", "VELOCITY_ATTACK", "BEHAVIOR_MIMICRY"]
                    atk = self.launch_attack(
                        attack_type=random.choice(atk_types),
                        difficulty=self.config.difficulty
                    )
                    raw_txn = self.injected_attack_queue.popleft()
                else:
                    # Normal benign transaction
                    raw_txn = self._generate_normal_transaction()

                # 2. Blue Team Real-time Evaluation (Strictly Unlabeled!)
                assessment = blue_team_pipeline.analyze_unlabeled_transaction(raw_txn, self.config)
                
                # Update simulation statistics
                self.processed_transactions.append(assessment)
                self.total_transactions_count += 1
                if assessment["decision"] in ["BLOCK", "CHALLENGE"]:
                    self.threat_count += 1
                if assessment["decision"] == "BLOCK":
                    self.blocked_count += 1
                    self.total_blocked_inr += float(assessment["amount"])

                # 3. Broadcast to all active WebSocket listeners
                await self._broadcast_event({
                    "type": "TRANSACTION_EVALUATED",
                    "data": assessment,
                    "metrics": {
                        "threat_count": self.threat_count,
                        "blocked_count": self.blocked_count,
                        "total_blocked_inr": round(self.total_blocked_inr, 2),
                        "total_processed": self.total_transactions_count
                    }
                })

                # Sleep interval based on TPS
                delay = 1.0 / max(0.2, self.config.tps)
                await asyncio.sleep(delay)

            except Exception as e:
                print(f"[Simulation Worker Error]: {e}")
                await asyncio.sleep(1.0)

    async def _broadcast_event(self, message: Dict[str, Any]):
        disconnected = set()
        for ws in self.connected_websockets:
            try:
                await ws.send_json(message)
            except Exception:
                disconnected.add(ws)
        self.connected_websockets -= disconnected

# Global simulation engine
simulation_engine = SimulationEngine()
