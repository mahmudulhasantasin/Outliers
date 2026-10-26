/**
 * Typed API hooks for all backend modules.
 * Import these in page components instead of using dummy data.
 */
import api from "@/lib/api";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ────────────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────────────

export type HITLStatus =
  | "NOT_REQUESTED"
  | "QUEUED_FOR_LAWYER"
  | "OFFERED"
  | "ASSIGNED"
  | "IN_REVIEW"
  | "COMPLETED"
  | "REJECTED_BY_LAWYER"
  | "EXPIRED"
  | "REFUNDED"
  | "DISPUTED";

export interface HITLStatusConfig {
  labelEn: string;
  labelBn: string;
  color: string;
  descriptionEn: string;
  descriptionBn: string;
  isTerminal: boolean;
}

export const HITL_STATUS_CONFIG: Record<string, HITLStatusConfig> = {
  NOT_REQUESTED: {
    labelEn: "AI Analysis Only",
    labelBn: "শুধু এআই বিশ্লেষণ",
    color: "bg-neutral-100 text-neutral-700 border-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700",
    descriptionEn: "AI-only analysis. Request lawyer verification for certified review.",
    descriptionBn: "শুধুমাত্র এআই বিশ্লেষণ সম্পন্ন। প্রত্যায়িত পর্যালোচনার জন্য আইনজীবীর যাচাইয়ের অনুরোধ করুন।",
    isTerminal: false,
  },
  QUEUED_FOR_LAWYER: {
    labelEn: "Finding Lawyer…",
    labelBn: "আইনজীবী খোঁজা হচ্ছে…",
    color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800",
    descriptionEn: "We are assigning an available verified advocate to your contract.",
    descriptionBn: "আমরা আপনার চুক্তির জন্য একজন নিবন্ধিত আইনজীবী বরাদ্দ করছি।",
    isTerminal: false,
  },
  OFFERED: {
    labelEn: "Offer Sent",
    labelBn: "অফার পাঠানো হয়েছে",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800",
    descriptionEn: "A lawyer has received the offer. Awaiting acceptance (3h window).",
    descriptionBn: "আইনজীবীর নিকট অফার পাঠানো হয়েছে। গ্রহণের অপেক্ষায় রয়েছে (৩ ঘণ্টা সময়)।",
    isTerminal: false,
  },
  ASSIGNED: {
    labelEn: "In Progress",
    labelBn: "পর্যালোচনা চলছে",
    color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
    descriptionEn: "A lawyer has accepted and is actively reviewing your contract.",
    descriptionBn: "আইনজীবী চুক্তিটি গ্রহণ করেছেন এবং পর্যালোচনা করছেন।",
    isTerminal: false,
  },
  IN_REVIEW: {
    labelEn: "In Review",
    labelBn: "পর্যালোচনাধীন",
    color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
    descriptionEn: "Active detailed legal review underway.",
    descriptionBn: "আইনজীবী কর্তৃক বিস্তারিত আইনি পর্যালোচনা চলমান।",
    isTerminal: false,
  },
  COMPLETED: {
    labelEn: "Verified ✓",
    labelBn: "যাচাইকৃত ✓",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
    descriptionEn: "Contract reviewed and verified by a licensed advocate.",
    descriptionBn: "লাইসেন্সধারী আইনজীবী কর্তৃক চুক্তিটি পর্যালোচিত ও প্রত্যায়িত।",
    isTerminal: true,
  },
  REJECTED_BY_LAWYER: {
    labelEn: "Re-queuing…",
    labelBn: "পুনরায় বরাদ্দ হচ্ছে…",
    color: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/60 dark:text-yellow-300 dark:border-yellow-800",
    descriptionEn: "Previous lawyer declined. Reassigning to another advocate.",
    descriptionBn: "পূর্ববর্তী আইনজীবী অপরাগতা প্রকাশ করায় অন্য আইনজীবীকে বরাদ্দ দেওয়া হচ্ছে।",
    isTerminal: false,
  },
  EXPIRED: {
    labelEn: "Expired",
    labelBn: "মেয়াদ উত্তীর্ণ",
    color: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
    descriptionEn: "Review SLA window has passed. Please contact support.",
    descriptionBn: "পর্যালোচনার সময়সীমা উত্তীর্ণ হয়েছে। অনুগ্রহ করে সহায়তায় যোগাযোগ করুন।",
    isTerminal: true,
  },
  REFUNDED: {
    labelEn: "Refunded",
    labelBn: "রিফান্ড সম্পন্ন",
    color: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800",
    descriptionEn: "No lawyers were available. Credits refunded automatically.",
    descriptionBn: "কোনো আইনজীবী উপলব্ধ না থাকায় ক্রেডিট স্বয়ংক্রিয়ভাবে ফেরত দেওয়া হয়েছে।",
    isTerminal: true,
  },
  DISPUTED: {
    labelEn: "Disputed",
    labelBn: "বিরোধ নিষ্পত্তিধীন",
    color: "bg-red-100 text-red-800 border-red-300 dark:bg-red-950/80 dark:text-red-300 dark:border-red-800",
    descriptionEn: "Under dispute resolution.",
    descriptionBn: "বিরোধ পর্যালোচনার অধীনে রয়েছে।",
    isTerminal: true,
  },
};

export interface ContractHistoryItem {
  id: string | number;
  contract_id: string | number;
  memo_id?: string | number;
  title: string;
  file_name: string;
  status: string;
  hitl_status: string;
  overall_risk?: string;
  risk_grade?: string;
  risk_score: number | null;
  created_at: string;
  updated_at?: string;
  download_url?: string;
  is_lawyer_verified?: boolean;
}

export interface ContractAuditResult {
  contract_id: string | number;
  memo_id?: string | number;
  file_name?: string;
  title?: string;
  status?: string;
  overall_risk?: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  risk_score: number;
  risk_grade?: string;
  summary?: string;
  executive_summary?: string;
  high_risk_count?: number;
  medium_risk_count?: number;
  compliant_count?: number;
  counts?: {
    high_risk?: number;
    review_needed?: number;
    compliant?: number;
    CRITICAL?: number;
    HIGH?: number;
    MODERATE?: number;
    LOW?: number;
  };
  clauses: ContractClause[];
  hitl_status?: HITLStatus | string;
  lawyer_name?: string | null;
  lawyer_notes?: string | null;
  lawyer_signature?: string | null;
  completed_at?: string | null;
  created_at?: string;
}

export interface ContractClause {
  id?: string;
  clause_number: string | number;
  title?: string;
  clause_title?: string;
  risk_level: "CRITICAL" | "HIGH" | "MEDIUM" | "MODERATE" | "LOW" | "COMPLIANT" | "High Risk" | "Review Needed" | "Compliant";
  original_text: string;
  issue_summary?: string;
  detailed_analysis?: string;
  legal_explanation?: string;
  redline_suggestion?: string;
  proposed_safe_redline?: string | null;
  statute_reference?: string;
  statute_citation?: string;
  is_compliant?: boolean;
  key_obligations?: string[];
}

export interface DownloadUrlResponse {
  download_url: string;
  is_lawyer_verified?: boolean;
  expires_in_seconds?: number;
}

export interface VerificationRequestResponse {
  status?: string;
  memo_id: string | number;
  message: string;
  credits_deducted?: number;
}

// ────────────────────────────────────────────────────────────────────────────
// CONTRACT AUDIT HOOKS
// ────────────────────────────────────────────────────────────────────────────

/** Upload a contract file for AI audit (POST /api/contracts/upload) */
export async function uploadContract(
  file: File,
  title?: string
): Promise<ContractAuditResult> {
  const formData = new FormData();
  const fileTitle = title || file.name.replace(/\.[^/.]+$/, "") || "Contract Document";
  formData.append("title", fileTitle);
  formData.append("file", file);
  return api.upload<ContractAuditResult>("/api/contracts/upload", formData);
}

/** Get user's contract audit history (GET /api/contracts/history) */
export async function getContractHistory(
  limit: number = 50,
  offset: number = 0
): Promise<ContractHistoryItem[]> {
  const data = await api.get<any[]>(`/api/contracts/history?limit=${limit}&offset=${offset}`);
  if (!Array.isArray(data)) return [];

  return data.map((item: any) => {
    const cId = item.contract_id ?? item.id ?? "";
    const title = item.title ?? item.file_name ?? "Contract Document";
    const status = item.hitl_status ?? item.status ?? "NOT_REQUESTED";
    const risk = item.overall_risk ?? item.risk_grade ?? "MODERATE";
    const isVerified = status === "COMPLETED" || item.is_lawyer_verified === true;
    return {
      id: cId,
      contract_id: cId,
      memo_id: item.memo_id,
      title,
      file_name: title,
      status,
      hitl_status: status,
      overall_risk: risk,
      risk_grade: risk,
      risk_score: typeof item.risk_score === "number" ? item.risk_score : null,
      created_at: item.created_at || new Date().toISOString(),
      updated_at: item.updated_at || item.created_at,
      download_url: item.download_url,
      is_lawyer_verified: isVerified,
    };
  });
}

/** Get a signed download URL for a contract (GET /api/contracts/{contract_id}/download) */
export async function getContractDownloadUrl(
  contractId: string | number
): Promise<DownloadUrlResponse> {
  const data = await api.get<any>(`/api/contracts/${contractId}/download`);
  return {
    download_url: data?.download_url ?? "",
    is_lawyer_verified: Boolean(data?.is_lawyer_verified),
    expires_in_seconds: data?.expires_in_seconds,
  };
}

/** Request lawyer verification for a contract (POST /api/contracts/{contract_id}/request-verification) */
export async function requestLawyerVerification(
  contractId: string | number
): Promise<VerificationRequestResponse> {
  return api.post<VerificationRequestResponse>(
    `/api/contracts/${contractId}/request-verification`,
    {}
  );
}

/** Delete a contract (soft delete) (DELETE /api/contracts/{contract_id}) */
export async function deleteContract(
  contractId: string | number
): Promise<{ status: string; message: string }> {
  return api.delete<{ status: string; message: string }>(`/api/contracts/${contractId}`);
}

/** Get specific contract details by ID (GET /api/contracts/{id}) */
export async function getContractDetail(contractId: string | number): Promise<ContractAuditResult> {
  return api.get<ContractAuditResult>(`/api/contracts/${contractId}`);
}

// ────────────────────────────────────────────────────────────────────────────
// CHAT TYPES & HOOKS
// ────────────────────────────────────────────────────────────────────────────

export interface ChatSession {
  id: string | number;
  session_id: string | number;
  title: string;
  mode?: string;
  status?: "active" | "closed" | string;
  message_count?: number;
  message_limit?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ChatMessage {
  id?: string | number;
  role: "user" | "assistant";
  content: string;
  citations?: CitedSection[] | null;
  cited_sections?: CitedSection[] | null;
  cited_cases?: CitedCase[] | null;
  created_at?: string;
}

export interface ChatHistoryMessage {
  role: "user" | "assistant";
  content: string;
  citations?: CitedSection[] | null;
  cited_cases?: CitedCase[] | null;
  created_at?: string;
}

export interface ChatSessionHistoryResponse {
  session_id: string | number;
  mode?: string;
  message_count?: number;
  message_limit?: number;
  messages: ChatHistoryMessage[];
}

export interface CitedSection {
  act?: string;
  act_title?: string;
  section?: string;
  section_number?: string;
  title?: string;
  provision_summary?: string;
  relevance?: string;
  relevance_summary?: string;
  url?: string;
}

export interface CitedCase {
  case_name: string;
  ruling?: string;
  relevance?: string;
}

export interface DetailedChatResponse {
  detailed_answer: string;
  cited_sections?: CitedSection[];
  cited_cases?: CitedCase[];
  suggested_next_steps?: string[];
}

export interface ChatQueryRequest {
  session_id: string | number;
  query: string;
  contract_id?: string | number | null;
}

export interface ChatQueryResponse {
  session_id: string | number;
  user_query?: string;
  response: DetailedChatResponse | string;
  credits_remaining?: number;
  credits_source?: string;
  language_detected?: string;
  cited_sections?: CitedSection[];
}

export interface CreateSessionResponse {
  session_id: string | number;
  id: string | number;
  mode?: string;
  message_limit?: number;
  title: string;
  status?: string;
  created_at?: string;
}

/** List all chat sessions for the current user (GET /api/chat/sessions) */
export async function listChatSessions(): Promise<ChatSession[]> {
  const data = await api.get<any[]>("/api/chat/sessions");
  if (!Array.isArray(data)) return [];
  return data.map((s: any) => {
    const sid = s.session_id ?? s.id ?? "";
    return {
      session_id: sid,
      id: sid,
      title: s.title || "Legal Consultation",
      mode: s.mode || "GENERAL",
      status: s.status || "active",
      message_count: typeof s.message_count === "number" ? s.message_count : 0,
      message_limit: typeof s.message_limit === "number" ? s.message_limit : 5,
      created_at: s.created_at,
      updated_at: s.updated_at || s.created_at,
    };
  });
}

/** Create a new chat session (POST /api/chat/sessions) */
export async function createChatSession(
  title?: string,
  mode: "GENERAL" | "LAWYER_RESEARCH" | "USER_CONTRACT" = "GENERAL",
  contract_id?: string | number | null
): Promise<CreateSessionResponse> {
  const parsedContractId = contract_id != null ? (typeof contract_id === "string" ? parseInt(contract_id, 10) || contract_id : contract_id) : null;
  const payload: Record<string, unknown> = {
    title: title ?? (mode === "USER_CONTRACT" ? "Contract Chat" : "Legal Question"),
    mode,
    contract_id: parsedContractId,
  };
  const data = await api.post<Record<string, unknown>>("/api/chat/sessions", payload);
  const sid = (data.session_id ?? data.id ?? "") as string | number;
  return {
    session_id: sid,
    id: sid,
    mode: (data.mode as string) ?? mode,
    message_limit: (data.message_limit as number) ?? 5,
    title: (data.title as string) ?? (payload.title as string),
    status: (data.status as string) || "active",
    created_at: data.created_at as string,
  };
}

/** Get message history for a session (GET /api/chat/sessions/{session_id}) */
export async function getChatSessionHistory(
  sessionId: string | number
): Promise<ChatSessionHistoryResponse> {
  const sid = typeof sessionId === "string" ? parseInt(sessionId, 10) || sessionId : sessionId;
  const raw = await api.get<any>(`/api/chat/sessions/${sid}`);

  if (raw && Array.isArray(raw.messages)) {
    return {
      session_id: raw.session_id ?? sid,
      mode: raw.mode,
      message_count: raw.message_count ?? raw.messages.length,
      message_limit: raw.message_limit ?? 5,
      messages: raw.messages.map((m: any) => ({
        role: m.role as "user" | "assistant",
        content: m.content || "",
        citations: m.citations || m.cited_sections || null,
        cited_cases: m.cited_cases || null,
        created_at: m.created_at,
      })),
    };
  }

  if (Array.isArray(raw)) {
    return {
      session_id: sid,
      message_count: raw.length,
      message_limit: 5,
      messages: raw.map((m: any) => ({
        role: m.role as "user" | "assistant",
        content: m.content || "",
        citations: m.citations || m.cited_sections || null,
        cited_cases: m.cited_cases || null,
        created_at: m.created_at,
      })),
    };
  }

  return {
    session_id: sid,
    message_count: 0,
    message_limit: 5,
    messages: [],
  };
}

/** Send a query message (POST /api/chat/query) */
export async function sendChatQuery(req: ChatQueryRequest): Promise<ChatQueryResponse> {
  const sid = typeof req.session_id === "string" ? parseInt(req.session_id, 10) || req.session_id : req.session_id;
  const payload: Record<string, unknown> = {
    session_id: sid,
    query: req.query,
  };
  if (req.contract_id != null) {
    payload.contract_id = typeof req.contract_id === "string" ? parseInt(req.contract_id, 10) || req.contract_id : req.contract_id;
  }
  const data = await api.post<ChatQueryResponse>("/api/chat/query", payload);
  return data;
}

/** Close a chat session (POST /api/chat/sessions/{session_id}/close) */
export async function closeChatSession(sessionId: string | number): Promise<void> {
  const sid = typeof sessionId === "string" ? parseInt(sessionId, 10) || sessionId : sessionId;
  await api.post(`/api/chat/sessions/${sid}/close`);
}

// ────────────────────────────────────────────────────────────────────────────
// LAWYER TYPES & HOOKS
// ────────────────────────────────────────────────────────────────────────────

export interface LawyerQueueItem {
  memo_id: string | number;
  contract_id: string | number;
  file_name?: string;
  contract_title?: string;
  domain?: string;
  overall_risk?: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  priority?: "NORMAL" | "MEDIUM" | "HIGH" | "URGENT";
  risk_score: number;
  payout_bdt?: number;
  fee_credits?: number;
  offered_at?: string;
  expires_at?: string;
  offer_expires_at?: string;
  time_left_seconds?: number;
}

export interface ActiveTask {
  memo_id: string | number;
  contract_id: string | number;
  file_name?: string;
  contract_title?: string;
  domain?: string;
  overall_risk?: string;
  priority?: string;
  risk_score?: number;
  accepted_at?: string;
  sla_deadline?: string;
  submit_deadline?: string;
  hours_left?: number;
  status?: string;
  hitl_status?: string;
  payout_bdt?: number;
  client_notes?: string;
  clauses_analysis?: any[];
}

export interface EarningsDashboard {
  wallet_balance_bdt?: number;
  total_earned_bdt?: number;
  total_withdrawn_bdt?: number;
  pending_withdrawals_bdt?: number;
  completed_reviews: number;
  rating?: number | null;
  avg_rating?: number | null;
  active_tasks?: number;
  total_earned_credits?: number;
  pending_payout_credits?: number;
  recent_earnings?: EarningItem[];
}

export interface EarningItem {
  memo_id: string | number;
  contract_file: string;
  credits_earned?: number;
  payout_bdt?: number;
  completed_at: string;
}

export interface WithdrawalRequest {
  id: string | number;
  amount_bdt: number;
  amount_credits?: number;
  bkash_number: string;
  account_holder_name?: string;
  status: string;
  requested_at: string;
  processed_at?: string;
  admin_note?: string;
  payout_trx_id?: string;
}

export interface SubmitReviewClauseItem {
  clause_number?: string;
  clause_title?: string;
  risk_level?: string;
  original_text?: string;
  statute_reference?: string;
  legal_explanation?: string;
  proposed_safe_redline?: string;
  is_compliant?: boolean;
}

export interface SubmitReviewRequest {
  notes?: string;
  lawyer_notes?: string;
  risk_override?: "HIGH" | "MEDIUM" | "LOW" | "COMPLIANT" | null;
  verified?: boolean;
  updated_clauses?: SubmitReviewClauseItem[];
  signature_url?: string;
  signed_pdf_url?: string;
}

export interface SubmitReviewResponse {
  status: string;
  memo_id: string | number;
  earned_bdt?: number;
  new_wallet_balance?: number;
}

export interface OnboardLawyerApiRequest {
  bar_council_id?: string;
  bar_council_no?: string;
  experience_years?: number;
  specializations?: string[];
  field_of_law?: string;
  bar_association?: string;
  chamber_name?: string;
}

/** Submit lawyer onboarding application */
export async function onboardLawyerApi(
  req: OnboardLawyerApiRequest
): Promise<{ status: string; message: string }> {
  const body = {
    bar_council_id: req.bar_council_id || req.bar_council_no || "",
    experience_years: req.experience_years ?? 3,
    specializations:
      req.specializations || (req.field_of_law ? [req.field_of_law] : ["Contract Law"]),
  };
  return api.post<{ status: string; message: string }>("/api/auth/onboard/lawyer", body);
}

/** Get lawyer's pending offer queue (GET /api/lawyer/queue) */
export async function getLawyerQueue(): Promise<LawyerQueueItem[]> {
  try {
    const res = await api.get<LawyerQueueItem[]>("/api/lawyer/queue");
    if (Array.isArray(res)) return res;
    return [];
  } catch {
    return [];
  }
}

/** Accept a contract offer (POST /api/lawyer/queue/{memo_id}/accept) */
export async function acceptOffer(
  memoId: string | number
): Promise<{ status: string; memo_id: string | number; submit_deadline?: string }> {
  return api.post<{ status: string; memo_id: string | number; submit_deadline?: string }>(
    `/api/lawyer/queue/${memoId}/accept`
  );
}

/** Decline a contract offer (POST /api/lawyer/queue/{memo_id}/decline) */
export async function declineOffer(
  memoId: string | number,
  reason: string = "Outside my specialization area."
): Promise<{ status: string; message: string }> {
  return api.post<{ status: string; message: string }>(
    `/api/lawyer/queue/${memoId}/decline`,
    { reason }
  );
}

/** Get lawyer's active tasks (GET /api/lawyer/active) */
export async function getActiveTasks(): Promise<ActiveTask[]> {
  try {
    const res = await api.get<ActiveTask[]>("/api/lawyer/active");
    if (Array.isArray(res)) return res;
    return [];
  } catch {
    return [];
  }
}

// ✅ NEW: Upload signature or signed PDF
export async function uploadLawyerProof(file: File): Promise<{ file_path: string }> {
  const formData = new FormData();
  formData.append("file", file);
  return api.upload<{ file_path: string }>("/api/lawyer/upload-proof", formData);
}

/** Submit a review for a contract (POST /api/lawyer/active/{memo_id}/submit) */
export async function submitReview(
  memoId: string | number,
  req: SubmitReviewRequest
): Promise<SubmitReviewResponse> {
  const payload = {
    notes: req.notes || req.lawyer_notes || "",
    lawyer_notes: req.lawyer_notes || req.notes || "",
    risk_override: req.risk_override ?? null,
    verified: req.verified ?? true,
    updated_clauses: req.updated_clauses || [],
    // ✅ Removed fake hardcoded fallbacks
    signature_url: req.signature_url || "",
    signed_pdf_url: req.signed_pdf_url || "",
  };
  return api.post<SubmitReviewResponse>(`/api/lawyer/active/${memoId}/submit`, payload);
}

/** Start a contract review chat session (POST /api/lawyer/active/{memo_id}/chat-session) */
export async function startContractReviewChat(
  memoId: string | number
): Promise<CreateSessionResponse> {
  return api.post<CreateSessionResponse>(`/api/lawyer/active/${memoId}/chat-session`);
}

/** Get earnings dashboard (GET /api/lawyer/earnings) */
export async function getLawyerEarnings(): Promise<EarningsDashboard> {
  const data = await api.get<any>("/api/lawyer/earnings");
  const walletBdt = Number(data.wallet_balance_bdt ?? data.total_earned_credits ?? 0);
  const totalEarnedBdt = Number(data.total_earned_bdt ?? data.total_earned_credits ?? 0);
  const totalWithdrawnBdt = Number(data.total_withdrawn_bdt ?? 0);
  const pendingWithdrawalsBdt = Number(data.pending_withdrawals_bdt ?? data.pending_payout_credits ?? 0);
  const completed = Number(data.completed_reviews ?? 0);
  const rating = Number(data.rating ?? data.avg_rating ?? 0);
  const activeTasks = Number(data.active_tasks ?? 0);

  return {
    wallet_balance_bdt: walletBdt,
    total_earned_bdt: totalEarnedBdt,
    total_withdrawn_bdt: totalWithdrawnBdt,
    pending_withdrawals_bdt: pendingWithdrawalsBdt,
    completed_reviews: completed,
    rating: rating,
    avg_rating: rating,
    active_tasks: activeTasks,
    total_earned_credits: totalEarnedBdt,
    pending_payout_credits: pendingWithdrawalsBdt,
    recent_earnings: Array.isArray(data.recent_earnings) ? data.recent_earnings : [],
  };
}

/** List withdrawal requests (GET /api/lawyer/withdrawals) */
export async function listWithdrawals(): Promise<WithdrawalRequest[]> {
  try {
    const data = await api.get<any[]>("/api/lawyer/withdrawals");
    if (!Array.isArray(data)) return [];
    return data.map((w: any) => ({
      id: w.id,
      amount_bdt: w.amount_bdt ?? w.amount_credits ?? 0,
      amount_credits: w.amount_credits ?? w.amount_bdt ?? 0,
      bkash_number: w.bkash_number || "",
      account_holder_name: w.account_holder_name || "Advocate",
      status: (w.status || "PENDING").toUpperCase(),
      requested_at: w.requested_at || new Date().toISOString(),
      processed_at: w.processed_at,
      admin_note: w.admin_note,
      payout_trx_id: w.payout_trx_id,
    }));
  } catch {
    return [];
  }
}

/** Request a withdrawal (BDT via bKash) (POST /api/lawyer/withdrawals/request) */
export async function requestWithdrawal(
  amountBdt: number,
  bkashNumber: string,
  accountHolderName: string = "Advocate"
): Promise<WithdrawalRequest> {
  return api.post<WithdrawalRequest>("/api/lawyer/withdrawals/request", {
    amount_bdt: amountBdt,
    bkash_number: bkashNumber,
    account_holder_name: accountHolderName,
  });
}

// ────────────────────────────────────────────────────────────────────────────
// ENTERPRISE ADMIN TYPES & HOOKS
// ────────────────────────────────────────────────────────────────────────────

export interface CompanyDashboard {
  enterprise: {
    id: number;
    name: string;
    referral_code: string;
    credit_balance: number;
    member_limit: number;
  };
  members: {
    total: number;
    active: number;
    pending_approval: number;
    slots_remaining: number;
  };
  credits: {
    pool_balance: number;
    used_this_month: number;
  };
}

export interface CompanyMember {
  user_id: string | number;
  email: string;
  full_name: string;
  phone?: string | null;
  company_role: "ADMIN" | "MANAGER" | "MEMBER" | null;
  department?: string | null;
  approval_status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED" | null;
  quota_total: number;
  quota_used: number;
  quota_remaining: number;
  joined_at?: string | null;
  last_login_at?: string | null;
  is_active: boolean;
}

export interface PendingMember {
  user_id: string | number;
  email: string;
  full_name: string;
  phone?: string | null;
  requested_at: string;
  is_verified: boolean;
}

export interface Playbook {
  id: string;
  title: string;
  version: string;
  is_active: boolean;
  rule_count: number;
  created_at: string;
}

/** Get company dashboard */
export async function getCompanyDashboard(): Promise<CompanyDashboard> {
  return api.get<CompanyDashboard>("/api/company/dashboard");
}

/** List company members */
export async function listMembers(status?: string): Promise<CompanyMember[]> {
  const query = status ? `?status=${status}` : "";
  return api.get<CompanyMember[]>(`/api/company/members${query}`);
}

/** List pending member join requests */
export async function listPendingMembers(): Promise<PendingMember[]> {
  return api.get<PendingMember[]>("/api/company/members/pending");
}

export interface ApproveMemberPayload {
  company_role: "ADMIN" | "MANAGER" | "MEMBER";
  department?: string | null;
  initial_quota?: number;
}

/** Approve a member */
export async function approveMember(userId: string, payload: ApproveMemberPayload): Promise<void> {
  await api.post(`/api/company/members/${userId}/approve`, { ...payload });
}

/** Reject a member */
export async function rejectMember(userId: string, reason: string): Promise<void> {
  await api.post(`/api/company/members/${userId}/reject`, { reason });
}

/** Suspend a member */
export async function suspendMember(userId: string, reason: string): Promise<void> {
  await api.post(`/api/company/members/${userId}/suspend`, { reason });
}

/** Remove a member */
export async function removeMember(userId: string): Promise<void> {
  await api.post(`/api/company/members/${userId}/remove`);
}

/** Reactivate a member */
export async function reactivateMember(userId: string): Promise<void> {
  await api.post(`/api/company/members/${userId}/reactivate`);
}

/** Adjust member credit quota (delta: +/- credits) */
export async function adjustMemberQuota(
  userId: string,
  delta: number,
  reason: string = "Admin quota adjustment"
): Promise<void> {
  await api.post(`/api/company/members/${userId}/quota`, { delta, reason });
}

export interface UploadPlaybookResponse {
  status: string;
  playbook_id: string;
  title: string;
  rules_extracted_count: number;
  rules: any[];
}

/** Upload a company playbook (JSON or PDF) */
export async function uploadPlaybook(file: File, title?: string): Promise<UploadPlaybookResponse> {
  const formData = new FormData();
  formData.append("title", title || file.name.replace(/\.[^/.]+$/, "") || "Corporate Playbook");
  formData.append("file", file);
  return api.upload<UploadPlaybookResponse>("/api/company/playbook/upload", formData);
}

/** List company playbooks */
export async function listPlaybooks(): Promise<Playbook[]> {
  try {
    const res = await api.get<any[]>("/api/company/playbooks");
    if (!Array.isArray(res)) return [];
    return res.map((item) => ({
      id: item.id,
      title: item.title,
      version: item.version ?? "1.0",
      is_active: item.is_active,
      rule_count: item.rules_count ?? item.rule_count ?? 0,
      created_at: item.created_at,
    }));
  } catch {
    return [];
  }
}

/** Delete a playbook */
export async function deletePlaybook(playbookId: string): Promise<void> {
  await api.delete(`/api/company/playbooks/${playbookId}`);
}

/** Activate a playbook */
export async function activatePlaybook(playbookId: string): Promise<void> {
  await api.post(`/api/company/playbooks/${playbookId}/activate`);
}

/** Get quota summary */
export async function getQuotaSummary(): Promise<{
  pool_balance: number;
  total_quota_allocated: number;
  total_quota_used: number;
  total_quota_remaining: number;
  unallocated_pool: number;
}> {
  return api.get<any>("/api/company/quota/summary");
}

// ────────────────────────────────────────────────────────────────────────────
// SETTINGS TYPES & HOOKS
// ────────────────────────────────────────────────────────────────────────────

export interface UserSettings {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  avatar_url?: string;
  role: string;
  credit_balance: number;
  is_verified: boolean;
  is_phone_verified: boolean;
  lawyer?: LawyerSettings;
  enterprise?: any;
}

export interface LawyerSettings {
  bar_council_id?: string;
  specializations?: string[];
  availability?: string;
  wallet_balance_bdt?: number;
  completed_reviews?: number;
  rating?: number;
  monthly_free_chat_used?: number;
  monthly_free_chat_remaining?: number;
  max_concurrent_tasks?: number;
  auto_accept_offers?: boolean;
}

export interface UpdateProfileRequest {
  full_name?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_new_password: string;
}

export interface UpdateLawyerSettingsRequest {
  specializations?: string[];
  availability?: "AVAILABLE" | "UNAVAILABLE" | "ON_LEAVE";
  bio?: string;
  max_concurrent_tasks?: number;
  auto_accept_offers?: boolean;
}

/** Get current user settings */
export async function getMySettings(): Promise<UserSettings> {
  return api.get<UserSettings>("/api/settings/me");
}

/** Update profile */
export async function updateProfile(req: UpdateProfileRequest): Promise<UserSettings> {
  return api.patch<UserSettings>("/api/settings/profile", {
    full_name: req.full_name,
    phone: req.phone,
  });
}

/** Change password */
export async function changePassword(req: ChangePasswordRequest): Promise<{ message: string }> {
  return api.post<{ message: string }>("/api/settings/change-password", {
    current_password: req.current_password,
    new_password: req.new_password,
  });
}

/** Upload profile photo (POST /api/settings/upload-photo) */
export async function uploadProfilePhoto(
  file: File
): Promise<{ profile_photo_url?: string; url?: string; avatar_url?: string; status?: string }> {
  const formData = new FormData();
  formData.append("file", file);
  return api.upload<{ profile_photo_url?: string; url?: string; avatar_url?: string; status?: string }>(
    "/api/settings/upload-photo",
    formData
  );
}

/** Update lawyer-specific settings */
export async function updateLawyerSettings(
  req: UpdateLawyerSettingsRequest
): Promise<UserSettings> {
  return api.patch<UserSettings>("/api/settings/lawyer", req as unknown as Record<string, unknown>);
}

// ────────────────────────────────────────────────────────────────────────────
// PAYMENT TYPES & HOOKS (bKash Manual Flow - Section 4)
// ────────────────────────────────────────────────────────────────────────────

export interface CreditPackage {
  id: number | string;
  name: string;
  description: string;
  price_bdt: number;
  base_credits?: number;
  bonus_credits?: number;
  total_credits: number;
  credits: number;
  badge_text?: string | null;
  is_popular?: boolean;
  features?: string[];
  display_order?: number;
}

export interface BkashPaymentInstructions {
  bkash_number: string;
  bkash_type?: string;
  instructions_en?: string;
  instructions_bn?: string;
}

export interface InitiatePaymentResponse {
  payment_id: number | string;
  reference_code: string;
  amount_bdt: number;
  total_credits: number;
  credits: number;
  package_name?: string;
  expires_at: string;
  bkash: BkashPaymentInstructions;
  bkash_number?: string;
  instructions?: string;
  next_step?: string;
}

export interface SubmitTrxResponse {
  status: string;
  payment_id: number | string;
  message: string;
  current_status: string;
}

export interface CancelPaymentResponse {
  status: string;
}

export interface Payment {
  id: number | string;
  reference_code: string;
  amount_bdt: number;
  credits_to_grant?: number;
  bonus_credits?: number;
  total_credits: number;
  credits: number;
  package_name?: string;
  package?: { id: number | string; name: string };
  purpose?: string;
  status: "PENDING" | "PENDING_VERIFICATION" | "APPROVED" | "REJECTED" | "EXPIRED" | string;
  method?: string;
  trx_id?: string;
  bkash_trx_id?: string;
  sender_number?: string;
  admin_note?: string | null;
  created_at: string;
  initiated_at: string;
  updated_at?: string;
  trx_submitted_at?: string | null;
  reviewed_at?: string | null;
  expires_at?: string;
}

export interface PaymentSummary {
  pending_submission: number;
  awaiting_admin: number;
  approved: number;
  rejected: number;
  total_topup_bdt: number;
  total_spent_bdt?: number;
  total_credits_purchased?: number;
  current_balance?: number;
  payment_count?: number;
}

/** List available credit packages (GET /api/payments/packages) */
export async function listPackages(): Promise<CreditPackage[]> {
  const data = await api.get<any[]>("/api/payments/packages");
  if (!Array.isArray(data)) return [];
  return data.map((pkg: any) => {
    const credits = pkg.total_credits ?? pkg.credits ?? 0;
    const isPop = Boolean(pkg.is_popular || (pkg.badge_text && pkg.badge_text.toLowerCase().includes("popular")));
    return {
      id: pkg.id,
      name: pkg.name || "Credit Package",
      description: pkg.description || "",
      price_bdt: pkg.price_bdt ?? 0,
      base_credits: pkg.base_credits,
      bonus_credits: pkg.bonus_credits,
      total_credits: credits,
      credits,
      badge_text: pkg.badge_text ?? (isPop ? "Most Popular" : null),
      is_popular: isPop,
      features: Array.isArray(pkg.features) ? pkg.features : undefined,
      display_order: pkg.display_order ?? 0,
    };
  });
}

/** Initiate a payment for a package (POST /api/payments/initiate) */
export async function initiatePayment(
  packageId: number | string,
  fallbackPackage?: Partial<CreditPackage>
): Promise<InitiatePaymentResponse> {
  const parsedId = typeof packageId === "string" ? parseInt(packageId, 10) || packageId : packageId;

  const data = await api.post<any>("/api/payments/initiate", {
    package_id: parsedId,
  });

  const credits = data.total_credits ?? data.credits ?? fallbackPackage?.total_credits ?? fallbackPackage?.credits ?? 0;
  const bkashObj: BkashPaymentInstructions = data.bkash || {
    bkash_number: data.bkash_number || "01711000000",
    bkash_type: "Merchant",
    instructions_en: data.instructions || "1. Open bKash app.\n2. Choose 'Send Money' or 'Payment'.\n3. Send to bKash Number.\n4. Enter the Reference Code.\n5. Copy the TrxID from confirmation SMS and submit below.",
    instructions_bn: "১. বিকাশ অ্যাপ খুলুন।\n২. 'Send Money' বা 'Payment' নির্বাচন করুন।\n৩. বিকাশ নম্বরে টাকা পাঠান।\n৪. রেফারেন্স ফিল্ডে রেফারেন্স কোডটি দিন।\n৫. কনফার্মেশন এসএমএস থেকে TrxID কপি করে নিচে জমা দিন।",
  };

  return {
    payment_id: data.payment_id,
    reference_code: data.reference_code,
    amount_bdt: data.amount_bdt ?? fallbackPackage?.price_bdt ?? 0,
    total_credits: credits,
    credits,
    package_name: data.package_name ?? fallbackPackage?.name ?? "Credit Package",
    expires_at: data.expires_at || new Date(Date.now() + 86400000).toISOString(),
    bkash: bkashObj,
    bkash_number: bkashObj.bkash_number,
    instructions: bkashObj.instructions_en,
    next_step: data.next_step,
  };
}

/** Submit bKash TRX ID for a payment (POST /api/payments/{payment_id}/submit-trx) */
export async function submitTrxId(
  paymentId: string | number,
  trxId: string,
  senderNumber: string = "01700000000"
): Promise<SubmitTrxResponse> {
  const pid = typeof paymentId === "string" ? parseInt(paymentId, 10) || paymentId : paymentId;
  return await api.post<SubmitTrxResponse>(`/api/payments/${pid}/submit-trx`, {
    trx_id: trxId.trim(),
    sender_number: senderNumber.trim(),
  });
}

/** Cancel a pending payment (POST /api/payments/{payment_id}/cancel) */
export async function cancelPayment(paymentId: string | number): Promise<CancelPaymentResponse> {
  const pid = typeof paymentId === "string" ? parseInt(paymentId, 10) || paymentId : paymentId;
  return await api.post<CancelPaymentResponse>(`/api/payments/${pid}/cancel`);
}

/** List user's payments (GET /api/payments/my) */
export async function listMyPayments(
  status?: string,
  limit: number = 50,
  offset: number = 0
): Promise<Payment[]> {
  let path = `/api/payments/my?limit=${limit}&offset=${offset}`;
  if (status) path += `&status=${status}`;
  const data = await api.get<any[]>(path);
  if (!Array.isArray(data)) return [];

  return data.map((p: any) => {
    const credits = p.total_credits ?? p.credits_to_grant ?? p.credits ?? 0;
    const trx = p.trx_id ?? p.bkash_trx_id ?? "";
    const created = p.created_at ?? p.initiated_at ?? new Date().toISOString();
    return {
      id: p.id,
      reference_code: p.reference_code || `PAY-${p.id}`,
      amount_bdt: p.amount_bdt ?? 0,
      credits_to_grant: p.credits_to_grant ?? credits,
      bonus_credits: p.bonus_credits ?? 0,
      total_credits: credits,
      credits,
      package_name: p.package_name || p.reference_code || "Credit Package",
      purpose: p.purpose || "CREDIT_TOPUP",
      status: (p.status || "PENDING").toUpperCase(),
      method: p.method || "BKASH",
      trx_id: trx,
      bkash_trx_id: trx,
      sender_number: p.sender_number || "",
      admin_note: p.admin_note ?? null,
      created_at: created,
      initiated_at: created,
      updated_at: p.updated_at || created,
      trx_submitted_at: p.trx_submitted_at,
      reviewed_at: p.reviewed_at,
      expires_at: p.expires_at,
    };
  });
}

/** Get a specific payment (GET /api/payments/{payment_id}) */
export async function getPayment(paymentId: string | number): Promise<Payment> {
  const pid = typeof paymentId === "string" ? parseInt(paymentId, 10) || paymentId : paymentId;
  const p = await api.get<any>(`/api/payments/${pid}`);
  const credits = p.total_credits ?? p.credits_to_grant ?? p.credits ?? 0;
  const trx = p.trx_id ?? p.bkash_trx_id ?? "";
  const created = p.created_at ?? p.initiated_at ?? new Date().toISOString();
  return {
    id: p.id,
    reference_code: p.reference_code || `PAY-${p.id}`,
    amount_bdt: p.amount_bdt ?? 0,
    credits_to_grant: p.credits_to_grant ?? credits,
    bonus_credits: p.bonus_credits ?? 0,
    total_credits: credits,
    credits,
    package_name: p.package_name || p.reference_code || "Credit Package",
    purpose: p.purpose || "CREDIT_TOPUP",
    status: (p.status || "PENDING").toUpperCase(),
    method: p.method || "BKASH",
    trx_id: trx,
    bkash_trx_id: trx,
    sender_number: p.sender_number || "",
    admin_note: p.admin_note ?? null,
    created_at: created,
    initiated_at: created,
    updated_at: p.updated_at || created,
    trx_submitted_at: p.trx_submitted_at,
    reviewed_at: p.reviewed_at,
    expires_at: p.expires_at,
  };
}

/** Get payment summary (GET /api/payments/summary/me) */
export async function getPaymentSummary(): Promise<PaymentSummary> {
  const data = await api.get<any>("/api/payments/summary/me");
  const pendingSub = data?.pending_submission ?? 0;
  const awaitingAdm = data?.awaiting_admin ?? 0;
  const approved = data?.approved ?? 0;
  const rejected = data?.rejected ?? 0;
  const totalTopup = data?.total_topup_bdt ?? data?.total_spent_bdt ?? 0;

  return {
    pending_submission: pendingSub,
    awaiting_admin: awaitingAdm,
    approved,
    rejected,
    total_topup_bdt: totalTopup,
    total_spent_bdt: totalTopup,
    total_credits_purchased: data?.total_credits_purchased ?? 0,
    current_balance: data?.current_balance,
    payment_count: pendingSub + awaitingAdm + approved + rejected,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// SYSTEM ADMIN TYPES & HOOKS
// ────────────────────────────────────────────────────────────────────────────

export interface AdminPendingLawyer {
  lawyer_id: string | number;
  user_id?: string | number;
  full_name: string;
  email: string;
  phone?: string;
  bar_council_id: string;
  experience_years: number;
  specializations: string[];
  field_of_law?: string;
  bar_association?: string;
  chamber_name?: string;
  status: "pending" | "verified" | "rejected" | "suspended";
  created_at: string;
}

export interface AdminDashboardStats {
  users: {
    total: number;
    general: number;
    lawyers: number;
    enterprise_admins: number;
    enterprise_members: number;
  };
  pending: {
    lawyers: number;
    enterprises: number;
    payments: number;
    withdrawals: number;
  };
}

/** Get admin dashboard overview stats (GET /api/admin/dashboard) */
export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  return await api.get<AdminDashboardStats>("/api/admin/dashboard");
}

/** Get pending lawyer verification queue (GET /api/admin/lawyers/pending) */
export async function getAdminPendingLawyers(): Promise<AdminPendingLawyer[]> {
  try {
    const res = await api.get<any[]>("/api/admin/lawyers/pending");
    if (!Array.isArray(res)) return [];
    return res.map((item) => ({
      ...item,
      lawyer_id: item.lawyer_id ?? item.id,
      created_at: item.applied_at ?? item.created_at,
    }));
  } catch {
    return [];
  }
}

/** Approve a lawyer application (POST /api/admin/lawyers/{id}/approve) */
export async function approveLawyer(
  id: string | number
): Promise<{ status: string; message: string }> {
  return api.post<{ status: string; message: string }>(`/api/admin/lawyers/${id}/approve`);
}

/** Reject a lawyer application (POST /api/admin/lawyers/{id}/reject) */
export async function rejectLawyer(
  id: string | number,
  reason: string = "Bar Council verification unconfirmed."
): Promise<{ status: string; message: string }> {
  return api.post<{ status: string; message: string }>(`/api/admin/lawyers/${id}/reject`, {
    reason,
  });
}

/** Suspend a lawyer (POST /api/admin/lawyers/{id}/suspend) */
export async function suspendLawyer(
  id: string | number,
  reason: string = "Account suspended by administrator."
): Promise<{ status: string; message: string }> {
  return api.post<{ status: string; message: string }>(`/api/admin/lawyers/${id}/suspend`, {
    reason,
  });
}

/** Get pending withdrawals queue (GET /api/admin/withdrawals/pending) */
export async function getAdminPendingWithdrawals(): Promise<WithdrawalRequest[]> {
  try {
    const res = await api.get<any[]>("/api/admin/withdrawals/pending");
    if (!Array.isArray(res)) return [];
    return res.map((item) => ({
      ...item,
      id: item.withdrawal_id ?? item.id,
    }));
  } catch {
    return [];
  }
}

/** Approve lawyer withdrawal (POST /api/admin/withdrawals/{id}/approve) */
export async function approveAdminWithdrawal(
  id: string | number
): Promise<{ status: string; message: string }> {
  return api.post<{ status: string; message: string }>(`/api/admin/withdrawals/${id}/approve`);
}

/** Mark withdrawal paid with bKash TrxID (POST /api/admin/withdrawals/{id}/mark-paid) */
export async function markAdminWithdrawalPaid(
  id: string | number,
  payoutTrxId: string
): Promise<{ status: string; message: string }> {
  return api.post<{ status: string; message: string }>(
    `/api/admin/withdrawals/${id}/mark-paid`,
    { payout_trx_id: payoutTrxId }
  );
}

/** Reject lawyer withdrawal (POST /api/admin/withdrawals/{id}/reject) */
export async function rejectAdminWithdrawal(
  id: string | number,
  reason: string = "Withdrawal rejected by administrator."
): Promise<{ status: string; message: string }> {
  return api.post<{ status: string; message: string }>(
    `/api/admin/withdrawals/${id}/reject`,
    { reason }
  );
}

/** Delete current user account (soft delete) (DELETE /api/auth/me) */
export async function deleteAccount(): Promise<{ status: string; message: string }> {
  return api.delete<{ status: string; message: string }>("/api/auth/me");
}

// ────────────────────────────────────────────────────────────────────────────
// SYSTEM ADMIN - PAYMENTS & FINANCIALS
// ────────────────────────────────────────────────────────────────────────────

export interface AdminPendingPayment {
  payment_id: number | string;
  reference_code: string;
  amount_bdt: number;
  total_credits: number;
  payer_type: "user" | "enterprise";
  trx_id: string;
  sender_number: string;
  trx_submitted_at: string;
}

/** Get pending bKash payments for verification */
export async function getAdminPendingPayments(): Promise<AdminPendingPayment[]> {
  try {
    const res = await api.get<AdminPendingPayment[]>("/api/admin/payments/pending");
    return Array.isArray(res) ? res : [];
  } catch {
    return [];
  }
}

/** Approve a pending payment */
export async function approveAdminPayment(id: string | number, note?: string): Promise<any> {
  return api.post(`/api/admin/payments/${id}/approve`, { admin_note: note || "Approved via Admin Portal" });
}

// ────────────────────────────────────────────────────────────────────────────
// SYSTEM ADMIN - USERS, ENTERPRISES & FINANCIALS
// ────────────────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: number;
  email: string;
  full_name: string;
  role: string;
  credit_balance: number;
  is_active: boolean;
  is_verified: boolean;
  enterprise_id: number | null;
  created_at: string;
  profile_photo_url?: string | null;
  phone?: string | null;
}

/** Get all users for admin dashboard */
export async function getAdminUsers(search?: string): Promise<AdminUser[]> {
  try {
    const query = search ? `?search=${encodeURIComponent(search)}&limit=50` : "?limit=50";
    const res = await api.get<AdminUser[]>(`/api/admin/users${query}`);
    return Array.isArray(res) ? res : [];
  } catch {
    return [];
  }
}

/** Get specific user details for Admin Profile Modal */
export async function getAdminUserDetail(id: number): Promise<any> {
  return api.get(`/api/admin/users/${id}`);
}

export interface AdminPendingEnterprise {
  enterprise_id: number;
  name: string;
  domain: string;
  referral_code: string;
  member_limit: number;
  billing_email: string;
  requested_admin: { id: number; email: string; full_name: string } | null;
  created_at: string;
}

/** Get pending enterprises */
export async function getAdminPendingEnterprises(): Promise<AdminPendingEnterprise[]> {
  try {
    const res = await api.get<AdminPendingEnterprise[]>("/api/admin/enterprises/pending");
    return Array.isArray(res) ? res : [];
  } catch {
    return [];
  }
}

/** Approve an enterprise */
export async function approveAdminEnterprise(id: number): Promise<any> {
  return api.post(`/api/admin/enterprises/${id}/approve`);
}

export interface AdminFinancials {
  internal_service_costs_bdt: Record<string, number>;
  lawyer_verification_split_bdt: { lawyer_payout: number; platform_fee: number };
  aggregates: {
    total_revenue_bdt: number;
    total_credits_sold: number;
    pending_payouts_bdt: number;
    paid_payouts_bdt: number;
    net_platform_position_bdt: number;
  };
}

/** Get platform financial overview */
export async function getAdminFinancials(): Promise<AdminFinancials | null> {
  try {
    const res = await api.get<AdminFinancials>("/api/admin/financials");
    return res;
  } catch {
    return null;
  }
}

export interface AuditLogItem {
  id: number | string;
  timestamp: string;
  member_name: string;
  department: string;
  module: string;
  category: string;
  credits_consumed: number;
}

export interface SharedContractItem {
  id: number | string;
  contract_id: number | string;
  title: string;
  category: string;
  submitted_by: string;
  submitted_at: string;
  risk_score: number;
  status: string;
  advocate_verified: boolean;
}

export async function getCompanyAuditLogs(): Promise<AuditLogItem[]> {
  try {
    const res = await api.get<AuditLogItem[]>("/api/company/audit-logs");
    return Array.isArray(res) ? res : [];
  } catch {
    return [];
  }
}

export async function getSharedContracts(): Promise<SharedContractItem[]> {
  try {
    const res = await api.get<SharedContractItem[]>("/api/company/shared-contracts");
    return Array.isArray(res) ? res : [];
  } catch {
    return [];
  }
}