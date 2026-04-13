import { describe, it, expect } from 'vitest';
import { resolveCoverUrl, FALLBACK_COVER_URL } from './coverImage';

describe('resolveCoverUrl', () => {
  it('returns the cover URL when a valid URL is provided', () => {
    const url = 'https://example.com/cover.jpg';
    expect(resolveCoverUrl(url)).toBe(url);
  });

  it('returns fallback when coverUrl is null', () => {
    expect(resolveCoverUrl(null)).toBe(FALLBACK_COVER_URL);
  });

  it('returns fallback when coverUrl is an empty string', () => {
    expect(resolveCoverUrl('')).toBe(FALLBACK_COVER_URL);
  });

  it('returns fallback when coverUrl is whitespace only', () => {
    expect(resolveCoverUrl('   ')).toBe(FALLBACK_COVER_URL);
  });

  it('returns the URL when it has leading/trailing spaces but non-empty content', () => {
    expect(resolveCoverUrl('  https://example.com/cover.jpg  ')).toBe(
      '  https://example.com/cover.jpg  '
    );
  });
});
