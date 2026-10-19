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
  | "enterprise_member";

export type LawyerVerificationStatus = "pending" | "verified" | "rejected" | "suspended";
export type EnterpriseVerificationStatus = "pending" | "verified" | "rejected";

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
  const r = String(rawRole).toLowerCase().trim();
  if (r.includes("lawyer")) return "lawyer";
  if (r.includes("enterprise_admin") || r === "enterprise-admin") return "enterprise_admin";
  if (r.includes("enterprise_member") || r === "enterprise-member") return "enterprise_member";
  if (r.includes("enterprise")) return "enterprise_admin";
  return "general";
}

function getSavedLawyerProfile(email?: string): LawyerProfile | null {
  if (typeof window === "undefined") return null;
  const key = email ? `contractmind_lawyer_${email.toLowerCase().trim()}` : "contractmind_lawyer_latest";
  const raw = localStorage.getItem(key) || localStorage.getItem("contractmind_lawyer_latest");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveLawyerProfileLocally(email: string, profile: LawyerProfile) {
  if (typeof window === "undefined") return;
  const key = `contractmind_lawyer_${email.toLowerCase().trim()}`;
  localStorage.setItem(key, JSON.stringify(profile));
  localStorage.setItem("contractmind_lawyer_latest", JSON.stringify(profile));
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

  loginAsDemoGeneral: () => void;
  loginAsDemoLawyer: () => void;
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
    avatarUrl: data.avatar_url,
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
    setIsAuthenticated(true);
    setUser(u);
    localStorage.setItem("app_auth_v2", JSON.stringify(u));
  };

  // ── Real API: Login ──
  const login = async (req: LoginRequest): Promise<UserProfile> => {
    const data = await api.post<TokenResponse>("/api/auth/login", {
      email: req.email,
      password: req.password,
    });
    const savedLawyer = getSavedLawyerProfile(req.email);
    const resolvedRole = savedLawyer ? "lawyer" : normalizeUserRole(data.role);
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
      setUser(meResponseToProfile(me));
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
    try {
      await api.post("/api/auth/onboard/lawyer", {
        bar_council_id: req.bar_council_id || req.bar_council_no || "",
        experience_years: req.experience_years ?? 1,
        specializations: req.specializations || (req.field_of_law ? [req.field_of_law] : []),
      });
    } catch (err) {
      console.warn("Lawyer onboarding API call note:", err);
    }

    const lp: LawyerProfile = {
      barCouncilNo: req.bar_council_id || req.bar_council_no || "",
      fieldOfLaw: req.field_of_law || (req.specializations && req.specializations.length > 0 ? req.specializations[0] : ""),
      barAssociation: req.bar_association || "",
      chamberName: req.chamber_name || "",
      verificationStatus: "pending",
    };

    const currentEmail = user?.email || "";
    if (currentEmail) {
      saveLawyerProfileLocally(currentEmail, lp);
    } else {
      localStorage.setItem("contractmind_lawyer_latest", JSON.stringify(lp));
    }

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
    clearAuth();
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
  const loginAsDemoEnterpriseAdmin = () => persistDemo(DEMO_ENTERPRISE_ADMIN);
  const loginAsDemoEnterpriseMember = () => persistDemo(DEMO_ENTERPRISE_MEMBER);
  const loginAsDemoEnterprise = () => persistDemo(DEMO_ENTERPRISE_ADMIN);

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
        loginAsDemoGeneral,
        loginAsDemoLawyer,
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
