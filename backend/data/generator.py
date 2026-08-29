"""
AEGISX Synthetic Entity Generator
Generates realistic, completely artificial customers, merchants, devices, and locations.
Strictly synthetic - no real PII or financial credentials.
"""

import random
from typing import List, Dict, Any
from pydantic import BaseModel

# Geographic coordinates for Indian and international cities for distance calculation
CITY_COORDINATES = {
    "Pune": {"lat": 18.5204, "lon": 73.8567},
    "Mumbai": {"lat": 19.0760, "lon": 72.8777},
    "Delhi": {"lat": 28.7041, "lon": 77.1025},
    "Bengaluru": {"lat": 12.9716, "lon": 77.5946},
    "Hyderabad": {"lat": 17.3850, "lon": 78.4867},
    "Chennai": {"lat": 13.0827, "lon": 80.2707},
    "Kolkata": {"lat": 22.5726, "lon": 88.3639},
    "Ahmedabad": {"lat": 23.0225, "lon": 72.5714},
    "Jaipur": {"lat": 26.9124, "lon": 75.7873},
    "Goa": {"lat": 15.2993, "lon": 74.1240},
    "Dubai": {"lat": 25.2048, "lon": 55.2708},
    "Singapore": {"lat": 1.3521, "lon": 103.8198},
    "London": {"lat": 51.5074, "lon": -0.1278},
    "New York": {"lat": 40.7128, "lon": -74.0060},
    "Moscow": {"lat": 55.7558, "lon": 37.6173}
}

FIRST_NAMES = [
    "Priya", "Rahul", "Ananya", "Vikram", "Sneha", "Aditya", "Pooja", "Rohan",
    "Neha", "Amit", "Kavita", "Sanjay", "Deepika", "Arjun", "Ritu", "Karan",
    "Sunita", "Rajesh", "Meera", "Varun", "Tanvi", "Gaurav", "Simran", "Nikhil"
]

LAST_NAMES = [
    "Sharma", "Verma", "Iyer", "Malhotra", "Patel", "Reddy", "Gupta", "Nair",
    "Deshmukh", "Singh", "Joshi", "Chopra", "Kulkarni", "Bose", "Mehta", "Rao"
]

MERCHANT_TEMPLATES = [
    {"name": "TechKart Electronics", "category": "Electronics", "avg_amount": 15000, "trust": 92},
    {"name": "FreshMart Groceries", "category": "Grocery", "avg_amount": 1800, "trust": 95},
    {"name": "UrbanStitch Fashion", "category": "Fashion", "avg_amount": 3500, "trust": 88},
    {"name": "Swiggy Bites", "category": "Dining", "avg_amount": 650, "trust": 96},
    {"name": "Zomato Express", "category": "Dining", "avg_amount": 750, "trust": 96},
    {"name": "Croma Digital Store", "category": "Electronics", "avg_amount": 22000, "trust": 94},
    {"name": "Reliance Smart", "category": "Grocery", "avg_amount": 2400, "trust": 95},
    {"name": "IndiGo Air Travel", "category": "Travel", "avg_amount": 8500, "trust": 97},
    {"name": "Zara India", "category": "Fashion", "avg_amount": 6200, "trust": 90},
    {"name": "Airtel BillPay", "category": "Utilities", "avg_amount": 1200, "trust": 99},
    {"name": "Apollo Pharmacy", "category": "Healthcare", "avg_amount": 1100, "trust": 98},
    {"name": "Amazon India", "category": "General", "avg_amount": 4200, "trust": 98},
    {"name": "Flipkart Retail", "category": "General", "avg_amount": 3800, "trust": 97},
    {"name": "Tanishq Jewellers", "category": "Jewelry", "avg_amount": 65000, "trust": 95},
    {"name": "MakeMyTrip Bookings", "category": "Travel", "avg_amount": 14000, "trust": 93}
]

DEVICE_TEMPLATES = [
    {"type": "Mobile", "os": "iOS 18.2", "browser": "Safari 18"},
    {"type": "Mobile", "os": "Android 15", "browser": "Chrome 130"},
    {"type": "Mobile", "os": "Android 14", "browser": "Samsung Internet"},
    {"type": "Desktop", "os": "macOS Sonoma", "browser": "Chrome 130"},
    {"type": "Desktop", "os": "Windows 11", "browser": "Edge 130"},
    {"type": "Tablet", "os": "iPadOS 18", "browser": "Safari 18"}
]

def generate_synthetic_ecosystem(num_customers: int = 120, seed: int = 2026):
    """
    Generates deterministic, high-quality synthetic customer, merchant, and device profiles.
    """
    random.seed(seed)
    
    # 1. Generate Merchants (50 merchants)
    merchants = []
    cities = list(CITY_COORDINATES.keys())[:8]  # Top Indian cities
    for i in range(50):
        m_id = f"M{101 + i}"
        template = MERCHANT_TEMPLATES[i % len(MERCHANT_TEMPLATES)]
        city = cities[i % len(cities)]
        name_suffix = f" {city}" if i >= len(MERCHANT_TEMPLATES) else ""
        merchants.append({
            "merchant_id": m_id,
            "merchant_name": template["name"] + name_suffix,
            "category": template["category"],
            "city": city,
            "country": "India",
            "trust_score": template["trust"] - random.randint(0, 5),
            "average_transaction_value": template["avg_amount"],
            "account_age_years": round(random.uniform(1.5, 8.0), 1),
            "risk_score": 100 - template["trust"],
            "is_fake": False
        })

    # 2. Generate Customers
    customers = []
    
    # Customer 0: Priya Sharma (Deterministic Demo Target C001)
    customers.append({
        "customer_id": "C001",
        "synthetic_name": "Priya Sharma",
        "age_range": "28-35",
        "home_city": "Pune",
        "country": "India",
        "trusted_devices": ["DEV001"],
        "spending_range": [500, 6000],
        "average_transaction_amount": 2800.0,
        "median_transaction_amount": 2500.0,
        "preferred_merchant_categories": ["Grocery", "Fashion", "Electronics", "Dining"],
        "normal_transaction_hours": [9, 22],
        "transaction_frequency": 8,  # txns/week
        "common_locations": ["Pune", "Mumbai"],
        "typical_payment_methods": ["CARD", "UPI"],
        "account_status": "ACTIVE",
        "account_created_days_ago": 730
    })

    # Customer 1: Rahul Verma (Frequent business traveler C002)
    customers.append({
        "customer_id": "C002",
        "synthetic_name": "Rahul Verma",
        "age_range": "35-45",
        "home_city": "Delhi",
        "country": "India",
        "trusted_devices": ["DEV002_A", "DEV002_B"],
        "spending_range": [1200, 25000],
        "average_transaction_amount": 9500.0,
        "median_transaction_amount": 7800.0,
        "preferred_merchant_categories": ["Travel", "Dining", "Electronics"],
        "normal_transaction_hours": [8, 23],
        "transaction_frequency": 12,
        "common_locations": ["Delhi", "Bengaluru", "Mumbai"],
        "typical_payment_methods": ["CARD", "NET_BANKING"],
        "account_status": "ACTIVE",
        "account_created_days_ago": 900
    })

    # Generate remaining customers
    for i in range(2, num_customers):
        c_id = f"C{i+1:03d}"
        fname = FIRST_NAMES[i % len(FIRST_NAMES)]
        lname = LAST_NAMES[(i * 3 + 7) % len(LAST_NAMES)]
        name = f"{fname} {lname}"
        home_city = cities[i % len(cities)]
        
        # 1 or 2 common nearby cities
        secondary_city = cities[(i + 1) % len(cities)]
        common_locs = [home_city]
        if random.random() > 0.4:
            common_locs.append(secondary_city)

        # Baseline spending profile
        archetype = random.choice(["STUDENT", "PROFESSIONAL", "FAMILY", "AFFLUENT"])
        if archetype == "STUDENT":
            min_spend, max_spend = 100, 2500
            avg_spend = random.randint(300, 900)
            cats = ["Dining", "Grocery", "Utilities"]
            pay_methods = ["UPI", "CARD"]
        elif archetype == "PROFESSIONAL":
            min_spend, max_spend = 500, 12000
            avg_spend = random.randint(2000, 5000)
            cats = ["Grocery", "Fashion", "Dining", "Electronics", "Travel"]
            pay_methods = ["CARD", "UPI", "NET_BANKING"]
        elif archetype == "FAMILY":
            min_spend, max_spend = 800, 20000
            avg_spend = random.randint(3500, 8500)
            cats = ["Grocery", "Utilities", "Healthcare", "Fashion", "General"]
            pay_methods = ["CARD", "NET_BANKING"]
        else:  # AFFLUENT
            min_spend, max_spend = 2000, 75000
            avg_spend = random.randint(15000, 35000)
            cats = ["Electronics", "Travel", "Fashion", "Jewelry", "Dining"]
            pay_methods = ["CARD", "NET_BANKING"]

        dev_count = 1 if random.random() < 0.75 else 2
        devices = [f"DEV{i+1:03d}_{chr(65+d)}" for d in range(dev_count)]

        customers.append({
            "customer_id": c_id,
            "synthetic_name": name,
            "age_range": random.choice(["21-27", "28-35", "36-48", "49-60"]),
            "home_city": home_city,
            "country": "India",
            "trusted_devices": devices,
            "spending_range": [min_spend, max_spend],
            "average_transaction_amount": float(avg_spend),
            "median_transaction_amount": float(avg_spend * 0.9),
            "preferred_merchant_categories": cats,
            "normal_transaction_hours": [random.randint(7, 9), random.randint(21, 23)],
            "transaction_frequency": random.randint(4, 15),
            "common_locations": common_locs,
            "typical_payment_methods": pay_methods,
            "account_status": "ACTIVE",
            "account_created_days_ago": random.randint(120, 1200)
        })

    # 3. Generate Device Catalog with Device Fingerprints
    devices = {}
    for cust in customers:
        for dev_id in cust["trusted_devices"]:
            tmpl = random.choice(DEVICE_TEMPLATES)
            devices[dev_id] = {
                "device_id": dev_id,
                "customer_id": cust["customer_id"],
                "device_type": tmpl["type"],
                "os": tmpl["os"],
                "browser": tmpl["browser"],
                "ip_address": f"103.{random.randint(10, 240)}.{random.randint(1, 254)}.{random.randint(1, 254)}",
                "first_seen_days_ago": random.randint(60, cust["account_created_days_ago"]),
                "trusted": True,
                "device_risk_score": 5.0
            }

    return {
        "customers": {c["customer_id"]: c for c in customers},
        "merchants": {m["merchant_id"]: m for m in merchants},
        "devices": devices,
        "cities": CITY_COORDINATES
    }
