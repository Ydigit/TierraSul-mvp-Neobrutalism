/**
 * Profile-view policy.
 *
 * Centralizes the 5 viewing contexts and what each is allowed to see.
 * Used by GroupProfileView to render consistently across surfaces
 * (tour detail, operator browse, admin) and by helper utilities to
 * format the user's displayed name.
 *
 * Privacy invariants (must hold in every consumer):
 *   1. Operators never see more than they paid for.
 *   2. Travelers never see other travelers' contact info.
 *   3. Last names are reduced to an initial for OTHER_TRAVELER.
 *   4. OPERATOR_PREVIEW substitutes the name with "Traveler #N".
 *
 * Access rule (per 2026-05-28 decision): OTHER_TRAVELER access is gated on
 * authentication, NOT on group membership. Any authenticated traveler can
 * preview a group's members (vibe check before joining). Visitors still see
 * nothing. The anonymized-name rule (#3) is what keeps this safe.
 */

export type ProfileViewContext =
  | "SELF"
  | "OTHER_TRAVELER"
  | "OPERATOR_PREVIEW"
  | "OPERATOR_PURCHASED"
  | "ADMIN";

export interface ProfileVisibility {
  showAvatar: boolean;
  showFirstName: boolean;
  /** Full last name(s). When false, only the initial is shown (or hidden entirely). */
  showLastName: boolean;
  /** If true, render "Traveler #N" instead of any real name. */
  showAnonId: boolean;
  showCountry: boolean;
  showAge: boolean;
  showLanguages: boolean;
  showBio: boolean;
  showGallery: boolean;
  showEmail: boolean;
  /** Phone visibility — actual reveal also depends on whether user opted in for this tour. */
  showPhone: boolean;
  /** Whether the viewer is allowed to report this profile. */
  canReport: boolean;
}

export function visibilityFor(ctx: ProfileViewContext): ProfileVisibility {
  switch (ctx) {
    case "SELF":
    case "ADMIN":
      return {
        showAvatar: true,
        showFirstName: true,
        showLastName: true,
        showAnonId: false,
        showCountry: true,
        showAge: true,
        showLanguages: true,
        showBio: true,
        showGallery: true,
        showEmail: true,
        showPhone: true,
        canReport: false,
      };
    case "OPERATOR_PURCHASED":
      return {
        showAvatar: true,
        showFirstName: true,
        showLastName: true,
        showAnonId: false,
        showCountry: true,
        showAge: true,
        showLanguages: true,
        showBio: true,
        showGallery: true,
        showEmail: true,
        showPhone: true,
        canReport: true,
      };
    case "OTHER_TRAVELER":
      return {
        showAvatar: true,
        showFirstName: true,
        showLastName: false, // initial only
        showAnonId: false,
        showCountry: true,
        showAge: true,
        showLanguages: true,
        showBio: true,
        showGallery: true,
        showEmail: false,
        showPhone: false,
        canReport: true,
      };
    case "OPERATOR_PREVIEW":
      return {
        showAvatar: true,
        showFirstName: false,
        showLastName: false,
        showAnonId: true,
        showCountry: true,
        showAge: false,
        showLanguages: true,
        showBio: false,
        showGallery: false,
        showEmail: false,
        showPhone: false,
        canReport: false,
      };
  }
}

/**
 * Returns the name as it should appear to the viewer.
 *
 * Rules:
 *   - SELF / ADMIN / OPERATOR_PURCHASED → full name
 *   - OPERATOR_PREVIEW → "Traveler #N" (needs `previewIndex`)
 *   - OTHER_TRAVELER → first token + initial of last token + "."
 *       • "Maria"                       → "Maria"        (single token, can't anonymize further)
 *       • "Maria Silva"                 → "Maria S."
 *       • "Ana Sofia Pinto"             → "Ana P."
 *       • "Maria José Silva Santos"     → "Maria S."
 */
export function displayName(
  fullName: string,
  ctx: ProfileViewContext,
  opts?: { previewIndex?: number }
): string {
  const trimmed = (fullName ?? "").trim();
  switch (ctx) {
    case "SELF":
    case "ADMIN":
    case "OPERATOR_PURCHASED":
      return trimmed;
    case "OPERATOR_PREVIEW": {
      const n = opts?.previewIndex ?? 1;
      return `Traveler #${n}`;
    }
    case "OTHER_TRAVELER": {
      if (!trimmed) return "";
      const tokens = trimmed.split(/\s+/);
      if (tokens.length === 1) return tokens[0];
      const first = tokens[0];
      const lastInitial = (tokens[tokens.length - 1][0] ?? "").toUpperCase();
      return lastInitial ? `${first} ${lastInitial}.` : first;
    }
  }
}
