"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api, { ApiError } from "@/lib/api";
import {
  saveTokenResponse,
  getToken,
  getStoredUser,
  clearAuth,
  TokenResponse,
  StoredUser,
} from "@/lib/auth";

// ─── Role & Verification Types ─────────────────────────────────────────────
export type UserRole =
  | "general"
  | "lawyer"
  | "enterprise"
  | "enterprise_admin"
  | "enterprise_member"
  | "admin";

export type LawyerVerificationStatus = "pending" | "verified" | "rejected" | "suspended";
export type EnterpriseVerificationStatus = "pending" | "verified" | "rejected";

export interface PendingLawyerRecord {
  id: string | number;
  user_id?: string | number;
  name: string;
  email: string;
  phone?: string;
  barCouncilId: string;
  experienceYears: number;
  fieldOfLaw: string;
  specializations: string[];
  barAssociation?: string;
  chamberName?: string;
  status: LawyerVerificationStatus;
  appliedAt: string;
}

export interface LawyerProfile {
  barCouncilNo: string;
  fieldOfLaw: string;
  barAssociation?: string;
  chamberName?: string;
  verificationStatus: LawyerVerificationStatus;
}

export interface EnterpriseProfile {
  companyName: string;
  companyType: string;
  registrationNo: string;
  tinNo: string;
  adminName: string;
  memberCount: number;
  referCode?: string;
  verificationStatus: EnterpriseVerificationStatus;
  isTeamMember?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  email: string;
  mobile?: string;
  role: UserRole;
  avatarUrl?: string;
  profile_photo_url?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  creditBalance: number;
  lawyerProfile?: LawyerProfile;
  enterpriseProfile?: EnterpriseProfile;
}

// ─── Auth Request / Response types (matching backend) ────────────────────
interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterEmailRequest {
  email: string;
  password: string;
  confirm_password: string;
  full_name: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
}

interface OtpRequest {
  email: string;
  otp: string;
}

interface OnboardLawyerRequest {
  bar_council_id?: string;
  bar_council_no?: string;
  experience_years?: number;
  specializations?: string[];
  field_of_law?: string;
  bar_association?: string;
  chamber_name?: string;
}

interface OnboardEnterpriseRequest {
  company_name: string;
  company_type?: string;
  registration_no?: string;
  tin_no?: string;
  member_limit?: number;
  admin_name?: string;
  billing_email?: string;
  billing_phone?: string;
  email?: string;
  phone?: string;
}

interface RegisterEnterpriseMemberRequest {
  email: string;
  password: string;
  confirm_password: string;
  full_name: string;
  referral_code?: string;
  refer_code?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
}

// ─── Role Normalization & Local Lawyer State Helpers ─────────────────────
export function normalizeUserRole(rawRole?: string | null): UserRole {
  if (!rawRole) return "general";
  const r = String(rawRole).toUpperCase().trim();
  if (r === "ADMIN" || (r.includes("ADMIN") && !r.includes("ENTERPRISE"))) return "admin";
  if (r.includes("LAWYER")) return "lawyer";
  if (r.includes("ENTERPRISE_ADMIN") || r === "ENTERPRISE-ADMIN") return "enterprise_admin";
  if (r.includes("ENTERPRISE_MEMBER") || r === "ENTERPRISE-MEMBER") return "enterprise_member";
  if (r.includes("ENTERPRISE")) return "enterprise_admin";
  return "general";
}

const DEFAULT_PENDING_APPLICATIONS: PendingLawyerRecord[] = [
  {
    id: "lawyer-app-1",
    user_id: "demo-lawyer",
    name: "Advocate Shireen Akhter",
    email: "shireen@supremecourt.bd",
    phone: "+8801911223344",
    barCouncilId: "BC-48291/2019",
    experienceYears: 7,
    fieldOfLaw: "Corporate & Labour Law",
    specializations: ["Corporate Law", "Labour Law", "Contract Law"],
    barAssociation: "Supreme Court Bar Association",
    chamberName: "Akhter & Associates, Dhaka",
    status: "pending",
    appliedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "lawyer-app-2",
    user_id: "demo-lawyer-2",
    name: "Advocate Tanvir Hasan",
    email: "tanvir.hasan@dhkbar.org",
    phone: "+8801722334455",
    barCouncilId: "BC/DHK/2021/008892",
    experienceYears: 4,
    fieldOfLaw: "Contract & Commercial Law",
    specializations: ["Contract Law", "Arbitration"],
    barAssociation: "Dhaka Bar Association",
    chamberName: "Hasan Legal Chambers",
    status: "pending",
    appliedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
];

export function getPendingLawyerApplications(): PendingLawyerRecord[] {
  if (typeof window === "undefined") return DEFAULT_PENDING_APPLICATIONS;
  try {
    const raw = localStorage.getItem("pending_lawyer_applications");
    if (!raw) {
      localStorage.setItem("pending_lawyer_applications", JSON.stringify(DEFAULT_PENDING_APPLICATIONS));
      return DEFAULT_PENDING_APPLICATIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PENDING_APPLICATIONS;
  } catch {
    return DEFAULT_PENDING_APPLICATIONS;
  }
}

export function savePendingLawyerApplication(app: PendingLawyerRecord) {
  if (typeof window === "undefined") return;
  try {
    const list = getPendingLawyerApplications();
    const existingIdx = list.findIndex(
      (a) =>
        String(a.id) === String(app.id) ||
        (a.email && app.email && a.email.toLowerCase() === app.email.toLowerCase())
    );
    let updated: PendingLawyerRecord[];
    if (existingIdx >= 0) {
      updated = [...list];
      updated[existingIdx] = { ...updated[existingIdx], ...app };
    } else {
      updated = [app, ...list];
    }
    localStorage.setItem("pending_lawyer_applications", JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function updateLawyerApplicationStatus(
  idOrEmail: string | number,
  status: LawyerVerificationStatus
) {
  if (typeof window === "undefined") return;
  try {
    const list = getPendingLawyerApplications();
    const updated = list.map((a) => {
      const match =
        String(a.id) === String(idOrEmail) ||
        (a.email && String(idOrEmail).toLowerCase() === a.email.toLowerCase());
      if (match) {
        return { ...a, status };
      }
      return a;
    });
    localStorage.setItem("pending_lawyer_applications", JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function getSavedLawyerProfile(email?: string | null): LawyerProfile | null {
  if (typeof window === "undefined" || !email) return null;
  const cleanEmail = email.toLowerCase().trim();
  const key = `contractmind_lawyer_${cleanEmail}`;
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // ignore
    }
  }
  // Check pending lawyer applications list specifically for this email
  const apps = getPendingLawyerApplications();
  const match = apps.find((app) => app.email.toLowerCase().trim() === cleanEmail);
  if (match) {
    return {
      barCouncilNo: match.barCouncilId || "",
      fieldOfLaw: match.fieldOfLaw || "",
      barAssociation: match.barAssociation || "",
      chamberName: match.chamberName || "",
      verificationStatus: match.status,
    };
  }
  return null;
}

export function saveLawyerProfileLocally(email: string, profile: LawyerProfile) {
  if (typeof window === "undefined" || !email) return;
  const key = `contractmind_lawyer_${email.toLowerCase().trim()}`;
  localStorage.setItem(key, JSON.stringify(profile));
}

// ─── Context Type ─────────────────────────────────────────────────────────
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;

  // Real API actions
  login: (req: LoginRequest) => Promise<UserProfile>;
  registerEmail: (req: RegisterEmailRequest) => Promise<{ email: string }>;
  verifyOtp: (req: OtpRequest) => Promise<UserProfile>;
  resendOtp: (email: string) => Promise<void>;
  onboardLawyer: (req: OnboardLawyerRequest) => Promise<void>;
  onboardEnterprise: (req: OnboardEnterpriseRequest) => Promise<void>;
  registerEnterpriseMember: (req: RegisterEnterpriseMemberRequest) => Promise<{ email: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (partial: Partial<UserProfile>) => void;

  // Admin actions
  approveLawyerByAdmin: (lawyerIdOrEmail: string | number) => Promise<void>;
  rejectLawyerByAdmin: (lawyerIdOrEmail: string | number, reason?: string) => Promise<void>;
  suspendLawyerByAdmin: (lawyerIdOrEmail: string | number, reason?: string) => Promise<void>;
  getPendingLawyersList: () => PendingLawyerRecord[];

  loginAsDemoGeneral: () => void;
  loginAsDemoLawyer: () => void;
  loginAsDemoAdmin: () => void;
  loginAsDemoEnterprise: () => void;
  loginAsDemoEnterpriseAdmin: () => void;
  loginAsDemoEnterpriseMember: () => void;
  simulateLawyerVerification: () => void;
  simulateEnterpriseVerification: () => void;
  simulatePhoneVerification: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Helper: map backend StoredUser → UserProfile ────────────────────────
function storedUserToProfile(u: StoredUser, extra?: Partial<UserProfile>): UserProfile {
  const normRole = normalizeUserRole(u.role);
  const savedLawyer = normRole === "lawyer" || u.email ? getSavedLawyerProfile(u.email) : null;
  const finalRole: UserRole = savedLawyer || normRole === "lawyer" ? "lawyer" : normRole;

  return {
    id: u.id,
    name: u.full_name,
    email: u.email,
    role: finalRole,
    isEmailVerified: u.is_verified,
    isPhoneVerified: u.is_phone_verified,
    creditBalance: u.credit_balance,
    lawyerProfile: finalRole === "lawyer" ? (savedLawyer || {
      barCouncilNo: "",
      fieldOfLaw: "",
      verificationStatus: "pending",
    }) : undefined,
    ...extra,
  };
}

// ─── Helper: map backend /auth/me response → UserProfile ─────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function meResponseToProfile(data: any): UserProfile {
  const email = data.email || "";
  const savedLawyer = getSavedLawyerProfile(email);
  const hasLawyerData = Boolean(data.lawyer_profile || data.lawyer || savedLawyer);
  const rawRole = data.role ?? (hasLawyerData ? "lawyer" : "general");
  const normRole = hasLawyerData ? "lawyer" : normalizeUserRole(rawRole);

  const lawyerData = data.lawyer_profile || data.lawyer;
  const lawyerProfile: LawyerProfile | undefined = normRole === "lawyer" ? {
    barCouncilNo:
      lawyerData?.bar_council_no ||
      lawyerData?.bar_council_id ||
      savedLawyer?.barCouncilNo ||
      "",
    fieldOfLaw:
      lawyerData?.field_of_law ||
      (Array.isArray(lawyerData?.specializations) ? lawyerData.specializations.join(", ") : undefined) ||
      savedLawyer?.fieldOfLaw ||
      "",
    barAssociation:
      lawyerData?.bar_association || savedLawyer?.barAssociation || "",
    chamberName:
      lawyerData?.chamber_name || savedLawyer?.chamberName || "",
    verificationStatus:
      (lawyerData?.verification_status || savedLawyer?.verificationStatus || "pending") as LawyerVerificationStatus,
  } : undefined;

  return {
    id: String(data.id ?? data.user_id ?? ""),
    name: data.full_name ?? data.name ?? "",
    firstName: data.first_name,
    lastName: data.last_name,
    dateOfBirth: data.date_of_birth,
    gender: data.gender,
    email: email,
    mobile: data.phone,
    role: normRole,
    avatarUrl: data.profile_photo_url || data.avatar_url,
    profile_photo_url: data.profile_photo_url || data.avatar_url,
    isEmailVerified: data.is_verified ?? false,
    isPhoneVerified: data.is_phone_verified ?? false,
    creditBalance: data.credit_balance ?? 0,
    lawyerProfile,
    enterpriseProfile: data.enterprise_profile
      ? {
          companyName: data.enterprise_profile.company_name,
          companyType: data.enterprise_profile.company_type,
          registrationNo: data.enterprise_profile.registration_no,
          tinNo: data.enterprise_profile.tin_no,
          adminName: data.enterprise_profile.admin_name,
          memberCount: data.enterprise_profile.member_count ?? 0,
          referCode: data.enterprise_profile.refer_code,
          verificationStatus: data.enterprise_profile.verification_status,
          isTeamMember: data.enterprise_profile.is_team_member,
        }
      : undefined,
  };
}

// ─── Demo profiles (for hackathon judges) ────────────────────────────────
const DEMO_GENERAL: UserProfile = {
  id: "demo-general",
  name: "Tariqul Islam",
  firstName: "Tariqul",
  lastName: "Islam",
  dateOfBirth: "1994-06-15",
  gender: "male",
  email: "tariqul@dhakatech.com",
  mobile: "+8801712345678",
  role: "general",
  avatarUrl: "",
  isEmailVerified: true,
  isPhoneVerified: false,
  creditBalance: 500,
};

const DEMO_LAWYER: UserProfile = {
  id: "demo-lawyer",
  name: "Advocate Shireen Akhter",
  firstName: "Shireen",
  lastName: "Akhter",
  dateOfBirth: "1988-11-20",
  gender: "female",
  email: "shireen@supremecourt.bd",
  mobile: "+8801911223344",
  role: "lawyer",
  avatarUrl: "",
  isEmailVerified: true,
  isPhoneVerified: true,
  creditBalance: 0,
  lawyerProfile: {
    barCouncilNo: "BC-48291/2019",
    fieldOfLaw: "Corporate & Labour Law",
    barAssociation: "Supreme Court Bar Association",
    chamberName: "Akhter & Associates, Dhaka",
    verificationStatus: "pending",
  },
};

const DEMO_ENTERPRISE_ADMIN: UserProfile = {
  id: "demo-ent-admin",
  name: "Rahim Chowdhury",
  firstName: "Rahim",
  lastName: "Chowdhury",
  dateOfBirth: "1982-04-10",
  gender: "male",
  email: "rahim@apexholdings.bd",
  mobile: "+8801819554433",
  role: "enterprise_admin",
  avatarUrl: "",
  isEmailVerified: true,
  isPhoneVerified: true,
  creditBalance: 2000,
  enterpriseProfile: {
    companyName: "Apex Holdings Ltd.",
    companyType: "Private Limited",
    registrationNo: "C-148920/2021",
    tinNo: "582910482912",
    adminName: "Rahim Chowdhury",
    memberCount: 15,
    referCode: "APX-8821",
    verificationStatus: "verified",
    isTeamMember: false,
  },
};

const DEMO_ENTERPRISE_MEMBER: UserProfile = {
  id: "demo-ent-member",
  name: "Nusrat Jahan",
  firstName: "Nusrat",
  lastName: "Jahan",
  dateOfBirth: "1992-08-14",
  gender: "female",
  email: "nusrat.hr@apexholdings.bd",
  mobile: "+8801719876543",
  role: "enterprise_member",
  avatarUrl: "",
  isEmailVerified: true,
  isPhoneVerified: true,
  creditBalance: 250,
  enterpriseProfile: {
    companyName: "Apex Holdings Ltd.",
    companyType: "Private Limited",
    registrationNo: "C-148920/2021",
    tinNo: "582910482912",
    adminName: "Rahim Chowdhury",
    memberCount: 15,
    referCode: "APX-8821",
    verificationStatus: "verified",
    isTeamMember: true,
  },
};

const DEMO_ADMIN: UserProfile = {
  id: "demo-system-admin",
  name: "System Administrator",
  firstName: "Super",
  lastName: "Admin",
  dateOfBirth: "1980-01-01",
  gender: "male",
  email: "admin@contractmind.gov.bd",
  mobile: "+8801700112233",
  role: "admin",
  avatarUrl: "",
  isEmailVerified: true,
  isPhoneVerified: true,
  creditBalance: 99999,
};

// ─── Provider ─────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);

  // ── On mount: restore session from localStorage ──
  const refreshUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await api.get<any>("/api/auth/me");
      const profile = meResponseToProfile(data);
      setUser(profile);
      setIsAuthenticated(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearAuth();
        setIsAuthenticated(false);
        setUser(null);
      } else {
        // Network error: use cached user from localStorage
        const stored = getStoredUser();
        if (stored) {
          setUser(storedUserToProfile(stored));
          setIsAuthenticated(true);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check if this is a demo session (stored in old key)
    const demoSession = localStorage.getItem("app_auth_v2");
    if (demoSession) {
      try {
        const parsed = JSON.parse(demoSession);
        setUser(parsed);
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      } catch {
        localStorage.removeItem("app_auth_v2");
      }
    }
    refreshUser();
  }, [refreshUser]);

  // ── Persist demo session ──
  const persistDemo = (u: UserProfile) => {
    const existingApps = typeof window !== "undefined" ? localStorage.getItem("contractmind_pending_lawyers") : null;
    if (typeof window !== "undefined") {
      localStorage.clear();
      if (existingApps) {
        localStorage.setItem("contractmind_pending_lawyers", existingApps);
      }
      localStorage.setItem("cm_role", String(u.role).toUpperCase());
      localStorage.setItem("app_auth_v2", JSON.stringify(u));
    }
    setIsAuthenticated(true);
    setUser(u);
  };

  // ── Real API: Login ──
  const login = async (req: LoginRequest): Promise<UserProfile> => {
    const existingApps = typeof window !== "undefined" ? localStorage.getItem("contractmind_pending_lawyers") : null;
    if (typeof window !== "undefined") {
      localStorage.clear();
      if (existingApps) {
        localStorage.setItem("contractmind_pending_lawyers", existingApps);
      }
    }

    const data = await api.post<TokenResponse>("/api/auth/login", {
      email: req.email,
      password: req.password,
    });
    const savedLawyer = getSavedLawyerProfile(req.email);
    const resolvedRole = savedLawyer ? "lawyer" : normalizeUserRole(data.role);

    if (typeof window !== "undefined") {
      localStorage.setItem("cm_role", String(resolvedRole).toUpperCase());
    }

    saveTokenResponse(data, resolvedRole);
    const profile = storedUserToProfile({
      id: data.user_id,
      email: data.email,
      full_name: data.full_name,
      role: resolvedRole,
      credit_balance: data.credit_balance,
      is_verified: data.is_verified,
      is_phone_verified: data.is_phone_verified,
    });
    setUser(profile);
    setIsAuthenticated(true);
    // Fetch full profile in background
    api.get<Record<string, unknown>>("/api/auth/me").then((me) => {
      const full = meResponseToProfile(me);
      if (typeof window !== "undefined") {
        localStorage.setItem("cm_role", String(full.role).toUpperCase());
      }
      setUser(full);
    }).catch(() => {/* noop */});
    return profile;
  };

  // ── Real API: Register ──
  const registerEmail = async (req: RegisterEmailRequest): Promise<{ email: string }> => {
    const data = await api.post<{ message: string; email: string }>(
      "/api/auth/register/email",
      req as unknown as Record<string, unknown>
    );
    return { email: data.email };
  };

  // ── Real API: Verify OTP ──
  const verifyOtp = async (req: OtpRequest): Promise<UserProfile> => {
    const data = await api.post<TokenResponse>("/api/auth/verify-otp", {
      email: req.email,
      otp_code: req.otp,
    });
    const savedLawyer = getSavedLawyerProfile(req.email);
    const resolvedRole = savedLawyer ? "lawyer" : normalizeUserRole(data.role);
    if (typeof window !== "undefined") {
      localStorage.setItem("cm_role", String(resolvedRole).toUpperCase());
    }
    saveTokenResponse(data, resolvedRole);
    const profile = storedUserToProfile({
      id: data.user_id,
      email: data.email,
      full_name: data.full_name,
      role: resolvedRole,
      credit_balance: data.credit_balance,
      is_verified: data.is_verified,
      is_phone_verified: data.is_phone_verified,
    });
    setUser(profile);
    setIsAuthenticated(true);
    return profile;
  };

  // ── Real API: Resend OTP ──
  const resendOtp = async (email: string): Promise<void> => {
    await api.post("/api/auth/resend-otp", { email });
  };

  // ── Real API: Onboard Lawyer ──
  const onboardLawyer = async (req: OnboardLawyerRequest): Promise<void> => {
    const barId = req.bar_council_id || req.bar_council_no || "";
    const exp = req.experience_years ?? 3;
    const spec = req.specializations || (req.field_of_law ? [req.field_of_law] : ["Contract Law"]);

    try {
      await api.post("/api/auth/onboard/lawyer", {
        bar_council_id: barId,
        experience_years: exp,
        specializations: spec,
      });
    } catch (err) {
      console.warn("Lawyer onboarding API call note:", err);
    }

    const lp: LawyerProfile = {
      barCouncilNo: barId,
      fieldOfLaw: req.field_of_law || (spec.length > 0 ? spec[0] : "Contract Law"),
      barAssociation: req.bar_association || "Supreme Court Bar Association",
      chamberName: req.chamber_name || "Chamber of Advocates",
      verificationStatus: "pending", // Strictly pending until admin approval
    };

    const currentEmail = user?.email || "";
    if (currentEmail) {
      saveLawyerProfileLocally(currentEmail, lp);
    } else {
      localStorage.setItem("contractmind_lawyer_latest", JSON.stringify(lp));
    }

    // Record application for Admin Panel review
    const newApp: PendingLawyerRecord = {
      id: `lawyer-app-${Date.now()}`,
      user_id: user?.id,
      name: user?.name || "Advocate Applicant",
      email: currentEmail || "advocate@supremecourt.bd",
      phone: user?.mobile || "+880 1711-223344",
      barCouncilId: barId,
      experienceYears: exp,
      fieldOfLaw: lp.fieldOfLaw,
      specializations: spec,
      barAssociation: lp.barAssociation,
      chamberName: lp.chamberName,
      status: "pending",
      appliedAt: new Date().toISOString(),
    };
    savePendingLawyerApplication(newApp);

    const updatedUser: UserProfile = user
      ? {
          ...user,
          role: "lawyer",
          lawyerProfile: lp,
        }
      : {
          id: "lawyer-session",
          name: "Advocate",
          email: currentEmail,
          role: "lawyer",
          creditBalance: 0,
          isEmailVerified: true,
          isPhoneVerified: false,
          lawyerProfile: lp,
        };
    setUser(updatedUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("cm_role", "LAWYER");
    }

    const stored = getStoredUser();
    if (stored) {
      localStorage.setItem("contractmind_user", JSON.stringify({ ...stored, role: "lawyer" }));
    }
  };

  // ── Real API: Onboard Enterprise ──
  const onboardEnterprise = async (req: OnboardEnterpriseRequest): Promise<void> => {
    await api.post("/api/auth/onboard/enterprise", {
      company_name: req.company_name,
      company_type: req.company_type || "Private Limited",
      registration_no: req.registration_no || "C-148920/2021",
      tin_no: req.tin_no || "582910482912",
      member_limit: req.member_limit || 10,
      billing_email: req.billing_email || req.email,
      billing_phone: req.billing_phone || req.phone,
    });
    await refreshUser();
  };

  // ── Real API: Register Enterprise Member ──
  const registerEnterpriseMember = async (
    req: RegisterEnterpriseMemberRequest
  ): Promise<{ email: string }> => {
    const data = await api.post<{ message: string; email: string }>(
      "/api/auth/register/enterprise-member",
      {
        email: req.email,
        password: req.password,
        confirm_password: req.confirm_password,
        full_name: req.full_name,
        referral_code: req.referral_code || req.refer_code || "APX-8821",
        phone: req.phone || undefined,
        date_of_birth: req.date_of_birth || undefined,
        gender: req.gender || undefined,
      }
    );
    return { email: data.email };
  };

  // ── Logout ──
  const logout = () => {
    const existingApps = typeof window !== "undefined" ? localStorage.getItem("contractmind_pending_lawyers") : null;
    clearAuth();
    if (typeof window !== "undefined") {
      localStorage.clear();
      if (existingApps) {
        localStorage.setItem("contractmind_pending_lawyers", existingApps);
      }
      window.location.href = "/login";
    }
    setIsAuthenticated(false);
    setUser(null);
  };

  // ── Local update ──
  const updateUser = (partial: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...partial };
    setUser(updated);
    // Update demo session if active
    if (localStorage.getItem("app_auth_v2")) {
      localStorage.setItem("app_auth_v2", JSON.stringify(updated));
    }
  };

  // ── Demo shortcuts ──
  const loginAsDemoGeneral = () => persistDemo(DEMO_GENERAL);
  const loginAsDemoLawyer = () => persistDemo(DEMO_LAWYER);
  const loginAsDemoAdmin = () => persistDemo(DEMO_ADMIN);
  const loginAsDemoEnterpriseAdmin = () => persistDemo(DEMO_ENTERPRISE_ADMIN);
  const loginAsDemoEnterpriseMember = () => persistDemo(DEMO_ENTERPRISE_MEMBER);
  const loginAsDemoEnterprise = () => persistDemo(DEMO_ENTERPRISE_ADMIN);

  // ── Admin Panel Actions ──
  const approveLawyerByAdmin = async (lawyerIdOrEmail: string | number) => {
    try {
      await api.post(`/api/admin/lawyers/${lawyerIdOrEmail}/approve`);
    } catch (err) {
      console.warn("Backend admin approve API note:", err);
    }
    updateLawyerApplicationStatus(lawyerIdOrEmail, "verified");

    // If currently logged-in user matches or is a lawyer, update live session
    if (
      user &&
      (String(user.id) === String(lawyerIdOrEmail) ||
        (user.email && String(user.email).toLowerCase() === String(lawyerIdOrEmail).toLowerCase()) ||
        user.role === "lawyer")
    ) {
      const currentLp = user.lawyerProfile || {
        barCouncilNo: "BC-48291/2019",
        fieldOfLaw: "Corporate & Labour Law",
        verificationStatus: "pending",
      };
      const updatedLp: LawyerProfile = {
        ...currentLp,
        verificationStatus: "verified",
      };
      if (user.email) {
        saveLawyerProfileLocally(user.email, updatedLp);
      }
      updateUser({ lawyerProfile: updatedLp, role: "lawyer" });
    }
  };

  const rejectLawyerByAdmin = async (
    lawyerIdOrEmail: string | number,
    reason: string = "Bar Council verification unconfirmed."
  ) => {
    try {
      await api.post(`/api/admin/lawyers/${lawyerIdOrEmail}/reject`, { reason });
    } catch (err) {
      console.warn("Backend admin reject API note:", err);
    }
    updateLawyerApplicationStatus(lawyerIdOrEmail, "rejected");

    if (
      user &&
      (String(user.id) === String(lawyerIdOrEmail) ||
        (user.email && String(user.email).toLowerCase() === String(lawyerIdOrEmail).toLowerCase()))
    ) {
      const currentLp = user.lawyerProfile || {
        barCouncilNo: "",
        fieldOfLaw: "",
        verificationStatus: "pending",
      };
      const updatedLp: LawyerProfile = {
        ...currentLp,
        verificationStatus: "rejected",
      };
      if (user.email) {
        saveLawyerProfileLocally(user.email, updatedLp);
      }
      updateUser({ lawyerProfile: updatedLp });
    }
  };

  const suspendLawyerByAdmin = async (
    lawyerIdOrEmail: string | number,
    reason: string = "Account suspended by administrator."
  ) => {
    try {
      await api.post(`/api/admin/lawyers/${lawyerIdOrEmail}/suspend`, { reason });
    } catch (err) {
      console.warn("Backend admin suspend API note:", err);
    }
    updateLawyerApplicationStatus(lawyerIdOrEmail, "suspended");

    if (
      user &&
      (String(user.id) === String(lawyerIdOrEmail) ||
        (user.email && String(user.email).toLowerCase() === String(lawyerIdOrEmail).toLowerCase()))
    ) {
      const currentLp = user.lawyerProfile || {
        barCouncilNo: "",
        fieldOfLaw: "",
        verificationStatus: "pending",
      };
      const updatedLp: LawyerProfile = {
        ...currentLp,
        verificationStatus: "suspended",
      };
      if (user.email) {
        saveLawyerProfileLocally(user.email, updatedLp);
      }
      updateUser({ lawyerProfile: updatedLp });
    }
  };

  const getPendingLawyersList = () => {
    return getPendingLawyerApplications();
  };

  const simulateLawyerVerification = () => {
    if (!user || user.role !== "lawyer") return;
    const currentLp = user.lawyerProfile || {
      barCouncilNo: "",
      fieldOfLaw: "",
      verificationStatus: "pending",
    };
    const updatedLp: LawyerProfile = {
      ...currentLp,
      verificationStatus: "verified",
    };
    if (user.email) {
      saveLawyerProfileLocally(user.email, updatedLp);
    }
    updateLawyerApplicationStatus(user.email, "verified");
    updateUser({ lawyerProfile: updatedLp });
  };

  const simulateEnterpriseVerification = () => {
    if (!user || !user.enterpriseProfile) return;
    updateUser({ enterpriseProfile: { ...user.enterpriseProfile, verificationStatus: "verified" } });
  };

  const simulatePhoneVerification = () => {
    if (!user) return;
    updateUser({ isPhoneVerified: true });
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        login,
        registerEmail,
        verifyOtp,
        resendOtp,
        onboardLawyer,
        onboardEnterprise,
        registerEnterpriseMember,
        logout,
        refreshUser,
        updateUser,
        approveLawyerByAdmin,
        rejectLawyerByAdmin,
        suspendLawyerByAdmin,
        getPendingLawyersList,
        loginAsDemoGeneral,
        loginAsDemoLawyer,
        loginAsDemoAdmin,
        loginAsDemoEnterprise,
        loginAsDemoEnterpriseAdmin,
        loginAsDemoEnterpriseMember,
        simulateLawyerVerification,
        simulateEnterpriseVerification,
        simulatePhoneVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
