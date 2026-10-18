"""
Data models for Sovereign Contract Dispatch & Lawyer Allocation Engine.
Defines entities for Users, Contracts, Advocates, and Assignment records.
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import List, Dict, Optional
import time

class DomainCategory(str, Enum):
    LABOUR_EMPLOYMENT = "LABOUR_EMPLOYMENT"
    CORPORATE_COMMERCIAL = "CORPORATE_COMMERCIAL"
    REAL_ESTATE_PROPERTY = "REAL_ESTATE_PROPERTY"
    IP_ICT = "IP_ICT"
    BANKING_FINANCE = "BANKING_FINANCE"
    GENERAL_CIVIL = "GENERAL_CIVIL"

class PriorityLevel(str, Enum):
    NORMAL = "NORMAL"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    URGENT = "URGENT"

@dataclass
class ContractSubmission:
    id: str
    user_id: str
    title: str
    domain: DomainCategory
    statute_reference: str
    risk_count: int
    priority: PriorityLevel = PriorityLevel.NORMAL
    submitted_at: float = field(default_factory=time.time)
    metadata: Dict = field(default_factory=dict)

@dataclass
class LawyerProfile:
    id: str
    name: str
    bar_council_no: str
    primary_domains: List[DomainCategory]
    rating: float  # Scale 1.0 to 5.0
    active_workload: int  # Current number of unreviewed pending contracts
    max_capacity: int = 10  # Maximum concurrent contracts allowed
    avg_sla_hours: float = 3.5  # Historical average turnaround time in hours
    is_verified: bool = True
    assigned_contracts: List[str] = field(default_factory=list)

@dataclass
class ScoreBreakdown:
    domain_score: float
    rating_score: float
    workload_penalty: float
    affinity_bonus: float
    urgency_boost: float
    total_score: float

@dataclass
class DispatchResult:
    contract_id: str
    user_id: str
    lawyer_id: str
    lawyer_name: str
    score: float
    breakdown: ScoreBreakdown
    status: str = "DISPATCHED"
    reason: str = ""
