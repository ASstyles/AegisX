"""
AEGISX: AI vs. AI Payment Fraud Defense Lab
Configuration Settings
"""

from pydantic import BaseModel
from typing import List, Dict

DEMO_SEED = 2026

# Decision thresholds (0 - 100)
RISK_THRESHOLDS = {
    "APPROVE": (0, 30),
    "MONITOR": (31, 60),
    "CHALLENGE": (61, 80),
    "BLOCK": (81, 100)
}

# Configurable Contamination Rates
CONTAMINATION_RATES = [0.005, 0.01, 0.02, 0.05]  # 0.5%, 1%, 2%, 5%
DEFAULT_CONTAMINATION_RATE = 0.02

# Difficulty levels
DIFFICULTY_LEVELS = ["EASY", "MEDIUM", "HARD", "ADVERSARIAL"]

# Defense Layer Default Weights (Sum to ~100 for composite attribution)
DEFAULT_DEFENSE_WEIGHTS = {
    "behavioral": 25.0,     # Layer 1: Amount & Time & Category deviation
    "device": 20.0,         # Layer 2: New/mismatched device fingerprint
    "location": 20.0,       # Layer 3: Geographic anomaly & impossible travel
    "velocity": 15.0,       # Layer 4: Burst & sliding window frequency
    "merchant": 10.0,       # Layer 5: Merchant reputation & dormant spike
    "graph": 15.0,          # Layer 6: Entity graph & shared device ring
    "anomaly": 15.0         # Layer 7: Unsupervised Isolation Forest score
}

class SimulationConfig(BaseModel):
    tps: float = 2.0  # Transactions per second
    contamination_rate: float = 0.02
    difficulty: str = "MEDIUM"
    is_running: bool = False
    demo_mode: bool = False
    seed: int = DEMO_SEED
    defense_weights: Dict[str, float] = DEFAULT_DEFENSE_WEIGHTS.copy()
    challenge_threshold: float = 60.0
    block_threshold: float = 80.0
