/**
 * Client-side image upload constraints. Backend will re-validate.
 */

export const ALLOWED_IMAGE_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

/** 2 MB per photo. */
export const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

export interface ImageValidationResult {
  ok: boolean;
  error?: string;
}

export function validateImageFile(file: File): ImageValidationResult {
  if (!ALLOWED_IMAGE_MIMES.includes(file.type as (typeof ALLOWED_IMAGE_MIMES)[number])) {
    return {
      ok: false,
      error: "Only JPG, PNG or WebP files are allowed.",
    };
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    const mb = (MAX_IMAGE_SIZE_BYTES / (1024 * 1024)).toFixed(0);
    return {
      ok: false,
      error: `Each photo must be under ${mb} MB.`,
    };
  }
  return { ok: true };
}
