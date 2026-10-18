/**
 * Typed API hooks for all backend modules.
 * Import these in page components instead of using dummy data.
 */
import api from "@/lib/api";

// ────────────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────────────

export interface ContractHistoryItem {
  id: string;
  file_name: string;
  status: string; // "pending_audit" | "audited" | "lawyer_requested" | "verified" | "rejected"
  risk_score: number | null;
  risk_grade: string | null;
  created_at: string;
  updated_at: string;
  download_url?: string;
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
    CRITICAL?: number;
    HIGH?: number;
    MODERATE?: number;
    LOW?: number;
  };
  clauses: ContractClause[];
  hitl_status?: string;
  created_at?: string;
}

export interface ContractClause {
  id?: string;
  clause_number: string | number;
  title?: string;
  clause_title?: string;
  risk_level: "CRITICAL" | "HIGH" | "MEDIUM" | "MODERATE" | "LOW" | "COMPLIANT";
  original_text: string;
  issue_summary?: string;
  detailed_analysis?: string;
  legal_explanation?: string;
  redline_suggestion?: string;
  proposed_safe_redline?: string;
  statute_reference?: string;
  statute_citation?: string;
  is_compliant?: boolean;
  key_obligations?: string[];
}

export interface DownloadUrlResponse {
  download_url: string;
  expires_in_seconds: number;
}

export interface VerificationRequestResponse {
  message: string;
  memo_id: string;
}

// ────────────────────────────────────────────────────────────────────────────
// CONTRACT AUDIT HOOKS
// ────────────────────────────────────────────────────────────────────────────

/** Upload a contract file for AI audit */
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

/** Get user's contract audit history */
export async function getContractHistory(
  limit: number = 20,
  offset: number = 0
): Promise<ContractHistoryItem[]> {
  return api.get<ContractHistoryItem[]>(`/api/contracts/history?limit=${limit}&offset=${offset}`);
}

/** Get a signed download URL for a contract */
export async function getContractDownloadUrl(contractId: string | number): Promise<DownloadUrlResponse> {
  return api.get<DownloadUrlResponse>(`/api/contracts/${contractId}/download`);
}

/** Request lawyer verification for a contract */
export async function requestLawyerVerification(
  contractId: string | number
): Promise<VerificationRequestResponse> {
  return api.post<VerificationRequestResponse>(
    `/api/contracts/${contractId}/request-verification`
  );
}

// ────────────────────────────────────────────────────────────────────────────
// CHAT TYPES & HOOKS
// ────────────────────────────────────────────────────────────────────────────

export interface ChatSession {
  id: string | number;
  session_id?: string | number;
  title: string;
  mode?: string;
  status?: "active" | "closed";
  message_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ChatMessage {
  id: string | number;
  role: "user" | "assistant";
  content: string;
  cited_sections?: CitedSection[];
  created_at?: string;
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

export interface DetailedChatResponse {
  detailed_answer: string;
  cited_sections?: CitedSection[];
  suggested_next_steps?: string[];
}

export interface ChatQueryRequest {
  session_id: string | number;
  query: string;
  contract_id?: string | number;
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
  id?: string | number;
  mode?: string;
  message_limit?: number;
  title: string;
  status?: string;
  created_at?: string;
}

/** List all chat sessions for the current user */
export async function listChatSessions(): Promise<ChatSession[]> {
  return api.get<ChatSession[]>("/api/chat/sessions");
}

/** Create a new chat session */
export async function createChatSession(
  title?: string,
  mode: "GENERAL" | "LAWYER_RESEARCH" | "USER_CONTRACT" = "GENERAL",
  contract_id?: string | number
): Promise<CreateSessionResponse> {
  const data = await api.post<Record<string, unknown>>("/api/chat/sessions", {
    title: title ?? "Legal Consultation",
    mode,
    ...(contract_id ? { contract_id } : {}),
  });
  const sid = (data.session_id ?? data.id ?? "") as string | number;
  return {
    session_id: sid,
    id: sid,
    mode: (data.mode as string) ?? mode,
    message_limit: (data.message_limit as number) ?? 5,
    title: (data.title as string) ?? title ?? "Legal Consultation",
  };
}

/** Get message history for a session */
export async function getChatSessionHistory(sessionId: string | number): Promise<ChatMessage[]> {
  return api.get<ChatMessage[]>(`/api/chat/sessions/${sessionId}`);
}

/** Send a query message */
export async function sendChatQuery(req: ChatQueryRequest): Promise<ChatQueryResponse> {
  const sid = typeof req.session_id === "string" ? parseInt(req.session_id, 10) || req.session_id : req.session_id;
  const data = await api.post<ChatQueryResponse>("/api/chat/query", {
    session_id: sid,
    query: req.query,
  });
  return data;
}

/** Close a chat session */
export async function closeChatSession(sessionId: string | number): Promise<void> {
  await api.post(`/api/chat/sessions/${sessionId}/close`);
}

// ────────────────────────────────────────────────────────────────────────────
// LAWYER TYPES & HOOKS
// ────────────────────────────────────────────────────────────────────────────

export interface LawyerQueueItem {
  memo_id: string;
  contract_id: string;
  file_name: string;
  domain: string;
  priority: "NORMAL" | "MEDIUM" | "HIGH" | "URGENT";
  risk_score: number;
  offered_at: string;
  expires_at: string;
  fee_credits: number;
}

export interface ActiveTask {
  memo_id: string;
  contract_id: string;
  file_name: string;
  domain: string;
  priority: string;
  risk_score: number;
  accepted_at: string;
  sla_deadline: string;
  status: string;
  client_notes?: string;
}

export interface EarningsDashboard {
  total_earned_credits: number;
  pending_payout_credits: number;
  completed_reviews: number;
  avg_rating: number | null;
  recent_earnings: EarningItem[];
}

export interface EarningItem {
  memo_id: string;
  contract_file: string;
  credits_earned: number;
  completed_at: string;
}

export interface WithdrawalRequest {
  id: string;
  amount_credits: number;
  bkash_number: string;
  status: string;
  requested_at: string;
  processed_at?: string;
}

export interface SubmitReviewRequest {
  notes: string;
  risk_override?: "HIGH" | "MEDIUM" | "LOW" | "COMPLIANT" | null;
  verified: boolean;
}

/** Get lawyer's pending offer queue */
export async function getLawyerQueue(): Promise<LawyerQueueItem[]> {
  return api.get<LawyerQueueItem[]>("/api/lawyer/queue");
}

/** Accept a contract offer */
export async function acceptOffer(memoId: string): Promise<void> {
  await api.post(`/api/lawyer/queue/${memoId}/accept`);
}

/** Decline a contract offer */
export async function declineOffer(memoId: string): Promise<void> {
  await api.post(`/api/lawyer/queue/${memoId}/decline`);
}

/** Get lawyer's active tasks */
export async function getActiveTasks(): Promise<ActiveTask[]> {
  return api.get<ActiveTask[]>("/api/lawyer/active");
}

/** Submit a review for a contract */
export async function submitReview(memoId: string, req: SubmitReviewRequest): Promise<void> {
  await api.post(`/api/lawyer/active/${memoId}/submit`, {
    notes: req.notes,
    risk_override: req.risk_override ?? null,
    verified: req.verified,
  });
}

/** Start a contract review chat session */
export async function startContractReviewChat(memoId: string): Promise<CreateSessionResponse> {
  return api.post<CreateSessionResponse>(`/api/lawyer/active/${memoId}/chat-session`);
}

/** Get earnings dashboard */
export async function getLawyerEarnings(): Promise<EarningsDashboard> {
  return api.get<EarningsDashboard>("/api/lawyer/earnings");
}

/** List withdrawal requests */
export async function listWithdrawals(): Promise<WithdrawalRequest[]> {
  return api.get<WithdrawalRequest[]>("/api/lawyer/withdrawals");
}

/** Request a withdrawal (BDT via bKash) */
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
  company_name: string;
  verification_status: string;
  member_count: number;
  active_member_count: number;
  total_credits_used: number;
  refer_code: string;
  quota_summary: QuotaSummary;
}

export interface QuotaSummary {
  total_allocated: number;
  total_used: number;
  total_remaining: number;
  member_breakdown: MemberQuota[];
}

export interface MemberQuota {
  user_id: string;
  full_name: string;
  credits_used: number;
  credits_cap: number;
}

export interface CompanyMember {
  user_id: string;
  full_name: string;
  email: string;
  department?: string;
  status: string; // "active" | "pending" | "suspended" | "removed"
  credits_used: number;
  credits_cap: number;
  joined_at?: string;
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
export async function listPendingMembers(): Promise<CompanyMember[]> {
  return api.get<CompanyMember[]>("/api/company/members/pending");
}

/** Approve a member */
export async function approveMember(userId: string): Promise<void> {
  await api.post(`/api/company/members/${userId}/approve`);
}

/** Reject a member */
export async function rejectMember(userId: string): Promise<void> {
  await api.post(`/api/company/members/${userId}/reject`);
}

/** Suspend a member */
export async function suspendMember(userId: string): Promise<void> {
  await api.post(`/api/company/members/${userId}/suspend`);
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

/** Upload a company playbook (JSON or PDF) */
export async function uploadPlaybook(file: File, title?: string): Promise<Playbook> {
  const formData = new FormData();
  formData.append("title", title || file.name.replace(/\.[^/.]+$/, "") || "Corporate Playbook");
  formData.append("file", file);
  formData.append("file", file);
  return api.upload<Playbook>("/api/company/playbook/upload", formData);
}

/** List company playbooks */
export async function listPlaybooks(): Promise<Playbook[]> {
  return api.get<Playbook[]>("/api/company/playbooks");
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
export async function getQuotaSummary(): Promise<QuotaSummary> {
  return api.get<QuotaSummary>("/api/company/quota/summary");
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
  lawyer_profile?: LawyerSettings;
}

export interface LawyerSettings {
  bar_council_no: string;
  field_of_law: string;
  bar_association?: string;
  chamber_name?: string;
  verification_status: string;
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
  bar_association?: string;
  chamber_name?: string;
  field_of_law?: string;
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

/** Update lawyer-specific settings */
export async function updateLawyerSettings(
  req: UpdateLawyerSettingsRequest
): Promise<UserSettings> {
  return api.patch<UserSettings>("/api/settings/lawyer", req as unknown as Record<string, unknown>);
}

// ────────────────────────────────────────────────────────────────────────────
// PAYMENT TYPES & HOOKS
// ────────────────────────────────────────────────────────────────────────────

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price_bdt: number;
  description: string;
  is_popular: boolean;
}

export interface Payment {
  id: string;
  package_id: string;
  package_name: string;
  credits: number;
  amount_bdt: number;
  status: string; // "pending" | "submitted" | "approved" | "rejected" | "cancelled"
  bkash_trx_id?: string;
  initiated_at: string;
  updated_at: string;
}

export interface PaymentSummary {
  total_spent_bdt: number;
  total_credits_purchased: number;
  current_balance: number;
  payment_count: number;
}

export interface InitiatePaymentResponse {
  payment_id: string;
  package_name: string;
  amount_bdt: number;
  credits: number;
  instructions: string;
  bkash_number: string;
}

/** List available credit packages */
export async function listPackages(): Promise<CreditPackage[]> {
  return api.get<CreditPackage[]>("/api/payments/packages");
}

/** Initiate a payment for a package */
export async function initiatePayment(
  packageId: string
): Promise<InitiatePaymentResponse> {
  return api.post<InitiatePaymentResponse>("/api/payments/initiate", {
    package_id: packageId,
  });
}

/** Submit bKash TRX ID for a payment */
export async function submitTrxId(
  paymentId: string | number,
  trxId: string,
  senderNumber: string = "01700000000"
): Promise<Payment> {
  return api.post<Payment>(`/api/payments/${paymentId}/submit-trx`, {
    trx_id: trxId,
    sender_number: senderNumber,
  });
}

/** List user's payments */
export async function listMyPayments(): Promise<Payment[]> {
  return api.get<Payment[]>("/api/payments/my");
}

/** Get a specific payment */
export async function getPayment(paymentId: string): Promise<Payment> {
  return api.get<Payment>(`/api/payments/${paymentId}`);
}

/** Cancel a pending payment */
export async function cancelPayment(paymentId: string): Promise<Payment> {
  return api.post<Payment>(`/api/payments/${paymentId}/cancel`);
}

/** Get payment summary */
export async function getPaymentSummary(): Promise<PaymentSummary> {
  return api.get<PaymentSummary>("/api/payments/summary/me");
}
