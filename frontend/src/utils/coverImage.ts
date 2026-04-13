export const FALLBACK_COVER_URL = '/fallback-cover.svg';

/**
 * Resolves the cover image URL for a track.
 * iTunes API lookup happens at data entry time, so the DB cover_url
 * already contains the resolved URL. This function just handles the
 * fallback when no URL is stored.
 *
 * Priority: DB cover_url → default fallback image
 */
export function resolveCoverUrl(coverUrl: string | null): string {
  if (coverUrl && coverUrl.trim().length > 0) {
    return coverUrl;
  }
  return FALLBACK_COVER_URL;
}
