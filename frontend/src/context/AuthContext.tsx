"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole =
  | "general"
  | "lawyer"
  | "enterprise"
  | "enterprise_admin"
  | "enterprise_member";
export type LawyerVerificationStatus = "pending" | "verified" | "rejected";
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
  // If user registered as a member with refer code
  isTeamMember?: boolean;
}

export interface UserProfile {
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
  // Role-specific profiles
  lawyerProfile?: LawyerProfile;
  enterpriseProfile?: EnterpriseProfile;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  // Auth actions
  loginAsDemoGeneral: () => void;
  loginAsDemoLawyer: () => void;
  loginAsDemoEnterprise: () => void;
  loginAsDemoEnterpriseAdmin: () => void;
  loginAsDemoEnterpriseMember: () => void;
  registerNewUser: (profile: UserProfile) => void;
  logout: () => void;
  // For demo/judge testing
  simulateLawyerVerification: () => void;
  simulateEnterpriseVerification: () => void;
  simulatePhoneVerification: () => void;
  updateUser: (partial: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_GENERAL: UserProfile = {
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
};

const DEMO_LAWYER: UserProfile = {
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
  lawyerProfile: {
    barCouncilNo: "BC-48291/2019",
    fieldOfLaw: "Corporate & Labour Law",
    barAssociation: "Supreme Court Bar Association",
    chamberName: "Akhter & Associates, Dhaka",
    verificationStatus: "pending",
  },
};

const DEMO_ENTERPRISE_ADMIN: UserProfile = {
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("app_auth_v2");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setIsAuthenticated(true);
        setUser(parsed);
      } catch {
        localStorage.removeItem("app_auth_v2");
      }
    }
    setIsLoading(false);
  }, []);

  const persist = (u: UserProfile) => {
    setIsAuthenticated(true);
    setUser(u);
    localStorage.setItem("app_auth_v2", JSON.stringify(u));
  };

  const loginAsDemoGeneral = () => persist(DEMO_GENERAL);
  const loginAsDemoLawyer = () => persist(DEMO_LAWYER);
  const loginAsDemoEnterpriseAdmin = () => persist(DEMO_ENTERPRISE_ADMIN);
  const loginAsDemoEnterpriseMember = () => persist(DEMO_ENTERPRISE_MEMBER);
  const loginAsDemoEnterprise = () => persist(DEMO_ENTERPRISE_ADMIN);

  const registerNewUser = (profile: UserProfile) => {
    persist(profile);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("app_auth_v2");
  };

  // Simulate backend admin manually verifying a lawyer
  const simulateLawyerVerification = () => {
    if (!user || user.role !== "lawyer" || !user.lawyerProfile) return;
    const updated: UserProfile = {
      ...user,
      lawyerProfile: {
        ...user.lawyerProfile,
        verificationStatus: "verified",
      },
    };
    persist(updated);
  };

  // Simulate backend admin manually verifying an enterprise
  const simulateEnterpriseVerification = () => {
    if (
      !user ||
      (user.role !== "enterprise" &&
        user.role !== "enterprise_admin" &&
        user.role !== "enterprise_member") ||
      !user.enterpriseProfile
    )
      return;
    const updated: UserProfile = {
      ...user,
      enterpriseProfile: {
        ...user.enterpriseProfile,
        verificationStatus: "verified",
      },
    };
    persist(updated);
  };

  // Simulate OTP phone verification success
  const simulatePhoneVerification = () => {
    if (!user) return;
    const updated: UserProfile = { ...user, isPhoneVerified: true };
    persist(updated);
  };

  const updateUser = (partial: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...partial };
    persist(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        loginAsDemoGeneral,
        loginAsDemoLawyer,
        loginAsDemoEnterprise,
        loginAsDemoEnterpriseAdmin,
        loginAsDemoEnterpriseMember,
        registerNewUser,
        logout,
        simulateLawyerVerification,
        simulateEnterpriseVerification,
        simulatePhoneVerification,
        updateUser,
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
