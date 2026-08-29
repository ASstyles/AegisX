# AEGISX ML Methodology & Explainable Risk Attribution

AEGISX rejects the unexplainable black-box paradigm ("AI says fraud") in favor of multi-layered, auditable behavioral defense and statistical anomaly scoring.

---

## 1. Explainable Risk Attribution

In production fintech environments, fraud risk scoring must be directly interpretable by fraud ops analysts and compliant with global financial regulatory guidelines.

AEGISX decomposes composite risk into 7 distinct observable signals:
1. **Behavioral Deviation ($\Delta_{\text{amount}}, \Delta_{\text{time}}, \Delta_{\text{category}}$)**:
   - Z-score of transaction amount: $Z = \frac{\text{Amount} - \mu_{\text{historical}}}{\sigma_{\text{historical}}}$
   - Spending Multiplier: $M = \frac{\text{Amount}}{\mu_{\text{historical}}}$
   - Off-Hours Indicator: Evaluates whether $\text{Hour} \notin [\text{StartHour}, \text{EndHour}]$.
2. **Device Intelligence ($\text{DevRisk}$)**:
   - Evaluates trusted device membership, new device presence, and cross-customer device collisions.
3. **Location Intelligence & Impossible Travel ($\text{LocRisk}$)**:
   - Haversine Distance $d$ and Speed $v = \frac{d}{\Delta t}$. Flags $v > 850\text{ km/h}$.
4. **Velocity & Burst ($\text{VelRisk}$)**:
   - 60-second and 300-second transaction frequency and micro-charge card testing counts.
5. **Merchant Reputation ($\text{MerchRisk}$)**:
   - Merchant Trust Score $T \in [0, 100]$, Account Age $\text{Age}_{\text{years}}$.
6. **Graph & Entity Ring ($\text{GraphRisk}$)**:
   - NetworkX bipartite entity node degree on shared hardware and IP endpoints.
7. **Unsupervised Anomaly Score ($\text{IForestRisk}$)**:
   - Scikit-Learn Isolation Forest decision function mapped from $[-0.5, 0.5] \to [100, 0]$.

---

## 2. Evaluation Metrics (Imbalanced Fraud Distribution)

Because real-world payment fraud represents $<2\%$ of total volume, accuracy is misleading. AEGISX calculates:

$$\text{Precision} = \frac{TP}{TP + FP}$$

$$\text{Recall (Detection Rate)} = \frac{TP}{TP + FN}$$

$$\text{F1 Score} = 2 \cdot \frac{\text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}}$$

$$\text{False Positive Rate (FPR)} = \frac{FP}{FP + TN}$$

$$\text{Attacker Evasion Rate} = \frac{FN}{TP + FN}$$
