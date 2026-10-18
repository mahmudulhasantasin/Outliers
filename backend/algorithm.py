"""
Contract Dispatch & Advocate Allocation Engine.
Implements the multi-factor scoring and dynamic assignment algorithm.
"""

from typing import List, Dict, Optional, Tuple
from models import (
    ContractSubmission,
    LawyerProfile,
    DispatchResult,
    ScoreBreakdown,
    DomainCategory,
    PriorityLevel
)

class DispatchWeights:
    def __init__(
        self,
        domain: float = 0.40,
        rating: float = 0.20,
        workload: float = 0.20,
        affinity: float = 0.15,
        urgency: float = 0.10
    ):
        self.domain = domain
        self.rating = rating
        self.workload = workload
        self.affinity = affinity
        self.urgency = urgency

class ContractDispatchEngine:
    def __init__(
        self,
        lawyers: List[LawyerProfile],
        weights: Optional[DispatchWeights] = None
    ):
        self.lawyers: Dict[str, LawyerProfile] = {l.id: l for l in lawyers}
        self.weights = weights or DispatchWeights()
        # Maps user_id -> set of lawyer_ids that have handled their contracts
        self.user_affinity_map: Dict[str, set] = {}

    def calculate_score(
        self,
        contract: ContractSubmission,
        lawyer: LawyerProfile
    ) -> Tuple[float, ScoreBreakdown]:
        """
        Computes the dispatch suitability score for a (contract, lawyer) pair.
        Returns total_score and ScoreBreakdown.
        """
        # 1. Domain Specialization Match
        if contract.domain in lawyer.primary_domains:
            domain_score = 1.0
        else:
            # Partial domain correlation (e.g. Corporate vs IP)
            domain_score = 0.15

        # 2. Lawyer Rating (Normalized to 0.0 - 1.0)
        rating_score = max(0.0, min(1.0, lawyer.rating / 5.0))

        # 3. Workload Penalty (Current load vs capacity)
        workload_ratio = lawyer.active_workload / max(1, lawyer.max_capacity)
        workload_penalty = min(1.0, workload_ratio)

        # 4. Client Affinity / Continuity Bonus
        prior_lawyers = self.user_affinity_map.get(contract.user_id, set())
        affinity_bonus = 1.0 if lawyer.id in prior_lawyers else 0.0

        # 5. Urgency / SLA Factor
        urgency_boost = 0.0
        if contract.priority in (PriorityLevel.HIGH, PriorityLevel.URGENT):
            # Reward lawyers with faster average SLA turnaround
            urgency_boost = max(0.0, 1.0 - (lawyer.avg_sla_hours / 8.0))

        # Weighted Composite Score
        total_score = (
            (self.weights.domain * domain_score) +
            (self.weights.rating * rating_score) -
            (self.weights.workload * workload_penalty) +
            (self.weights.affinity * affinity_bonus) +
            (self.weights.urgency * urgency_boost)
        )

        breakdown = ScoreBreakdown(
            domain_score=round(domain_score, 4),
            rating_score=round(rating_score, 4),
            workload_penalty=round(workload_penalty, 4),
            affinity_bonus=round(affinity_bonus, 4),
            urgency_boost=round(urgency_boost, 4),
            total_score=round(total_score, 4)
        )

        return total_score, breakdown

    def dispatch_contract(self, contract: ContractSubmission) -> Optional[DispatchResult]:
        """
        Finds the highest-scoring eligible advocate and assigns the contract.
        Updates lawyer workload and client affinity dynamically.
        """
        best_lawyer: Optional[LawyerProfile] = None
        best_score = -float('inf')
        best_breakdown: Optional[ScoreBreakdown] = None

        # Filter candidates: Must be verified and have available capacity
        eligible_candidates = [
            l for l in self.lawyers.values()
            if l.is_verified and l.active_workload < l.max_capacity
        ]

        if not eligible_candidates:
            return None  # All lawyers currently at max capacity

        # Evaluate each eligible advocate
        for lawyer in eligible_candidates:
            score, breakdown = self.calculate_score(contract, lawyer)
            if score > best_score:
                best_score = score
                best_lawyer = lawyer
                best_breakdown = breakdown

        if not best_lawyer or not best_breakdown:
            return None

        # Execute assignment
        best_lawyer.active_workload += 1
        best_lawyer.assigned_contracts.append(contract.id)

        # Update client affinity for future contracts from this user
        if contract.user_id not in self.user_affinity_map:
            self.user_affinity_map[contract.user_id] = set()
        self.user_affinity_map[contract.user_id].add(best_lawyer.id)

        # Build human-readable reason
        reasons = []
        if best_breakdown.domain_score >= 1.0:
            reasons.append(f"Domain Specialist ({contract.domain.value})")
        if best_breakdown.affinity_bonus > 0:
            reasons.append(f"Client Continuity Bonus (User {contract.user_id})")
        if best_breakdown.workload_penalty < 0.4:
            reasons.append("Low Workload SLA Availability")
        reasons.append(f"Rating {best_lawyer.rating}★")

        return DispatchResult(
            contract_id=contract.id,
            user_id=contract.user_id,
            lawyer_id=best_lawyer.id,
            lawyer_name=best_lawyer.name,
            score=best_score,
            breakdown=best_breakdown,
            status="DISPATCHED",
            reason=" | ".join(reasons)
        )

    def dispatch_batch(
        self,
        contracts: List[ContractSubmission]
    ) -> List[DispatchResult]:
        """
        Dispatches a batch of incoming contracts sequentially,
        updating workloads and affinity in real time.
        """
        results = []
        for contract in contracts:
            result = self.dispatch_contract(contract)
            if result:
                results.append(result)
            else:
                # Fallback if queue is exhausted
                results.append(
                    DispatchResult(
                        contract_id=contract.id,
                        user_id=contract.user_id,
                        lawyer_id="UNASSIGNED",
                        lawyer_name="None (Queue Full)",
                        score=0.0,
                        breakdown=ScoreBreakdown(0, 0, 0, 0, 0, 0),
                        status="QUEUED_FOR_CAPACITY",
                        reason="All verified advocates at maximum capacity."
                    )
                )
        return results
