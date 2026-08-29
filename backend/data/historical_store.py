"""
AEGISX Historical Baseline Store (World 1)
Generates and caches 60 days of normal historical customer transactions.
Builds statistical baselines for Blue Team behavioral deviation detection.
"""

import math
import random
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Any, Optional
import numpy as np

from backend.data.generator import generate_synthetic_ecosystem, CITY_COORDINATES

class HistoricalStore:
    def __init__(self, seed: int = 2026, num_customers: int = 120):
        self.seed = seed
        self.ecosystem = generate_synthetic_ecosystem(num_customers=num_customers, seed=seed)
        self.customers = self.ecosystem["customers"]
        self.merchants = self.ecosystem["merchants"]
        self.devices = self.ecosystem["devices"]
        self.cities = self.ecosystem["cities"]
        
        self.historical_transactions: List[Dict[str, Any]] = []
        self.customer_baselines: Dict[str, Dict[str, Any]] = {}
        
        self._generate_historical_transactions()
        self._compute_all_baselines()

    def _generate_historical_transactions(self):
        """
        Generates 60 days of normal, consistent historical transactions for all customers.
        """
        random.seed(self.seed + 101)
        base_time = datetime.now(timezone.utc) - timedelta(days=60)
        
        merchants_by_cat: Dict[str, List[Dict[str, Any]]] = {}
        for m in self.merchants.values():
            merchants_by_cat.setdefault(m["category"], []).append(m)
        
        all_merchants = list(self.merchants.values())

        for c_id, cust in self.customers.items():
            txns_per_week = cust["transaction_frequency"]
            total_txns = int(txns_per_week * 8.5)  # ~60 days worth
            
            min_amt, max_amt = cust["spending_range"]
            avg_amt = cust["average_transaction_amount"]
            std_amt = (max_amt - min_amt) / 4.0
            
            trusted_devs = cust["trusted_devices"]
            cities = cust["common_locations"]
            start_hour, end_hour = cust["normal_transaction_hours"]
            categories = cust["preferred_merchant_categories"]
            pay_methods = cust["typical_payment_methods"]

            for t_idx in range(total_txns):
                # Spread out timestamps across 60 days
                day_offset = random.uniform(0, 59)
                hour = random.randint(start_hour, end_hour)
                minute = random.randint(0, 59)
                second = random.randint(0, 59)
                txn_time = base_time + timedelta(days=day_offset, hours=hour, minutes=minute, seconds=second)

                # Amount: log-normal or bounded normal around average
                raw_amt = random.gauss(avg_amt, std_amt)
                amount = round(max(min_amt, min(max_amt, raw_amt)), 2)

                # Category & Merchant
                cat = random.choice(categories) if categories else "General"
                avail_merchants = merchants_by_cat.get(cat, all_merchants)
                merchant = random.choice(avail_merchants)

                # Device & Location
                device_id = random.choice(trusted_devs)
                city = random.choice(cities)
                payment_method = random.choice(pay_methods)

                self.historical_transactions.append({
                    "transaction_id": f"HIST_{c_id}_{t_idx+1:04d}",
                    "customer_id": c_id,
                    "amount": amount,
                    "currency": "INR",
                    "merchant_id": merchant["merchant_id"],
                    "merchant_category": merchant["category"],
                    "merchant_name": merchant["merchant_name"],
                    "timestamp": txn_time.isoformat(),
                    "city": city,
                    "country": "India",
                    "device_id": device_id,
                    "payment_method": payment_method,
                    "is_fraud": False  # Historical is by definition benign baseline
                })

    def _compute_all_baselines(self):
        """
        Extracts statistical parameters, distributions, and normal bounds for each customer.
        """
        txns_by_cust: Dict[str, List[Dict[str, Any]]] = {}
        for txn in self.historical_transactions:
            txns_by_cust.setdefault(txn["customer_id"], []).append(txn)

        for c_id, cust in self.customers.items():
            txns = txns_by_cust.get(c_id, [])
            amounts = [t["amount"] for t in txns] if txns else [cust["average_transaction_amount"]]
            
            amounts_arr = np.array(amounts)
            mean_amt = float(np.mean(amounts_arr))
            std_amt = float(np.std(amounts_arr)) if len(amounts_arr) > 1 else (mean_amt * 0.25)
            if std_amt < 1.0:
                std_amt = max(10.0, mean_amt * 0.2)
                
            median_amt = float(np.median(amounts_arr))
            p95_amt = float(np.percentile(amounts_arr, 95))
            min_amt = float(np.min(amounts_arr))
            max_amt = float(np.max(amounts_arr))
            
            # Extract distinct entities
            used_devices = set(t["device_id"] for t in txns) | set(cust["trusted_devices"])
            used_cities = set(t["city"] for t in txns) | set(cust["common_locations"])
            used_merchants = set(t["merchant_id"] for t in txns)
            used_categories = set(t["merchant_category"] for t in txns)
            
            self.customer_baselines[c_id] = {
                "customer_id": c_id,
                "synthetic_name": cust["synthetic_name"],
                "total_historical_txns": len(txns),
                "mean_amount": mean_amt,
                "std_amount": std_amt,
                "median_amount": median_amt,
                "min_amount": min_amt,
                "max_amount": max_amt,
                "p95_amount": p95_amt,
                "spending_range": cust["spending_range"],
                "normal_hours": cust["normal_transaction_hours"],
                "trusted_devices": list(used_devices),
                "common_cities": list(used_cities),
                "home_city": cust["home_city"],
                "preferred_categories": list(used_categories),
                "trusted_merchants": list(used_merchants),
                "typical_payment_methods": cust["typical_payment_methods"],
                "weekly_frequency": cust["transaction_frequency"]
            }

    def get_customer(self, customer_id: str) -> Optional[Dict[str, Any]]:
        return self.customers.get(customer_id)

    def get_baseline(self, customer_id: str) -> Optional[Dict[str, Any]]:
        return self.customer_baselines.get(customer_id)

    def get_merchant(self, merchant_id: str) -> Optional[Dict[str, Any]]:
        return self.merchants.get(merchant_id)

    def get_device(self, device_id: str) -> Optional[Dict[str, Any]]:
        return self.devices.get(device_id)

    def get_city_coords(self, city: str) -> Optional[Dict[str, float]]:
        return self.cities.get(city)

# Singleton global instance
historical_store = HistoricalStore()
