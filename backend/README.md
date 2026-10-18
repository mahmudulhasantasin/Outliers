# Sovereign Contract Dispatch & Advocate Matching Engine
**Legal Copilot · Sovereign Contract Intelligence for Bangladesh Law**

This module implements the automated dispatch algorithm that routes client-submitted contracts to verified Bangladesh Bar Council advocates.

---

## 📐 Mathematical Formulation

For each contract $C_i$ submitted by user $U_k$ and candidate advocate $L_j$, the dispatch suitability score is calculated as:

$$\text{Score}(L_j, C_i) = w_{\text{domain}} \cdot S_{\text{domain}} + w_{\text{rating}} \cdot S_{\text{rating}} - w_{\text{workload}} \cdot P_{\text{workload}} + w_{\text{affinity}} \cdot B_{\text{affinity}} + w_{\text{urgency}} \cdot B_{\text{urgency}}$$

### Scoring Components

| Factor | Notation | Description | Weight |
|---|---|---|---|
| **Domain Specialization** | $S_{\text{domain}} \in [0.15, 1.0]$ | 1.0 if advocate's primary practice areas (e.g. Labour, Corporate, Real Estate, IP) match the contract's domain; 0.15 otherwise. | $w_{\text{domain}} = 0.40$ |
| **Advocate Rating & Quality** | $S_{\text{rating}} \in [0.0, 1.0]$ | Normalized rating $\frac{\text{Rating}}{5.0}$ based on Bar Council verification and client review scores. | $w_{\text{rating}} = 0.20$ |
| **Workload Balancing Penalty** | $P_{\text{workload}} \in [0.0, 1.0]$ | Ratio of currently active unreviewed contracts $\frac{\text{active\_workload}}{\text{max\_capacity}}$ to prevent advocate bottlenecking. | $w_{\text{workload}} = 0.20$ |
| **Client Continuity Affinity** | $B_{\text{affinity}} \in \{0.0, 1.0\}$ | 1.0 bonus if advocate $L_j$ already handles another active or recent contract for user $U_k$ (e.g. User $u_2$ with $c_2$ & $c_3$). | $w_{\text{affinity}} = 0.15$ |
| **Urgency / SLA Boost** | $B_{\text{urgency}} \in [0.0, 1.0]$ | Priority boost for fast turnaround advocates when contract is marked HIGH or URGENT. | $w_{\text{urgency}} = 0.10$ |

### Hard Eligibility Constraints
1. **Bar Council Verification:** $\text{is\_verified} == \text{True}$
2. **Capacity Headroom:** $\text{active\_workload} < \text{max\_capacity}$

---

## 📁 Directory Structure

```
backend/
├── algorithm.py      # Core dispatching engine & score calculator
├── models.py         # Dataclasses (ContractSubmission, LawyerProfile, DispatchResult)
├── demo_data.py      # Demo dataset reproducing the system architecture diagram
├── run_demo.py       # Standalone executable CLI demo runner
└── README.md         # This technical documentation
```

---

## 🚀 Running the Demo

Run directly with Python 3:

```bash
python3 backend/run_demo.py
```

### Expected Output Summary
```
=====================================================================================
 ⚖️  LEGAL COPILOT — SOVEREIGN CONTRACT DISPATCH ENGINE (BANGLADESH LAW)
 Automated Multi-Factor Matching & Dynamic Advocate Allocation Algorithm
=====================================================================================
...
Contract  | User  | Assigned Advocate        | Score  | Key Dispatch Factor
-------------------------------------------------------------------------------------
c1        | u1    | L1 (Adv. Tanvir Ahmed)    | 0.599  | Domain Specialist (LABOUR_EMPLOYMENT)
c2        | u2    | L2 (Adv. Sabrina Farooque)| 0.554  | Domain Specialist (IP_ICT)
c3        | u2    | L2 (Adv. Sabrina Farooque)| 0.664  | Domain Specialist + Client Continuity
...
```

---

## 🌐 Planned REST API Endpoints (Next Phase Integration)

- `POST /api/v1/dispatch`: Dispatches an audited markdown contract to the best matching advocate.
- `GET /api/v1/lawyers/{lawyer_id}/queue`: Fetches pending contracts awaiting review for a specific advocate.
- `POST /api/v1/contracts/{contract_id}/verify`: Advocate signs off, attaches digital stamp, and moves contract to verified archive.
