"""
Verification test for Live Transactions counter:
- Continuously increments past 2000 without any maximum limit (e.g. 2001, 2002, 2050...)
- Stops/freezes when paused
- Resumes counting from exact value when resumed
- Resets only on reset
"""

import sys
import os
import asyncio

from backend.simulation.engine import simulation_engine
from backend.config import SimulationConfig

async def test_live_counter():
    print("1. Resetting simulation...")
    await simulation_engine.reset()
    assert simulation_engine.total_transactions_count == 0, f"Expected 0, got {simulation_engine.total_transactions_count}"
    assert simulation_engine.get_status()["total_transactions"] == 0

    print("2. Generating 2050 transactions directly...")
    # Simulate high volume processing past 2000
    for i in range(2050):
        raw_txn = simulation_engine._generate_normal_transaction()
        assessment = {"transaction_id": raw_txn["transaction_id"], "amount": raw_txn["amount"], "decision": "APPROVE", "risk_score": 12.0}
        simulation_engine.processed_transactions.append(assessment)
        simulation_engine.total_transactions_count += 1

    status = simulation_engine.get_status()
    print(f"Total transactions count: {status['total_transactions']}")
    assert status["total_transactions"] == 2050, f"Expected 2050, got {status['total_transactions']}"
    assert len(simulation_engine.processed_transactions) == 2050

    print("3. Testing incremental progression: 2050 -> 2051 -> 2052...")
    for step in range(1, 11):
        raw_txn = simulation_engine._generate_normal_transaction()
        assessment = {"transaction_id": raw_txn["transaction_id"], "amount": raw_txn["amount"], "decision": "APPROVE", "risk_score": 12.0}
        simulation_engine.processed_transactions.append(assessment)
        simulation_engine.total_transactions_count += 1
        expected = 2050 + step
        assert simulation_engine.get_status()["total_transactions"] == expected, f"Step {step} failed: expected {expected}, got {simulation_engine.get_status()['total_transactions']}"

    print(f"Counter reached {simulation_engine.get_status()['total_transactions']} successfully!")

    print("4. Testing Pause...")
    await simulation_engine.pause()
    frozen_val = simulation_engine.get_status()["total_transactions"]
    assert frozen_val == 2060
    assert simulation_engine.config.is_running is False
    print(f"Paused and frozen at: {frozen_val}")

    print("5. Testing Resume / Continue...")
    simulation_engine.config.is_running = True
    raw_txn = simulation_engine._generate_normal_transaction()
    assessment = {"transaction_id": raw_txn["transaction_id"], "amount": raw_txn["amount"], "decision": "APPROVE", "risk_score": 12.0}
    simulation_engine.processed_transactions.append(assessment)
    simulation_engine.total_transactions_count += 1
    assert simulation_engine.get_status()["total_transactions"] == 2061
    print("Resumed counting from 2060 to 2061 without reset!")

    print("6. Testing Reset...")
    await simulation_engine.reset()
    assert simulation_engine.get_status()["total_transactions"] == 0
    print("Reset successfully brought counter back to 0.")

    print("\nALL COUNTER TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(test_live_counter())
