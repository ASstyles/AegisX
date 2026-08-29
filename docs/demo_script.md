# AEGISX 2-Minute Judge Walkthrough Script
**Mastercard Innovation Challenge @ GFF 2026**

---

## 🎯 The Judging Narrative (2–3 Minutes)

### Step 1: Set the Problem & Three-World Architecture (0:00 - 0:30)
- *"Judges, GenAI gives financial fraudsters the power to synthesize attacks at machine speed. Traditional fraud models wait for fraud to happen, collect chargeback labels 60 days later, and retrain."*
- *"AEGISX is a flight simulator for payment fraud. We created a three-world architecture:"*
  - **World 1 (Historical Baseline)**: 150 synthetic customers with 60 days of normal spending.
  - **World 2 (Live Unlabeled Stream)**: A real-time transaction stream where our Red Team secretly injects attacks, and our Blue Team defends **without seeing any fraud labels**.
  - **World 3 (Hidden Ground Truth)**: An isolated backend Attack Ledger unlocked only post-simulation to evaluate true detection accuracy.

---

### Step 2: Observe the Customer Baseline & Live Stream (0:30 - 0:50)
- Look at customer **Priya Sharma (`C001`)**:
  - *Home City*: Pune
  - *Normal Spending*: ₹500 – ₹6,000 (Average ₹2,800)
  - *Trusted Device*: `DEV001`
  - *Normal Hours*: 09:00 – 22:00
- Click **[Start Stream]** at 5 TPS. Watch normal unlabeled transactions flowing in real time with green `APPROVE` badges.

---

### Step 3: Launch Red Team Account Takeover (0:50 - 1:15)
- In the **Red Team Attack Lab**, select **Account Takeover (Medium)** targeting Priya (`C001`).
- Click **[Launch Attack Injection]**.
- Notice what was injected:
  - Amount: **₹78,000** (28x baseline surge!)
  - Time: **02:13 AM** (deep night anomaly)
  - Location: **Mumbai**
  - Device: **`DEV_NEW_MUMBAI_88`** (brand new untrusted device)
- Watch the live stream feed: **Blue Team dynamically flags the transaction as `BLOCK` (Risk Score: 84–96/100)** without receiving any label!

---

### Step 4: Click [Investigate] for Explainable AI (1:15 - 1:35)
- Click the **Investigate** button next to the blocked transaction.
- Show the **AI Forensic Investigator**:
  - *Explainable Risk Attribution*: Behavioral Deviation (+38 pts), Device Intelligence (+26 pts), ML Anomaly (+16 pts).
  - *Natural Language Narrative*: Explains in plain English why the transaction was blocked.

---

### Step 5: Reveal Hidden Ground Truth & Replay (1:35 - 2:00)
- Navigate to **Hidden Ground Truth & Evaluation**:
  - Click **[Reveal Ground Truth & Evaluate]**.
  - Show the **True Positives**, exact **Precision (100%)**, and **Detection Rate (100%)**.
- Click **[Attack Replay Simulator]**:
  - Show side-by-side:
    - *Before Adaptive Defense*: Risk Score 58 $\to$ CHALLENGE
    - *After Adaptive Defense*: Risk Score 88 $\to$ HARD BLOCK
- Show the **AI vs AI Scoreboard**:
  - Round 1 vs Round 2 competitive leaderboard showing Red Team evasion dropping and Blue Team detection rising!
