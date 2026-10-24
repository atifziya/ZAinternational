import { describe, expect, it } from 'vitest';
import { legacyPackages, siteSettings } from './legacyContent';

describe('migrated legacy content', () => {
  it('preserves the three original Umrah listings as enquiry-first records', () => {
    expect(legacyPackages).toHaveLength(3);
    expect(new Set(legacyPackages.map((item) => item.slug)).size).toBe(3);
    expect(legacyPackages.every((item) => item.category === 'umrah' && item.availability.toLowerCase().includes('enquire'))).toBe(true);
  });

  it('keeps usable contact and map information', () => {
    expect(siteSettings.email).toBe('info@zainternational.co.in');
    expect(siteSettings.mapEmbedUrl).toContain('google.com/maps/embed');
  });
});
