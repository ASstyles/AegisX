"""
AEGISX Continuous Learning & Adaptive Defense Calibration
Analyzes missed attacks, diagnoses detection blind spots, and re-calibrates layer weights/thresholds.
"""

from typing import Dict, List, Any
from backend.config import SimulationConfig, DEFAULT_DEFENSE_WEIGHTS

class DefenseAdaptationEngine:
    def __init__(self):
        self.defense_version = "v1.0.0 (Standard)"
        self.current_weights = DEFAULT_DEFENSE_WEIGHTS.copy()
        self.block_threshold = 80.0
        self.challenge_threshold = 60.0
        self.adaptation_history: List[Dict[str, Any]] = []

    def adapt_defense(
        self,
        missed_attacks: List[Dict[str, Any]],
        simulation_config: SimulationConfig
    ) -> Dict[str, Any]:
        """
        Calculates adaptive parameter adjustments based on missed attack features.
        """
        adjustments_made = []
        
        # If no missed attacks, provide general hardening
        if not missed_attacks:
            self.block_threshold = max(70.0, self.block_threshold - 2.0)
            adjustments_made.append("General hardening: tightened Block Threshold by -2.0")
        else:
            for atk in missed_attacks:
                layer_scores = atk.get("layer_scores", {})
                atk_type = atk.get("attack_type", "")
                
                # Check which layer had signal but was under-weighted
                if layer_scores.get("behavioral", 0) > 40.0:
                    self.current_weights["behavioral"] = min(40.0, self.current_weights.get("behavioral", 25.0) + 5.0)
                    adjustments_made.append("Boosted Behavioral Deviation weight (+5.0)")
                    
                if layer_scores.get("device", 0) > 50.0 or "TAKEOVER" in atk_type:
                    self.current_weights["device"] = min(35.0, self.current_weights.get("device", 20.0) + 6.0)
                    adjustments_made.append("Boosted Device Intelligence weight (+6.0)")

                if layer_scores.get("velocity", 0) > 40.0 or "CARD" in atk_type or "VELOCITY" in atk_type:
                    self.current_weights["velocity"] = min(30.0, self.current_weights.get("velocity", 15.0) + 5.0)
                    adjustments_made.append("Elevated Velocity & Burst sensitivity (+5.0)")

                if layer_scores.get("location", 0) > 40.0:
                    self.current_weights["location"] = min(30.0, self.current_weights.get("location", 20.0) + 4.0)
                    adjustments_made.append("Enhanced Location Intelligence weight (+4.0)")

            # Lower block threshold for higher sensitivity
            self.block_threshold = max(68.0, self.block_threshold - 4.0)
            adjustments_made.append(f"Adjusted Block Decision Threshold to {self.block_threshold:.1f}")

        # Update version
        ver_num = len(self.adaptation_history) + 1
        self.defense_version = f"v1.{ver_num}.0 (Adaptive-Tuned)"
        
        # Apply to simulation config
        simulation_config.defense_weights = self.current_weights.copy()
        simulation_config.block_threshold = self.block_threshold
        simulation_config.challenge_threshold = self.challenge_threshold

        adaptation_record = {
            "version": self.defense_version,
            "missed_attacks_analyzed": len(missed_attacks),
            "updated_weights": self.current_weights.copy(),
            "updated_block_threshold": self.block_threshold,
            "updated_challenge_threshold": self.challenge_threshold,
            "adjustments": adjustments_made
        }
        self.adaptation_history.append(adaptation_record)

        return adaptation_record

    def reset(self):
        self.defense_version = "v1.0.0 (Standard)"
        self.current_weights = DEFAULT_DEFENSE_WEIGHTS.copy()
        self.block_threshold = 80.0
        self.challenge_threshold = 60.0
        self.adaptation_history.clear()

# Global adaptation engine
defense_adaptation_engine = DefenseAdaptationEngine()
