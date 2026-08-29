# AEGISX Attack Models & Red Team Taxonomy

AEGISX models 10 distinct GenAI payment fraud vectors across 4 adversarial difficulty levels.

---

## 1. Adversarial Difficulty Levels

- **EASY (Obvious Outliers)**: Blatant 30x amount surges, new devices in foreign/distant cities, midnight hours.
- **MEDIUM (Multi-Vector Correlation)**: Moderate 15x–28x surges, new devices in secondary domestic cities, off-peak hours.
- **HARD (Subtle Deviations)**: 1.8x–2.5x surges, familiar cities, slight hardware signature alterations, near normal window.
- **ADVERSARIAL (Statistical Boundary Mimicry)**: Red Team AI calculates the target customer's exact 94th percentile spending boundary and mimicks familiar categories to evade simple threshold heuristics.

---

## 2. The 10 Attack Vectors

### Phase 1 MVP Vectors
1. **Account Takeover (ATO)**:
   - *Modus Operandi*: Stolen credentials used on an unverified device during deep night hours (02:13 AM) with a high-ticket transaction surge (₹78,000 vs ₹2,800 normal mean).
   - *Target Telemetry*: Device ID `DEV_NEW_MUMBAI_88`, location jump Pune $\to$ Mumbai, off-hours.

2. **Card Testing Bot Flood**:
   - *Modus Operandi*: Automated bot script sequentially validating stolen card batches via rapid sub-minute micro-charges (₹1.00, ₹2.00, ₹1.50, ₹5.00) across diverse merchant checkouts.
   - *Target Telemetry*: High transaction frequency, micro-charge amount distribution, rapid merchant hopping.

3. **Fake Merchant / Shell Entity Extract**:
   - *Modus Operandi*: Collusion attack routing high-value transfers into a newly provisioned shell merchant entity with zero historical trust score.
   - *Target Telemetry*: Low merchant trust (< 40/100), low account age (< 0.2 yrs), high transaction amount.

4. **Transaction Velocity Drain**:
   - *Modus Operandi*: Rapid sequence of 5 transactions within 30 seconds across different stores to drain balance before the cardholder receives SMS/app alerts.
   - *Target Telemetry*: Burst frequency $\ge 4$ txns/min.

### Phase 2 Advanced Vectors
5. **Behavior Mimicry Evasion**:
   - *Modus Operandi*: Exploits statistical boundaries by spending ₹5,880 (just below Priya's ₹6,000 maximum bound) through trusted fashion merchants.
   - *Target Telemetry*: Sub-score boundary testing, requiring Layer 7 Unsupervised Isolation Forest and subtle device fingerprint shifts to catch.

6. **Multi-Account Syndicate Fraud Ring**:
   - *Modus Operandi*: Coordinated fraud syndicate using a single pooled device/emulator (`DEV_RING_SHARED_SYNDICATE_X`) across 3 distinct customer accounts (`C001`, `C003`, `C005`).
   - *Target Telemetry*: Layer 6 NetworkX graph degree $\ge 3$ on the shared hardware node.

7. **Synthetic Identity Creation**:
   - *Modus Operandi*: Brand new synthetic identity profile with mismatched device fingerprints, unusual geolocations, and erratic initial spending.
   - *Target Telemetry*: Brand new customer record without established 60-day baseline.

### Phase 3 Safe GenAI Simulations
8. **AI Social Engineering Scam**:
   - *Modus Operandi*: Safe simulated transcript & metadata of urgent CEO/family fraud inducing cardholder to initiate large authorization.
9. **Voice Clone Authorization**:
   - *Modus Operandi*: Simulated acoustic spoofing metadata attempting high-value payment gateway release.
10. **Deepfake KYC Biometrics**:
    - *Modus Operandi*: Synthetic video manipulation metadata attempting bypass of digital onboarding filters.
