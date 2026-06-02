"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Role = "traveler" | "operator" | "admin";
export type UserStatus = "active" | "banned";
export type SubPlan = "starter" | "growth" | "pro";
export type SubStatus = "active" | "trialing" | "past_due" | "cancelled" | "ended";

export interface OperatorSubscription {
  plan: SubPlan;
  status: SubStatus;
  contactsUsed: number;
  contactsLimit: number;
  /**
   * ISO country codes. INFORMATIVE ONLY in the MVP (2026-05-28 decision):
   * country is a UI filter on the browse page, never a permission gate. Do not
   * use to restrict access to groups, the purchase flow, or pricing.
   */
  countriesServed: string[];
  renewsAt: string; // ISO date string
  paymentFailed: boolean;
  isFoundingMember: boolean;
  trialEndsAt?: string;
  cancelScheduled?: boolean;
}

export interface AuthUser {
  id: string;
  role: Role;
  email: string;
  name: string;
  emailVerified: boolean;
  status: UserStatus;
  banReason?: string;

  // Profile (all roles)
  country?: string;
  city?: string;
  age?: number;
  dateOfBirth?: string; // ISO yyyy-mm-dd
  bio?: string;
  languages?: string[];
  /** International phone (E.164-ish). Shown only when the user opts in per-tour. */
  phone?: string;
  /** Square avatar image, stored as a resized data URL (mock). */
  avatarUrl?: string;
  /** Up to 5 gallery photos, stored as resized data URLs (mock). Traveler-only feature. */
  photos?: string[];

  // Operator-only
  companyName?: string;
  website?: string;
  description?: string;
  adminReviewed?: boolean;
  subscription?: OperatorSubscription;
}

interface SignInOpts {
  email?: string;
  name?: string;
  /** Override the default mock state — useful for testing edge flows. */
  override?: Partial<AuthUser>;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signIn: (role: Role, opts?: SignInOpts) => void;
  signOut: () => void;
  updateUser: (patch: Partial<AuthUser>) => void;
}

const STORAGE_KEY = "tierrasul:user";
const AuthContext = createContext<AuthContextValue | null>(null);

function todayPlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

const DEMO_PROFILES: Record<Role, AuthUser> = {
  traveler: {
    id: "traveler-demo",
    role: "traveler",
    email: "maria@example.com",
    name: "MARIA SILVA",
    emailVerified: true,
    status: "active",
    country: "Spain",
    city: "Barcelona",
    age: 28,
    bio: "Love photography and slow travel. Currently 3 months into South America.",
    languages: ["es", "en"],
  },
  operator: {
    id: "operator-demo",
    role: "operator",
    email: "contact@atacama.com",
    name: "ATACAMA TOURS",
    emailVerified: true,
    status: "active",
    country: "Chile",
    companyName: "Atacama Tours",
    website: "https://atacamatours.example.com",
    description: "Family-run desert tours in San Pedro de Atacama since 2018.",
    adminReviewed: true,
    subscription: {
      plan: "growth",
      status: "active",
      contactsUsed: 12,
      contactsLimit: 30,
      countriesServed: ["BO", "CL", "PE"],
      renewsAt: todayPlus(15),
      paymentFailed: false,
      isFoundingMember: false,
    },
  },
  admin: {
    id: "admin-demo",
    role: "admin",
    email: "admin@tierrasul.com",
    name: "ADMIN",
    emailVerified: true,
    status: "active",
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as AuthUser);
    } catch {
      // corrupt storage — treat as logged out
    }
    setLoading(false);
  }, []);

  const persist = (next: AuthUser | null) => {
    try {
      if (next) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore quota errors
    }
  };

  const signIn = useCallback<AuthContextValue["signIn"]>((role, opts) => {
    const base = DEMO_PROFILES[role];
    const next: AuthUser = {
      ...base,
      ...(opts?.override ?? {}),
      email: opts?.email ?? base.email,
      name: opts?.name ?? base.name,
      role,
    };
    persist(next);
    setUser(next);
  }, []);

  const signOut = useCallback(() => {
    persist(null);
    setUser(null);
  }, []);

  const updateUser = useCallback<AuthContextValue["updateUser"]>((patch) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      persist(next);
      return next;
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, signIn, signOut, updateUser }),
    [user, loading, signIn, signOut, updateUser]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

export function landingPathForRole(role: Role): string {
  switch (role) {
    case "traveler":
      return "/dashboard";
    case "operator":
      return "/operator";
    case "admin":
      return "/admin";
  }
}

export function planLabel(plan: SubPlan): string {
  return plan === "starter" ? "STARTER" : plan === "growth" ? "GROWTH" : "PRO";
}

export function planPrice(plan: SubPlan, founding = false): number {
  if (plan === "starter") return founding ? 12 : 16.99;
  if (plan === "growth") return founding ? 29 : 59;
  return founding ? 79 : 129;
}

/**
 * Mock role detection from email — used by sign-in to route the user before a
 * real backend exists. Recognizes the seeded operator/admin emails; everything
 * else defaults to traveler.
 */
const KNOWN_OPERATOR_EMAILS = new Set([
  "contact@atacama.com",
  "hello@incatrail.com",
  "info@saltadventures.com",
  "hello@patagonia.com",
]);

export function detectRoleFromEmail(email: string): Role {
  const lower = email.trim().toLowerCase();
  if (!lower) return "traveler";
  if (lower.endsWith("@tierrasul.com") || lower.startsWith("admin@")) {
    return "admin";
  }
  if (KNOWN_OPERATOR_EMAILS.has(lower)) return "operator";
  return "traveler";
}

/** Helper: is the operator allowed to access groups right now? */
export function canOperatorAccessGroups(user: AuthUser | null): boolean {
  if (!user || user.role !== "operator" || user.status !== "active") return false;
  const sub = user.subscription;
  if (!sub) return false;
  return sub.status === "active" || sub.status === "trialing";
}
