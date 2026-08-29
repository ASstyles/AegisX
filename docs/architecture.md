# AEGISX System Architecture

AEGISX is an adversarial AI payment security laboratory designed for the **Mastercard Innovation Challenge @ GFF 2026**.

## Tagline
> **"Simulate Tomorrow's Payment Fraud. Defend Today."**

---

## 1. The Core Adversarial Feedback Loop

```
IDENTIFY (Emerging GenAI Fraud Vectors)
   ↓
GENERATE (Red Team Scenario Synthesis)
   ↓
DEFEND   (Layered Blue Team Unlabeled Detection)
   ↓
MITIGATE (Approve / Monitor / Challenge / Block)
   ↓
EVALUATE (Hidden Ground Truth Reveal & Exact Metrics)
   ↓
LEARN    (Continuous Root-Cause Adaptation)
   ↓
REPLAY   (Before vs After Defense Verification)
   ↓
IMPROVE  (AI vs AI Scoreboard Round Progression)
```

---

## 2. Three-World Data Architecture

AEGISX strictly enforces separation between three data worlds to eliminate label leakage during real-time detection:

```
┌────────────────────────────────────────────────────────────────────────┐
│ WORLD 1: HISTORICAL CUSTOMER BASELINE                                  │
│ 150+ synthetic customers, 60 days baseline history, trusted devices,   │
│ normal hours (09:00-22:00), spending bounds (e.g. ₹500–₹6,000 in Pune) │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ↓
┌────────────────────────────────────────────────────────────────────────┐
│ WORLD 2: LIVE UNLABELED TRANSACTION STREAM                             │
│ • Stream Generator (1–10 TPS)                                          │
│ • Red Team Injects Modified Payloads (0.5%–5% contamination)           │
│ • Blue Team Layered Detection (Receives NO is_fraud or attack labels)  │
│ • Dynamic Risk Score (0–100) → Mitigation Decision                     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ↓
┌────────────────────────────────────────────────────────────────────────┐
│ WORLD 3: ISOLATED HIDDEN ATTACK LEDGER & CONTINUOUS LEARNING           │
│ • Ground truth fraud labels isolated in backend memory                 │
│ • Unlocked post-simulation for exact TP/FP/TN/FN evaluation            │
│ • Adaptive defense parameter calibration & Attack Replay               │
│ • AI vs AI Battle Scoreboard (Round 1 → Round 2 → Round 3)             │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. The 7 Blue Team Detection Layers

1. **Layer 1: Behavioral Deviation**: Computes amount z-scores, percentiles, spending multipliers, time-of-day off-hours shifts (e.g. 02:13 AM night anomalies), and merchant category divergence.
2. **Layer 2: Device Intelligence**: Cross-references hardware fingerprints against customer trusted device registries, flags brand new devices and cross-account hardware sharing.
3. **Layer 3: Location Intelligence & Travel Velocity**: Computes Haversine distance and travel speed (km/h) between successive transactions to detect physical impossible travel (e.g., Pune to Mumbai or Singapore in minutes).
4. **Layer 4: Velocity & Burst Analysis**: Sliding window monitor detecting micro-charge card testing bursts and rapid merchant hopping.
5. **Layer 5: Merchant Reputation**: Evaluates merchant trust scores (0–100), account age, and dormant shell entity spikes.
6. **Layer 6: Graph & Entity Network Intelligence**: NetworkX bipartite entity graph tracking `Customer ↔ Device ↔ Merchant` connections to uncover shared device syndicates and mule clusters.
7. **Layer 7: Unsupervised Anomaly Detection**: Isolation Forest model evaluated on normalized multi-dimensional transaction feature vectors without requiring historical fraud labels.

---

## 4. Explainable Risk Attribution

Instead of treating detection as an opaque black box, AEGISX provides additive, auditable feature contribution attribution:

$$\text{Composite Risk} = \sum_{i=1}^{7} w_i \cdot \text{SubScore}_i + \text{CompoundThreatBoost}$$

### Decision Thresholds:
- **0 – 30**: `APPROVE` (Seamless frictionless checkout)
- **31 – 60**: `MONITOR` (Passive risk monitoring)
- **61 – 80**: `CHALLENGE` (Step-up 3DS / biometric verification)
- **81 – 100**: `BLOCK` (Immediate mitigation and hard block)
