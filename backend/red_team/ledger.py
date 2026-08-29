"""
AEGISX Hidden Attack Ledger (World 3)
Strictly isolated store holding ground truth fraud labels and Red Team attack telemetry.
MUST NEVER be accessed by Blue Team during real-time inference.
"""

from typing import Dict, List, Any, Optional
from datetime import datetime

class HiddenAttackLedger:
    def __init__(self):
        # Maps attack_id -> attack record
        self._attacks: Dict[str, Dict[str, Any]] = {}
        # Maps transaction_id -> attack_id (ground truth mapping)
        self._injected_txns: Dict[str, str] = {}

    def record_attack(
        self,
        attack_id: str,
        attack_type: str,
        difficulty: str,
        target_customer: str,
        objective: str,
        strategy_narrative: str,
        injected_transaction_ids: List[str],
        parameters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Secretly logs an attack campaign into the hidden ledger.
        """
        record = {
            "attack_id": attack_id,
            "attack_type": attack_type,
            "difficulty": difficulty,
            "target_customer": target_customer,
            "objective": objective,
            "strategy_narrative": strategy_narrative,
            "injected_transaction_ids": injected_transaction_ids,
            "injected_count": len(injected_transaction_ids),
            "ground_truth": "FRAUD",
            "timestamp": datetime.now().isoformat(),
            "parameters": parameters or {},
            "status": "ACTIVE"
        }
        self._attacks[attack_id] = record
        
        for txn_id in injected_transaction_ids:
            self._injected_txns[txn_id] = attack_id
            
        return record

    def is_transaction_injected_fraud(self, transaction_id: str) -> bool:
        """
        Internal ground-truth query ONLY for Evaluation Engine.
        """
        return transaction_id in self._injected_txns

    def get_attack_for_transaction(self, transaction_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves parent attack record for evaluation/replay.
        """
        attack_id = self._injected_txns.get(transaction_id)
        if attack_id:
            return self._attacks.get(attack_id)
        return None

    def get_all_attacks(self) -> List[Dict[str, Any]]:
        return list(self._attacks.values())

    def get_attack_by_id(self, attack_id: str) -> Optional[Dict[str, Any]]:
        return self._attacks.get(attack_id)

    def clear(self):
        self._attacks.clear()
        self._injected_txns.clear()

# Singleton hidden attack ledger
hidden_attack_ledger = HiddenAttackLedger()
