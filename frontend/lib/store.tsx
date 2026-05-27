"use client";

/**
 * Mock data store with localStorage persistence.
 * Provides the in-memory model for tours, memberships, purchases and deals
 * so all flows feel real before the backend exists. When Supabase/API arrives,
 * the mutation helpers swap to fetch calls and the rest of the app stays put.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { mockTours } from "@/data/mock-data";
import type { Tour } from "@/components/tour/tour-card";

export interface Membership {
  tourId: string;
  userEmail: string;
  joinedAt: string;
  sharePhone: boolean;
  phone?: string;
}

export interface Purchase {
  id: string;
  tourId: string;
  operatorEmail: string;
  purchasedAt: string;
  dealClosed: boolean;
  dealValue?: number;
}

export interface AdminBan {
  userEmail: string;
  reason: string;
  bannedAt: string;
}

interface StoreState {
  customTours: Tour[];
  cancelledTourIds: string[];
  deletedTourIds: string[];
  forceClosedTourIds: string[];
  memberships: Membership[];
  purchases: Purchase[];
  bans: AdminBan[];
  reviewedOperatorEmails: string[];
}

const STORAGE_KEY = "tierrasul:store";

const INITIAL: StoreState = {
  customTours: [],
  cancelledTourIds: [],
  deletedTourIds: [],
  forceClosedTourIds: [],
  memberships: [
    // Demo: traveler is already a member of tour #1
    {
      tourId: "1",
      userEmail: "maria@example.com",
      joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      sharePhone: true,
      phone: "+34 600 123 456",
    },
  ],
  purchases: [
    // Demo: operator already purchased tour #3 contacts
    {
      id: "demo-purchase-1",
      tourId: "3",
      operatorEmail: "contact@atacama.com",
      purchasedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      dealClosed: false,
    },
  ],
  bans: [],
  reviewedOperatorEmails: ["contact@atacama.com"],
};

interface StoreContextValue {
  state: StoreState;
  // tour-derived helpers
  allTours: Tour[];
  toursById: Record<string, Tour>;
  // mutations
  createTour: (tour: Omit<Tour, "id" | "currentMembers" | "status"> & { currentMembers?: number; status?: Tour["status"] }) => Tour;
  updateTour: (id: string, patch: Partial<Tour>) => void;
  cancelTour: (id: string) => void;
  deleteTour: (id: string) => void;
  forceCloseTour: (id: string) => void;
  restoreTour: (id: string) => void;
  joinTour: (tourId: string, email: string, sharePhone: boolean, phone?: string) => void;
  leaveTour: (tourId: string, email: string) => void;
  isMember: (tourId: string, email: string) => boolean;
  membersOf: (tourId: string) => Membership[];
  // purchases
  hasPurchased: (tourId: string, operatorEmail: string) => boolean;
  purchasesByOperator: (operatorEmail: string) => Purchase[];
  purchaseContacts: (tourId: string, operatorEmail: string) => Purchase | null;
  setDealClosed: (purchaseId: string, value: number | null) => void;
  // admin
  banUser: (email: string, reason: string) => void;
  unbanUser: (email: string) => void;
  isBanned: (email: string) => boolean;
  toggleOperatorReviewed: (email: string) => void;
  isOperatorReviewed: (email: string) => boolean;
  resetStore: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StoreState>(INITIAL);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoreState;
        setState({ ...INITIAL, ...parsed });
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore quota
    }
  }, [state, hydrated]);

  const allTours = useMemo(() => {
    const merged: Tour[] = mockTours.map((t) => {
      let status = t.status;
      if (state.cancelledTourIds.includes(t.id)) status = "cancelled";
      else if (state.forceClosedTourIds.includes(t.id)) status = "closed";
      const memberCount = state.memberships.filter((m) => m.tourId === t.id).length;
      // memberships override the seeded count (so joins/leaves feel live)
      const userJoined = memberCount > 0;
      const currentMembers = userJoined
        ? Math.min(t.currentMembers + (memberCount - (t.id === "1" ? 1 : 0)), t.maxMembers)
        : t.currentMembers;
      return { ...t, status, currentMembers };
    });
    const customs = state.customTours.filter((t) => !state.deletedTourIds.includes(t.id));
    return [...customs, ...merged].filter((t) => !state.deletedTourIds.includes(t.id));
  }, [state]);

  const toursById = useMemo(() => {
    const map: Record<string, Tour> = {};
    for (const t of allTours) map[t.id] = t;
    return map;
  }, [allTours]);

  const createTour = useCallback<StoreContextValue["createTour"]>(
    (tour) => {
      const id = `custom-${Date.now()}`;
      const next: Tour = {
        ...tour,
        id,
        currentMembers: tour.currentMembers ?? 1,
        status: tour.status ?? "open",
      };
      setState((s) => ({ ...s, customTours: [next, ...s.customTours] }));
      return next;
    },
    []
  );

  const updateTour = useCallback<StoreContextValue["updateTour"]>((id, patch) => {
    setState((s) => ({
      ...s,
      customTours: s.customTours.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));
  }, []);

  const cancelTour = useCallback<StoreContextValue["cancelTour"]>((id) => {
    setState((s) => ({
      ...s,
      cancelledTourIds: s.cancelledTourIds.includes(id)
        ? s.cancelledTourIds
        : [...s.cancelledTourIds, id],
    }));
  }, []);

  const deleteTour = useCallback<StoreContextValue["deleteTour"]>((id) => {
    setState((s) => ({
      ...s,
      deletedTourIds: s.deletedTourIds.includes(id)
        ? s.deletedTourIds
        : [...s.deletedTourIds, id],
    }));
  }, []);

  const forceCloseTour = useCallback<StoreContextValue["forceCloseTour"]>((id) => {
    setState((s) => ({
      ...s,
      forceClosedTourIds: s.forceClosedTourIds.includes(id)
        ? s.forceClosedTourIds
        : [...s.forceClosedTourIds, id],
    }));
  }, []);

  const restoreTour = useCallback<StoreContextValue["restoreTour"]>((id) => {
    setState((s) => ({
      ...s,
      deletedTourIds: s.deletedTourIds.filter((x) => x !== id),
      cancelledTourIds: s.cancelledTourIds.filter((x) => x !== id),
    }));
  }, []);

  const joinTour = useCallback<StoreContextValue["joinTour"]>(
    (tourId, email, sharePhone, phone) => {
      setState((s) => {
        if (s.memberships.some((m) => m.tourId === tourId && m.userEmail === email)) {
          return s;
        }
        return {
          ...s,
          memberships: [
            ...s.memberships,
            {
              tourId,
              userEmail: email,
              joinedAt: new Date().toISOString(),
              sharePhone,
              phone: sharePhone ? phone : undefined,
            },
          ],
        };
      });
    },
    []
  );

  const leaveTour = useCallback<StoreContextValue["leaveTour"]>((tourId, email) => {
    setState((s) => ({
      ...s,
      memberships: s.memberships.filter(
        (m) => !(m.tourId === tourId && m.userEmail === email)
      ),
    }));
  }, []);

  const isMember = useCallback(
    (tourId: string, email: string) =>
      state.memberships.some((m) => m.tourId === tourId && m.userEmail === email),
    [state.memberships]
  );

  const membersOf = useCallback(
    (tourId: string) => state.memberships.filter((m) => m.tourId === tourId),
    [state.memberships]
  );

  const hasPurchased = useCallback(
    (tourId: string, operatorEmail: string) =>
      state.purchases.some(
        (p) => p.tourId === tourId && p.operatorEmail === operatorEmail
      ),
    [state.purchases]
  );

  const purchasesByOperator = useCallback(
    (operatorEmail: string) =>
      state.purchases.filter((p) => p.operatorEmail === operatorEmail),
    [state.purchases]
  );

  const purchaseContacts = useCallback<StoreContextValue["purchaseContacts"]>(
    (tourId, operatorEmail) => {
      if (state.purchases.some((p) => p.tourId === tourId && p.operatorEmail === operatorEmail)) {
        return null;
      }
      const purchase: Purchase = {
        id: `purchase-${Date.now()}`,
        tourId,
        operatorEmail,
        purchasedAt: new Date().toISOString(),
        dealClosed: false,
      };
      setState((s) => ({ ...s, purchases: [...s.purchases, purchase] }));
      return purchase;
    },
    [state.purchases]
  );

  const setDealClosed = useCallback<StoreContextValue["setDealClosed"]>(
    (purchaseId, value) => {
      setState((s) => ({
        ...s,
        purchases: s.purchases.map((p) =>
          p.id === purchaseId
            ? {
                ...p,
                dealClosed: value !== null,
                dealValue: value !== null ? value : undefined,
              }
            : p
        ),
      }));
    },
    []
  );

  const banUser = useCallback<StoreContextValue["banUser"]>((email, reason) => {
    setState((s) => ({
      ...s,
      bans: [
        ...s.bans.filter((b) => b.userEmail !== email),
        { userEmail: email, reason, bannedAt: new Date().toISOString() },
      ],
    }));
  }, []);

  const unbanUser = useCallback<StoreContextValue["unbanUser"]>((email) => {
    setState((s) => ({ ...s, bans: s.bans.filter((b) => b.userEmail !== email) }));
  }, []);

  const isBanned = useCallback(
    (email: string) => state.bans.some((b) => b.userEmail === email),
    [state.bans]
  );

  const toggleOperatorReviewed = useCallback<
    StoreContextValue["toggleOperatorReviewed"]
  >((email) => {
    setState((s) => ({
      ...s,
      reviewedOperatorEmails: s.reviewedOperatorEmails.includes(email)
        ? s.reviewedOperatorEmails.filter((e) => e !== email)
        : [...s.reviewedOperatorEmails, email],
    }));
  }, []);

  const isOperatorReviewed = useCallback(
    (email: string) => state.reviewedOperatorEmails.includes(email),
    [state.reviewedOperatorEmails]
  );

  const resetStore = useCallback(() => {
    setState(INITIAL);
  }, []);

  return (
    <StoreContext.Provider
      value={{
        state,
        allTours,
        toursById,
        createTour,
        updateTour,
        cancelTour,
        deleteTour,
        forceCloseTour,
        restoreTour,
        joinTour,
        leaveTour,
        isMember,
        membersOf,
        hasPurchased,
        purchasesByOperator,
        purchaseContacts,
        setDealClosed,
        banUser,
        unbanUser,
        isBanned,
        toggleOperatorReviewed,
        isOperatorReviewed,
        resetStore,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
