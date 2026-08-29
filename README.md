# AEGISX
### AI vs. AI: A Defense Lab for GenAI-Driven Payment Fraud
> **"Simulate Tomorrow's Payment Fraud. Defend Today."**
> *Built for the Mastercard Innovation Challenge @ GFF 2026*

---

## 🌟 Executive Summary

Generative AI enables financial fraudsters to craft synthetic identities, deepfake authorizations, and multi-vector account takeovers at machine scale. Traditional payment fraud systems are reactive—waiting 30 to 90 days for chargebacks before updating defense models.

**AEGISX** is a flight simulator for payment security. It establishes a completely synthetic payment ecosystem where:
- **Red Team AI** autonomously synthesizes emerging GenAI-driven fraud vectors across 4 difficulty tiers.
- **Blue Team AI** defends the ecosystem using a 7-layer detection engine operating strictly on **unlabeled real-time transaction streams**.
- **Evaluation Engine** unlocks the isolated backend **Hidden Attack Ledger** post-simulation to compute exact, un-fabricated confusion matrices.
- **Continuous Adaptation & Attack Replay** diagnoses detection blind spots, re-calibrates layer weights, and proves measurable defense improvement in Round 2.

---

## 🏛️ Three-World Data Architecture

```
[World 1: Historical Baseline]
  ├── 150+ Synthetic Customers with 60 days of established behavioral baselines
  ├── Trusted Devices, Normal Hours (09:00-22:00), Common Cities, Spending Bounds
  └── E.g., Priya Sharma (C001): ₹500–₹6,000 normal range in Pune on DEV001

[World 2: Live Unlabeled Stream]
  ├── Real-time transaction generator (1–10 TPS)
  ├── Red Team secret attack injection (0.5%–5% contamination)
  ├── 100% Unlabeled Payloads (ZERO fraud labels exposed to Blue Team)
  └── 7-Layer Blue Team Detection -> Dynamic Risk (0-100) -> Action (Approve/Monitor/Challenge/Block)

[World 3: Hidden Ground Truth & Learning]
  ├── Hidden Attack Ledger (isolated in backend memory)
  ├── Ground truth reveal -> Exact Precision, Recall, F1, FPR calculation
  ├── Continuous adaptation engine -> Re-calibrates layer weights
  └── Attack Replay Simulator -> Round-by-Round AI vs AI Scoreboard
```

---

## 🛡️ The 7 Blue Team Defense Layers

1. **Behavioral Deviation**: Evaluates amount z-scores, spending multipliers, and off-hours night shifts (02:13 AM).
2. **Device Intelligence**: Hardware fingerprint matching, unverified device flags, cross-account device sharing.
3. **Location Intelligence & Travel Velocity**: Haversine distance and speed (km/h) detecting impossible physical travel.
4. **Velocity & Burst Analysis**: Sliding window tracking micro-charge card testing and rapid merchant hopping.
5. **Merchant Reputation**: Merchant trust scoring (0–100), account age, and dormant shell spikes.
6. **Graph & Entity Network Intelligence**: NetworkX bipartite graph detecting shared hardware syndicates.
7. **Unsupervised ML Anomaly Detection**: Isolation Forest model detecting multi-dimensional feature outliers without labels.

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Start Backend Server
```bash
# In project root
python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000
```
API runs on `http://localhost:8000` (docs at `http://localhost:8000/docs`).

### 2. Start Frontend UI
```bash
cd frontend
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🎯 2-Minute Judge Walkthrough (First MVP Scenario)

1. **Inspect Customer Baseline**: Observe Priya Sharma (`C001`, Pune, ₹500–₹6,000 baseline, `DEV001`).
2. **Start Stream**: Click **[Start Stream]** at 5 TPS. Watch normal green `APPROVE` transactions.
3. **Inject Account Takeover**: Click **[2-Min Demo Mode]** or launch ATO from Red Team Attack Lab.
   - Attack injects: **₹78,000**, **02:13 AM**, **Mumbai**, **`DEV_NEW_MUMBAI_88`**.
4. **Autonomous Detection**: Blue Team flags transaction as **`BLOCK` (Risk Score: 84/100)** without ever seeing fraud labels.
5. **AI Forensic Investigator**: Click **[Investigate]** to see the Explainable Risk Attribution (+38 Behavioral, +26 Device, +16 Anomaly) and natural language diagnostic summary.
6. **Reveal Ground Truth & Evaluation**: Navigate to Evaluation tab to see the computed Confusion Matrix and exact 100% Detection Rate.
7. **Attack Replay Simulator**: Compare Before Defense (Risk 58 / MONITOR) vs After Defense (Risk 88 / BLOCK).
8. **AI vs AI Scoreboard**: View the round-by-round competition leaderboard.

---

## 🔒 Safety & Synthetic Boundary
- **100% Synthetic Assets**: No real PII, card numbers, or credentials.
- **No External Financial Connections**: Safe, self-contained simulation laboratory.
