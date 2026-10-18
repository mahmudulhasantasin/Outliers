/**
 * Client-Side Contract Dispatch Engine (TypeScript mirror of backend/algorithm.py)
 * Enables end-to-end interactive simulation of the advocate matching algorithm in the UI.
 */

export interface DispatchLawyer {
  id: string;
  name: string;
  barCouncilNo: string;
  primaryDomains: string[];
  rating: number;
  activeWorkload: number;
  maxCapacity: number;
  avgSlaHours: number;
  isVerified: boolean;
}

export interface DispatchContract {
  id: string;
  userId: string;
  title: string;
  domain: string;
  statuteReference: string;
  riskCount: number;
  priority: "NORMAL" | "MEDIUM" | "HIGH" | "URGENT";
}

export interface DispatchDecision {
  contractId: string;
  userId: string;
  lawyer: DispatchLawyer;
  score: number;
  reason: string;
}

export const INITIAL_DEMO_LAWYERS: DispatchLawyer[] = [
  {
    id: "L1",
    name: "Adv. Tanvir Ahmed, Supreme Court of Bangladesh",
    barCouncilNo: "SC-DH-48912/2016",
    primaryDomains: ["LABOUR_EMPLOYMENT", "CORPORATE_COMMERCIAL"],
    rating: 4.92,
    activeWorkload: 2,
    maxCapacity: 6,
    avgSlaHours: 2.5,
    isVerified: true
  },
  {
    id: "L2",
    name: "Adv. Sabrina Farooque, Dhaka District Bar",
    barCouncilNo: "DH-DB-19842/2019",
    primaryDomains: ["CORPORATE_COMMERCIAL", "IP_ICT"],
    rating: 4.85,
    activeWorkload: 1,
    maxCapacity: 5,
    avgSlaHours: 3.0,
    isVerified: true
  },
  {
    id: "L3",
    name: "Adv. Kamal Hossain, Bangladesh Bar Council",
    barCouncilNo: "BC-REG-31045/2014",
    primaryDomains: ["REAL_ESTATE_PROPERTY", "GENERAL_CIVIL"],
    rating: 4.75,
    activeWorkload: 3,
    maxCapacity: 6,
    avgSlaHours: 4.0,
    isVerified: true
  }
];

export function runDispatchAlgorithm(
  contract: DispatchContract,
  lawyers: DispatchLawyer[],
  userPriorLawyers: Record<string, string[]> = {}
): DispatchDecision | null {
  const eligible = lawyers.filter(
    (l) => l.isVerified && l.activeWorkload < l.maxCapacity
  );

  if (eligible.length === 0) return null;

  let bestLawyer: DispatchLawyer | null = null;
  let bestScore = -Infinity;
  let bestReason = "";

  const wDomain = 0.40;
  const wRating = 0.20;
  const wWorkload = 0.20;
  const wAffinity = 0.15;
  const wUrgency = 0.10;

  for (const lawyer of eligible) {
    // 1. Domain match
    const domainMatch = lawyer.primaryDomains.includes(contract.domain) ? 1.0 : 0.15;

    // 2. Rating
    const ratingScore = Math.min(1.0, lawyer.rating / 5.0);

    // 3. Workload penalty
    const workloadPenalty = Math.min(1.0, lawyer.activeWorkload / lawyer.maxCapacity);

    // 4. Affinity bonus
    const priorIds = userPriorLawyers[contract.userId] || [];
    const affinityBonus = priorIds.includes(lawyer.id) ? 1.0 : 0.0;

    // 5. Urgency factor
    const urgencyBoost =
      contract.priority === "HIGH" || contract.priority === "URGENT"
        ? Math.max(0, 1.0 - lawyer.avgSlaHours / 8.0)
        : 0.0;

    const score =
      wDomain * domainMatch +
      wRating * ratingScore -
      wWorkload * workloadPenalty +
      wAffinity * affinityBonus +
      wUrgency * urgencyBoost;

    if (score > bestScore) {
      bestScore = score;
      bestLawyer = lawyer;

      const reasons: string[] = [];
      if (domainMatch >= 1.0) reasons.push("Domain Specialist");
      if (affinityBonus > 0) reasons.push("Client Continuity");
      if (workloadPenalty < 0.4) reasons.push("Optimal SLA Capacity");
      reasons.push(`${lawyer.rating.toFixed(2)}★ Rating`);
      bestReason = reasons.join(" • ");
    }
  }

  if (!bestLawyer) return null;

  return {
    contractId: contract.id,
    userId: contract.userId,
    lawyer: bestLawyer,
    score: Math.round(bestScore * 1000) / 1000,
    reason: bestReason
  };
}
