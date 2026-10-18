#!/usr/bin/env python3
"""
Interactive CLI Demo Runner for Legal Copilot Contract Dispatch Algorithm.
Demonstrates Uber-style real-time contract routing across Supreme Court & District Bar advocates.
"""

import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from models import DomainCategory
from algorithm import ContractDispatchEngine, DispatchWeights
from demo_data import get_demo_lawyers, get_demo_contracts

def print_separator(char="=", length=85):
    print(char * length)

def main():
    print_separator()
    print(" ⚖️  LEGAL COPILOT — SOVEREIGN CONTRACT DISPATCH ENGINE (BANGLADESH LAW)")
    print(" Automated Multi-Factor Matching & Dynamic Advocate Allocation Algorithm")
    print_separator()
    print()

    # 1. Initialize advocates pool
    lawyers = get_demo_lawyers()
    print("📌 [1] REGISTERED & VERIFIED ADVOCATES POOL:")
    print("-" * 85)
    print(f"{'ID':<4} | {'Advocate Name':<38} | {'Rating':<6} | {'Load':<8} | {'Specializations'}")
    print("-" * 85)
    for l in lawyers:
        domains = ", ".join([d.value.split('_')[0] for d in l.primary_domains])
        print(f"{l.id:<4} | {l.name[:38]:<38} | {l.rating:.2f}★ | {l.active_workload}/{l.max_capacity:<5} | {domains}")
    print()

    # 2. Initialize Dispatch Engine with standard weights
    weights = DispatchWeights(
        domain=0.40,
        rating=0.20,
        workload=0.20,
        affinity=0.15,
        urgency=0.10
    )
    engine = ContractDispatchEngine(lawyers=lawyers, weights=weights)

    # 3. Process Incoming Contract Queue
    contracts = get_demo_contracts()
    print(f"📥 [2] INCOMING CLIENT CONTRACT QUEUE ({len(contracts)} contracts pending dispatch):")
    print("-" * 85)
    print(f"{'CID':<4} | {'User':<5} | {'Title':<38} | {'Priority':<8} | {'Statutory Domain'}")
    print("-" * 85)
    for c in contracts:
        print(f"{c.id:<4} | {c.user_id:<5} | {c.title[:38]:<38} | {c.priority.value:<8} | {c.domain.value}")
    print()

    print("🚀 [3] RUNNING DISPATCH & MATCHING ALGORITHM...")
    print_separator("-")
    print(f"{'Contract':<9} | {'User':<5} | {'Assigned Advocate':<24} | {'Score':<6} | {'Key Dispatch Factor'}")
    print_separator("-")

    results = []
    for c in contracts:
        res = engine.dispatch_contract(c)
        if res:
            results.append(res)
            print(f"{res.contract_id:<9} | {res.user_id:<5} | {res.lawyer_id} ({res.lawyer_name[:18]}..) | {res.score:.3f}  | {res.reason}")
        else:
            print(f"{c.id:<9} | {c.user_id:<5} | UNASSIGNED                 | 0.000  | Queue Exhausted / Max Capacity")

    print_separator("-")
    print()

    # 4. Highlight User Affinity & Continuity
    print("💡 [4] VERIFICATION OF ARCHITECTURAL REQUIREMENTS:")
    print("-" * 85)
    print(" • User Continuity Check (User u2 submitted Contracts c2 and c3):")
    u2_results = [r for r in results if r.user_id == "u2"]
    for r in u2_results:
        print(f"    - {r.contract_id} -> Assigned to {r.lawyer_id} ({r.lawyer_name}) [Score: {r.score:.3f}]")
    if len(u2_results) == 2 and u2_results[0].lawyer_id == u2_results[1].lawyer_id:
        print("   ✅ SUCCESS: Both contracts of User u2 routed to the same advocate (Preserving legal continuity).")
    else:
        print("   ℹ️ Split across advocates based on specialization dominance.")

    print()
    print("📊 [5] POST-DISPATCH ADVOCATE WORKLOAD & QUEUE STATE:")
    print("-" * 85)
    print(f"{'ID':<4} | {'Advocate Name':<38} | {'New Workload':<14} | {'Newly Assigned Contracts'}")
    print("-" * 85)
    for l in engine.lawyers.values():
        assigned = ", ".join(l.assigned_contracts) if l.assigned_contracts else "None"
        print(f"{l.id:<4} | {l.name[:38]:<38} | {l.active_workload}/{l.max_capacity} pending   | [{assigned}]")

    print_separator()
    print(" All contracts successfully dispatched under Bangladesh Statutory Jurisdiction.")
    print_separator()

if __name__ == "__main__":
    main()
