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
import {
  shouldAutoClose,
  canReopen,
  GRACE_DEFICIT_WINDOW_MS,
} from "@/lib/group-state";

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

export interface PhotoUploadLog {
  id: string;
  userEmail: string;
  userName: string;
  photoUrl: string;
  uploadedAt: string;
  /** Set when admin marks the upload as reviewed (tracking only — doesn't block). */
  reviewedAt?: string;
}

export interface ProfileReport {
  id: string;
  reportedEmail: string;
  reportedName: string;
  reporterEmail: string;
  reason: string;
  createdAt: string;
  /** Set when admin closes the report. */
  resolvedAt?: string;
}

/** Per-tour timer overrides set by mutations. Layered on top of the seed. */
interface TourTimerOverride {
  minReachedAt?: string;
  closedAt?: string;
  /** ISO timestamp of entry into CLOSED-DEFICIT sub-state (24h window). */
  gracePeriodStartedAt?: string;
}

interface StoreState {
  customTours: Tour[];
  cancelledTourIds: string[];
  deletedTourIds: string[];
  forceClosedTourIds: string[];
  /** Set by the timer reset on reopen — id is removed instead of just filtering ids. */
  tourTimers: Record<string, TourTimerOverride>;
  memberships: Membership[];
  purchases: Purchase[];
  bans: AdminBan[];
  reviewedOperatorEmails: string[];
  photoUploadLog: PhotoUploadLog[];
  reports: ProfileReport[];
}

const STORAGE_KEY = "tierrasul:store";

const INITIAL: StoreState = {
  customTours: [],
  cancelledTourIds: [],
  deletedTourIds: [],
  forceClosedTourIds: [],
  tourTimers: {},
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
  photoUploadLog: [],
  reports: [],
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
  // moderation
  logPhotoUploads: (
    userEmail: string,
    userName: string,
    photoUrls: string[]
  ) => void;
  markPhotoReviewed: (id: string) => void;
  deletePhotoUploadEntry: (id: string) => void;
  submitReport: (input: {
    reportedEmail: string;
    reportedName: string;
    reporterEmail: string;
    reason: string;
  }) => void;
  resolveReport: (id: string) => void;
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

  /**
   * Single source of truth for a tour's effective shape given current state.
   * Layers seed/custom data with status overrides (cancel / force-close) and
   * timer overrides (minReachedAt, closedAt) tracked by the store.
   */
  const allTours = useMemo(() => {
    const apply = (base: Tour, isSeed: boolean): Tour => {
      let status = base.status;
      if (state.cancelledTourIds.includes(base.id)) status = "cancelled";
      else if (state.forceClosedTourIds.includes(base.id)) status = "closed";
      const memberCount = state.memberships.filter(
        (m) => m.tourId === base.id
      ).length;
      // memberships override the seeded count (so joins/leaves feel live)
      const seededDelta = isSeed && base.id === "1" ? 1 : 0;
      const currentMembers =
        memberCount > 0
          ? Math.min(
              base.currentMembers + (memberCount - seededDelta),
              base.maxMembers
            )
          : base.currentMembers;
      const timer = state.tourTimers[base.id] ?? {};
      return {
        ...base,
        status,
        currentMembers,
        minReachedAt: timer.minReachedAt ?? base.minReachedAt,
        closedAt: timer.closedAt ?? base.closedAt,
        gracePeriodStartedAt:
          timer.gracePeriodStartedAt ?? base.gracePeriodStartedAt,
      };
    };
    const seeded = mockTours.map((t) => apply(t, true));
    const customs = state.customTours
      .filter((t) => !state.deletedTourIds.includes(t.id))
      .map((t) => apply(t, false));
    return [...customs, ...seeded].filter(
      (t) => !state.deletedTourIds.includes(t.id)
    );
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
        if (
          s.memberships.some(
            (m) => m.tourId === tourId && m.userEmail === email
          )
        ) {
          return s;
        }
        const nextMemberships = [
          ...s.memberships,
          {
            tourId,
            userEmail: email,
            joinedAt: new Date().toISOString(),
            sharePhone,
            phone: sharePhone ? phone : undefined,
          },
        ];

        // Recompute what the tour will look like after this join, then check
        // whether (a) we just crossed the min threshold (trip the 48h timer)
        // or (b) we just hit max (close immediately).
        const seedTour = mockTours.find((t) => t.id === tourId);
        const customTour = s.customTours.find((t) => t.id === tourId);
        const baseTour = customTour ?? seedTour;
        if (!baseTour) return { ...s, memberships: nextMemberships };

        const isSeed = !!seedTour;
        const seededDelta = isSeed && tourId === "1" ? 1 : 0;
        const memberCount = nextMemberships.filter((m) => m.tourId === tourId)
          .length;
        const newCurrent =
          memberCount > 0
            ? Math.min(
                baseTour.currentMembers + (memberCount - seededDelta),
                baseTour.maxMembers
              )
            : baseTour.currentMembers;

        const existingTimer = s.tourTimers[tourId] ?? {};
        const currentMinReached =
          existingTimer.minReachedAt ?? baseTour.minReachedAt;
        const nextTimer: TourTimerOverride = { ...existingTimer };
        let nextForceClosed = s.forceClosedTourIds;

        // (a) First time crossing the min threshold → start the clock.
        if (!currentMinReached && newCurrent >= baseTour.minMembers) {
          nextTimer.minReachedAt = new Date().toISOString();
        }

        // (b) Reaching max → close immediately.
        if (
          newCurrent >= baseTour.maxMembers &&
          !nextForceClosed.includes(tourId)
        ) {
          nextForceClosed = [...nextForceClosed, tourId];
          nextTimer.closedAt = new Date().toISOString();
        }

        // (c) Grace recovery: if we were in CLOSED-DEFICIT and a new join
        // brings the count back to >= min, clear the grace timer.
        const wasClosed =
          nextForceClosed.includes(tourId) || baseTour.status === "closed";
        if (
          wasClosed &&
          nextTimer.gracePeriodStartedAt &&
          newCurrent >= baseTour.minMembers
        ) {
          delete nextTimer.gracePeriodStartedAt;
        }

        return {
          ...s,
          memberships: nextMemberships,
          tourTimers: { ...s.tourTimers, [tourId]: nextTimer },
          forceClosedTourIds: nextForceClosed,
        };
      });
    },
    []
  );

  const leaveTour = useCallback<StoreContextValue["leaveTour"]>(
    (tourId, email) => {
      setState((s) => {
        const nextMemberships = s.memberships.filter(
          (m) => !(m.tourId === tourId && m.userEmail === email)
        );
        if (nextMemberships.length === s.memberships.length) return s;

        // Evaluate reopen rule (single-step rollback only).
        const seedTour = mockTours.find((t) => t.id === tourId);
        const customTour = s.customTours.find((t) => t.id === tourId);
        const baseTour = customTour ?? seedTour;
        if (!baseTour) return { ...s, memberships: nextMemberships };

        const isSeed = !!seedTour;
        const seededDelta = isSeed && tourId === "1" ? 1 : 0;
        const memberCount = nextMemberships.filter((m) => m.tourId === tourId)
          .length;
        const newCurrent =
          memberCount > 0
            ? Math.min(
                baseTour.currentMembers + (memberCount - seededDelta),
                baseTour.maxMembers
              )
            : baseTour.currentMembers;

        const isClosed = s.forceClosedTourIds.includes(tourId) ||
          baseTour.status === "closed";
        const operatorsContacted = s.purchases.filter(
          (p) => p.tourId === tourId
        ).length;

        // Reuse the pure helper. Pass a synthesized tour reflecting the
        // post-leave state.
        const synthesized: Tour = {
          ...baseTour,
          status: isClosed ? "closed" : baseTour.status,
          currentMembers: newCurrent,
        };

        if (canReopen(synthesized, operatorsContacted)) {
          // Reopen: drop force-closed flag, drop closedAt + grace timer. Keep
          // minReachedAt gone so the next min-hit restarts a fresh 48h window.
          const nextTimer: TourTimerOverride = {
            ...(s.tourTimers[tourId] ?? {}),
          };
          delete nextTimer.minReachedAt;
          delete nextTimer.closedAt;
          delete nextTimer.gracePeriodStartedAt;
          return {
            ...s,
            memberships: nextMemberships,
            forceClosedTourIds: s.forceClosedTourIds.filter(
              (id) => id !== tourId
            ),
            tourTimers: { ...s.tourTimers, [tourId]: nextTimer },
          };
        }

        // Grace Deficit: a single-seat drop on a CLOSED group with 0 ops
        // triggers the 24h recovery window instead of reopening.
        const enteringGraceDeficit =
          isClosed &&
          operatorsContacted === 0 &&
          newCurrent === baseTour.minMembers - 1 &&
          !(s.tourTimers[tourId]?.gracePeriodStartedAt);
        if (enteringGraceDeficit) {
          const nextTimer: TourTimerOverride = {
            ...(s.tourTimers[tourId] ?? {}),
            gracePeriodStartedAt: new Date().toISOString(),
          };
          return {
            ...s,
            memberships: nextMemberships,
            tourTimers: { ...s.tourTimers, [tourId]: nextTimer },
          };
        }

        // Operator already purchased → grace timer becomes irrelevant.
        if (isClosed && operatorsContacted > 0) {
          const t = s.tourTimers[tourId];
          if (t?.gracePeriodStartedAt) {
            const nextTimer = { ...t };
            delete nextTimer.gracePeriodStartedAt;
            return {
              ...s,
              memberships: nextMemberships,
              tourTimers: { ...s.tourTimers, [tourId]: nextTimer },
            };
          }
        }

        return { ...s, memberships: nextMemberships };
      });
    },
    []
  );

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

  const logPhotoUploads = useCallback<StoreContextValue["logPhotoUploads"]>(
    (userEmail, userName, photoUrls) => {
      if (photoUrls.length === 0) return;
      const now = new Date().toISOString();
      const baseId = Date.now();
      const entries: PhotoUploadLog[] = photoUrls.map((url, i) => ({
        id: `pu-${baseId}-${i}`,
        userEmail,
        userName,
        photoUrl: url,
        uploadedAt: now,
      }));
      setState((s) => ({
        ...s,
        photoUploadLog: [...entries, ...s.photoUploadLog],
      }));
    },
    []
  );

  const markPhotoReviewed = useCallback<
    StoreContextValue["markPhotoReviewed"]
  >((id) => {
    const now = new Date().toISOString();
    setState((s) => ({
      ...s,
      photoUploadLog: s.photoUploadLog.map((p) =>
        p.id === id ? { ...p, reviewedAt: now } : p
      ),
    }));
  }, []);

  const deletePhotoUploadEntry = useCallback<
    StoreContextValue["deletePhotoUploadEntry"]
  >((id) => {
    setState((s) => ({
      ...s,
      photoUploadLog: s.photoUploadLog.filter((p) => p.id !== id),
    }));
  }, []);

  const submitReport = useCallback<StoreContextValue["submitReport"]>(
    ({ reportedEmail, reportedName, reporterEmail, reason }) => {
      const entry: ProfileReport = {
        id: `r-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        reportedEmail,
        reportedName,
        reporterEmail,
        reason,
        createdAt: new Date().toISOString(),
      };
      setState((s) => ({ ...s, reports: [entry, ...s.reports] }));
    },
    []
  );

  const resolveReport = useCallback<StoreContextValue["resolveReport"]>(
    (id) => {
      const now = new Date().toISOString();
      setState((s) => ({
        ...s,
        reports: s.reports.map((r) =>
          r.id === id ? { ...r, resolvedAt: now } : r
        ),
      }));
    },
    []
  );

  /**
   * Closes any tour whose 48h window has expired. Idempotent — safe to call
   * on a timer. In a real backend this would be a cron; here a setInterval
   * mounted alongside the provider keeps the demo coherent.
   */
  const tickGroupClosure = useCallback(() => {
    setState((s) => {
      const toClose: { id: string; closedAt: string }[] = [];
      const now = new Date().toISOString();

      // Walk seed + customs through the same derivation as allTours.
      const candidates: { base: Tour; isSeed: boolean }[] = [
        ...mockTours.map((t) => ({ base: t, isSeed: true })),
        ...s.customTours.map((t) => ({ base: t, isSeed: false })),
      ];

      for (const { base, isSeed } of candidates) {
        if (s.deletedTourIds.includes(base.id)) continue;
        if (s.cancelledTourIds.includes(base.id)) continue;
        if (s.forceClosedTourIds.includes(base.id)) continue;

        const memberCount = s.memberships.filter(
          (m) => m.tourId === base.id
        ).length;
        const seededDelta = isSeed && base.id === "1" ? 1 : 0;
        const currentMembers =
          memberCount > 0
            ? Math.min(
                base.currentMembers + (memberCount - seededDelta),
                base.maxMembers
              )
            : base.currentMembers;
        const timer = s.tourTimers[base.id] ?? {};
        const synthesized: Tour = {
          ...base,
          currentMembers,
          minReachedAt: timer.minReachedAt ?? base.minReachedAt,
          closedAt: timer.closedAt ?? base.closedAt,
          status: base.status,
        };
        if (shouldAutoClose(synthesized)) {
          toClose.push({ id: base.id, closedAt: now });
        }
      }

      // Expire any grace-deficit timer past 24h — group stays CLOSED, just
      // without an active recovery window.
      let timersAfterGrace = s.tourTimers;
      let graceExpired = false;
      for (const [id, t] of Object.entries(s.tourTimers)) {
        if (!t.gracePeriodStartedAt) continue;
        const elapsed =
          Date.now() - new Date(t.gracePeriodStartedAt).getTime();
        if (elapsed >= GRACE_DEFICIT_WINDOW_MS) {
          if (!graceExpired) {
            timersAfterGrace = { ...s.tourTimers };
            graceExpired = true;
          }
          const cleaned = { ...timersAfterGrace[id] };
          delete cleaned.gracePeriodStartedAt;
          timersAfterGrace[id] = cleaned;
        }
      }

      if (toClose.length === 0 && !graceExpired) return s;
      const newTimers = { ...timersAfterGrace };
      for (const c of toClose) {
        newTimers[c.id] = { ...(newTimers[c.id] ?? {}), closedAt: c.closedAt };
      }
      return {
        ...s,
        forceClosedTourIds: [
          ...s.forceClosedTourIds,
          ...toClose.map((c) => c.id),
        ],
        tourTimers: newTimers,
      };
    });
  }, []);

  // Mount the global ticker: scan every 30s for tours whose window expired.
  useEffect(() => {
    if (!hydrated) return;
    tickGroupClosure(); // run once on mount so a hot reload catches up
    const id = window.setInterval(tickGroupClosure, 30_000);
    return () => window.clearInterval(id);
  }, [hydrated, tickGroupClosure]);

  const resetStore = useCallback(() => {
    setState(INITIAL);
  }, []);

  const value = useMemo<StoreContextValue>(
    () => ({
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
      logPhotoUploads,
      markPhotoReviewed,
      deletePhotoUploadEntry,
      submitReport,
      resolveReport,
      resetStore,
    }),
    [
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
      logPhotoUploads,
      markPhotoReviewed,
      deletePhotoUploadEntry,
      submitReport,
      resolveReport,
      resetStore,
    ]
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
