"""
AEGISX Red Team Scenario Generator & Attack Library
Adaptive adversarial AI that selects targets, objectives, strategies, difficulty levels,
and synthesizes realistic multi-step attack transaction sequences.
Secretly records ground truth into the Hidden Attack Ledger.
"""

import uuid
import random
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional

from backend.data.historical_store import historical_store
from backend.red_team.ledger import hidden_attack_ledger

ATTACK_TYPES = [
    "ACCOUNT_TAKEOVER",
    "CARD_TESTING",
    "FAKE_MERCHANT",
    "VELOCITY_ATTACK",
    "SYNTHETIC_IDENTITY",
    "BEHAVIOR_MIMICRY",
    "FRAUD_RING",
    "SOCIAL_ENGINEERING",
    "VOICE_CLONE",
    "DEEPFAKE_KYC"
]

class RedTeamScenarioGenerator:
    def __init__(self):
        pass

    def generate_attack(
        self,
        attack_type: str = "ACCOUNT_TAKEOVER",
        target_customer_id: Optional[str] = None,
        difficulty: str = "MEDIUM",
        intensity: str = "MEDIUM"
    ) -> Dict[str, Any]:
        """
        Executes the Red Team decision pipeline:
        Target -> Objective -> Strategy -> Difficulty Adaptation -> Transaction Sequence -> Ledger Recording.
        """
        # 1. Target Selection
        if not target_customer_id or target_customer_id not in historical_store.customers:
            target_customer_id = "C001"  # Default demo target (Priya Sharma)

        customer = historical_store.get_customer(target_customer_id)
        baseline = historical_store.get_baseline(target_customer_id)
        
        attack_id = f"ATK_{uuid.uuid4().hex[:8].upper()}"
        now = datetime.now()

        # 2. Objective, Strategy & Sequence Generation
        injected_txns = []
        strategy_narrative = ""
        objective = ""

        if attack_type == "ACCOUNT_TAKEOVER":
            objective = "High-value unauthorized purchase via compromised credentials"
            strategy_narrative = (
                f"Red Team compromises customer {customer['synthetic_name']} credentials, introduces an unverified device, "
                f"and initiates high-ticket checkout during off-peak night hours."
            )
            
            # Difficulty adjustments
            if difficulty == "EASY":
                amount = 85000.0  # 30x baseline
                city = "Mumbai"
                device_id = "DEV_NEW_UNKNOWN_09"
                hour_override = 2  # 02:13 AM
                txn_count = 2
            elif difficulty == "MEDIUM":
                amount = 78000.0  # 27x baseline
                city = "Mumbai"
                device_id = "DEV_NEW_MUMBAI_88"
                hour_override = 2  # 02:13 AM
                txn_count = 2
            elif difficulty == "HARD":
                amount = round(baseline["max_amount"] * 1.8, 2)  # ~10,800
                city = customer["common_locations"][-1]
                device_id = f"DEV_UNVERIFIED_{random.randint(100,999)}"
                hour_override = 23
                txn_count = 1
            else: # ADVERSARIAL
                amount = round(baseline["p95_amount"] * 1.15, 2)  # Just above p95
                city = customer["home_city"]
                device_id = customer["trusted_devices"][0] + "_CLONE"
                hour_override = 21
                txn_count = 1

            for idx in range(txn_count):
                txn_time = now.replace(hour=hour_override, minute=13 + idx * 4, second=random.randint(10, 50))
                txn_id = f"TXN_ATO_{uuid.uuid4().hex[:6].upper()}"
                injected_txns.append({
                    "transaction_id": txn_id,
                    "customer_id": target_customer_id,
                    "amount": amount if idx == 0 else round(amount * 0.4, 2),
                    "currency": "INR",
                    "merchant_id": "M101",
                    "merchant_category": "Electronics",
                    "merchant_name": "TechKart Electronics",
                    "timestamp": txn_time.isoformat(),
                    "city": city,
                    "country": "India",
                    "device_id": device_id,
                    "payment_method": "CARD"
                })

        elif attack_type == "CARD_TESTING":
            objective = "Automated card validation via rapid micro-charges"
            strategy_narrative = (
                "Attacker uses bot automation to test stolen PAN numbers with sub-minute micro-transactions "
                "across diverse merchant gateways."
            )
            count = 6 if intensity == "HIGH" else 4
            micro_amounts = [1.0, 2.0, 1.5, 5.0, 3.0, 2.5, 4.0, 1.0]
            merchants = ["M104", "M105", "M110", "M111", "M112"]

            for i in range(count):
                txn_time = now + timedelta(seconds=i * 5)
                txn_id = f"TXN_TEST_{uuid.uuid4().hex[:6].upper()}"
                m_id = merchants[i % len(merchants)]
                m_obj = historical_store.get_merchant(m_id)
                injected_txns.append({
                    "transaction_id": txn_id,
                    "customer_id": target_customer_id,
                    "amount": micro_amounts[i % len(micro_amounts)],
                    "currency": "INR",
                    "merchant_id": m_id,
                    "merchant_category": m_obj["category"] if m_obj else "Dining",
                    "merchant_name": m_obj["merchant_name"] if m_obj else "Gateway Test",
                    "timestamp": txn_time.isoformat(),
                    "city": customer["home_city"],
                    "country": "India",
                    "device_id": f"DEV_BOT_RUNNER_{i%2}",
                    "payment_method": "CARD"
                })

        elif attack_type == "FAKE_MERCHANT":
            objective = "Merchant collusion / shell entity fund extraction"
            strategy_narrative = (
                "Attacker routes high-ticket transaction to a newly provisioned shell merchant entity with zero trust."
            )
            fake_merchant_id = "M_FAKE_SHELL_999"
            txn_id = f"TXN_FM_{uuid.uuid4().hex[:6].upper()}"
            injected_txns.append({
                "transaction_id": txn_id,
                "customer_id": target_customer_id,
                "amount": 54000.0,
                "currency": "INR",
                "merchant_id": fake_merchant_id,
                "merchant_category": "Jewelry",
                "merchant_name": "Apex Luxury Gold Shell",
                "timestamp": now.isoformat(),
                "city": "Kolkata",
                "country": "India",
                "device_id": customer["trusted_devices"][0],
                "payment_method": "NET_BANKING"
            })

        elif attack_type == "VELOCITY_ATTACK":
            objective = "Rapid balance draining before cardholder alerts trigger"
            strategy_narrative = (
                "Attacker unleashes burst of 5 transactions within 30 seconds at different merchants."
            )
            for i in range(5):
                txn_time = now + timedelta(seconds=i * 6)
                txn_id = f"TXN_VEL_{uuid.uuid4().hex[:6].upper()}"
                m_id = f"M{102 + i}"
                m_obj = historical_store.get_merchant(m_id)
                injected_txns.append({
                    "transaction_id": txn_id,
                    "customer_id": target_customer_id,
                    "amount": round(baseline["average_transaction_amount"] * 1.8, 2),
                    "currency": "INR",
                    "merchant_id": m_id,
                    "merchant_category": m_obj["category"] if m_obj else "General",
                    "merchant_name": m_obj["merchant_name"] if m_obj else "Online Retail",
                    "timestamp": txn_time.isoformat(),
                    "city": customer["home_city"],
                    "country": "India",
                    "device_id": customer["trusted_devices"][0],
                    "payment_method": "UPI"
                })

        elif attack_type == "FRAUD_RING":
            objective = "Coordinated multi-account exploitation via shared hardware cluster"
            strategy_narrative = (
                "Fraud syndicate uses a single pooled emulator device across 3 distinct customer accounts."
            )
            shared_dev = "DEV_RING_SHARED_SYNDICATE_X"
            ring_customers = [target_customer_id, "C003", "C005"]
            for idx, c_id in enumerate(ring_customers):
                c_obj = historical_store.get_customer(c_id) or customer
                txn_time = now + timedelta(seconds=idx * 15)
                txn_id = f"TXN_RING_{uuid.uuid4().hex[:6].upper()}"
                injected_txns.append({
                    "transaction_id": txn_id,
                    "customer_id": c_id,
                    "amount": 32000.0,
                    "currency": "INR",
                    "merchant_id": "M106",
                    "merchant_category": "Electronics",
                    "merchant_name": "Croma Digital Store",
                    "timestamp": txn_time.isoformat(),
                    "city": "Bengaluru",
                    "country": "India",
                    "device_id": shared_dev,
                    "payment_method": "CARD"
                })

        elif attack_type == "BEHAVIOR_MIMICRY":
            objective = "Adversarial evasion through precise statistical boundary mimicry"
            strategy_narrative = (
                "Red Team crafts an exploit specifically calculated to sit at the 94th percentile of normal spending."
            )
            stealth_amt = round(baseline["p95_amount"] * 0.98, 2)
            txn_id = f"TXN_MIMIC_{uuid.uuid4().hex[:6].upper()}"
            injected_txns.append({
                "transaction_id": txn_id,
                "customer_id": target_customer_id,
                "amount": stealth_amt,
                "currency": "INR",
                "merchant_id": "M103",
                "merchant_category": "Fashion",
                "merchant_name": "UrbanStitch Fashion",
                "timestamp": now.isoformat(),
                "city": customer["home_city"],
                "country": "India",
                "device_id": customer["trusted_devices"][0],
                "payment_method": "CARD"
            })

        else:
            # Synthetic Identity, Social Engineering, Voice Clone, Deepfake KYC (Safe simulations)
            objective = f"Advanced GenAI attack simulation: {attack_type}"
            strategy_narrative = (
                f"Synthetic simulation of {attack_type} vector pushing unauthorized funds through anomalous endpoints."
            )
            txn_id = f"TXN_ADV_{uuid.uuid4().hex[:6].upper()}"
            injected_txns.append({
                "transaction_id": txn_id,
                "customer_id": target_customer_id,
                "amount": 62000.0,
                "currency": "INR",
                "merchant_id": "M114",
                "merchant_category": "Jewelry",
                "merchant_name": "Tanishq Jewellers",
                "timestamp": now.isoformat(),
                "city": "Hyderabad",
                "country": "India",
                "device_id": f"DEV_SPOOF_{uuid.uuid4().hex[:4].upper()}",
                "payment_method": "NET_BANKING"
            })

        # 3. Secretly Record into Isolated Hidden Attack Ledger (World 3)
        injected_txn_ids = [t["transaction_id"] for t in injected_txns]
        hidden_attack_ledger.record_attack(
            attack_id=attack_id,
            attack_type=attack_type,
            difficulty=difficulty,
            target_customer=target_customer_id,
            objective=objective,
            strategy_narrative=strategy_narrative,
            injected_transaction_ids=injected_txn_ids,
            parameters={
                "intensity": intensity,
                "txns_count": len(injected_txns),
                "transactions": [dict(t) for t in injected_txns]
            }
        )

        return {
            "attack_id": attack_id,
            "attack_type": attack_type,
            "target_customer": target_customer_id,
            "target_name": customer["synthetic_name"],
            "difficulty": difficulty,
            "objective": objective,
            "strategy_narrative": strategy_narrative,
            "injected_transactions": injected_txns,
            "injected_count": len(injected_txns)
        }

# Global scenario generator
red_team_generator = RedTeamScenarioGenerator()
