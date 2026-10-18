"""
Demo dataset reproducing the Uber-style Contract Dispatch architecture diagram.
Includes Users (u1-u5), Contracts (c1-c7), and Advocates (L1-L3).
"""

from models import (
    ContractSubmission,
    LawyerProfile,
    DomainCategory,
    PriorityLevel
)

def get_demo_lawyers():
    return [
        LawyerProfile(
            id="L1",
            name="Adv. Tanvir Ahmed, Supreme Court of Bangladesh",
            bar_council_no="SC-DH-48912/2016",
            primary_domains=[
                DomainCategory.LABOUR_EMPLOYMENT,
                DomainCategory.CORPORATE_COMMERCIAL
            ],
            rating=4.92,
            active_workload=2,
            max_capacity=6,
            avg_sla_hours=2.5,
            is_verified=True
        ),
        LawyerProfile(
            id="L2",
            name="Adv. Sabrina Farooque, Dhaka District Bar",
            bar_council_no="DH-DB-19842/2019",
            primary_domains=[
                DomainCategory.CORPORATE_COMMERCIAL,
                DomainCategory.IP_ICT
            ],
            rating=4.85,
            active_workload=1,
            max_capacity=5,
            avg_sla_hours=3.0,
            is_verified=True
        ),
        LawyerProfile(
            id="L3",
            name="Adv. Kamal Hossain, Bangladesh Bar Council",
            bar_council_no="BC-REG-31045/2014",
            primary_domains=[
                DomainCategory.REAL_ESTATE_PROPERTY,
                DomainCategory.GENERAL_CIVIL
            ],
            rating=4.75,
            active_workload=3,
            max_capacity=6,
            avg_sla_hours=4.0,
            is_verified=True
        )
    ]

def get_demo_contracts():
    return [
        ContractSubmission(
            id="c1",
            user_id="u1",
            title="Senior Executive Employment Agreement & Non-Compete",
            domain=DomainCategory.LABOUR_EMPLOYMENT,
            statute_reference="Bangladesh Labour Act 2006 (Sec 26/27)",
            risk_count=4,
            priority=PriorityLevel.HIGH
        ),
        ContractSubmission(
            id="c2",
            user_id="u2",
            title="SaaS Vendor SLA & Cloud Architecture Agreement",
            domain=DomainCategory.IP_ICT,
            statute_reference="Copyright Act 2000 & ICT Act 2006",
            risk_count=2,
            priority=PriorityLevel.NORMAL
        ),
        ContractSubmission(
            id="c3",
            user_id="u2",
            title="Master Services Agreement (MSA) - Phase 2 Addendum",
            domain=DomainCategory.CORPORATE_COMMERCIAL,
            statute_reference="Contract Act 1872 (Sec 73/74)",
            risk_count=3,
            priority=PriorityLevel.MEDIUM
        ),
        ContractSubmission(
            id="c4",
            user_id="u3",
            title="Commercial Tower Lease & Tenancy Deed (Gulshan)",
            domain=DomainCategory.REAL_ESTATE_PROPERTY,
            statute_reference="Premises Rent Control Act 1991",
            risk_count=3,
            priority=PriorityLevel.HIGH
        ),
        ContractSubmission(
            id="c5",
            user_id="u4",
            title="Freehold Land Sale Deed & Baynanama (Gazipur Mouza)",
            domain=DomainCategory.REAL_ESTATE_PROPERTY,
            statute_reference="Transfer of Property Act 1882",
            risk_count=2,
            priority=PriorityLevel.NORMAL
        ),
        ContractSubmission(
            id="c6",
            user_id="u5",
            title="Software Development & IP Assignment Agreement",
            domain=DomainCategory.IP_ICT,
            statute_reference="ICT Act 2006 & Patent Design Act 1911",
            risk_count=3,
            priority=PriorityLevel.NORMAL
        ),
        ContractSubmission(
            id="c7",
            user_id="u5",
            title="Workplace Grievance & Disciplinary Policy Schedule",
            domain=DomainCategory.LABOUR_EMPLOYMENT,
            statute_reference="Bangladesh Labour Act 2006 (Sec 23/24)",
            risk_count=1,
            priority=PriorityLevel.NORMAL
        ),
    ]
