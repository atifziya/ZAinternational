import { describe, expect, it } from 'vitest';
import { resources } from './i18n';

describe('i18n translation parity and accuracy', () => {
  const getKeys = (obj: Record<string, unknown>, prefix = ''): string[] => {
    return Object.entries(obj).flatMap(([key, value]) => {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        return getKeys(value as Record<string, unknown>, fullPath);
      }
      return [fullPath];
    });
  };

  const enKeys = getKeys(resources.en.translation);
  const hiKeys = getKeys(resources.hi.translation);
  const urKeys = getKeys(resources.ur.translation);

  it('contains comprehensive translation keys in English', () => {
    expect(enKeys.length).toBeGreaterThan(40);
    expect(enKeys).toContain('nav.home');
    expect(enKeys).toContain('nav.hajj');
    expect(enKeys).toContain('nav.umrah');
    expect(enKeys).toContain('nav.jobs');
    expect(enKeys).toContain('home.title');
    expect(enKeys).toContain('services.hajjUmrahTitle');
    expect(enKeys).toContain('form.fullName');
    expect(enKeys).toContain('footer.mission');
  });

  it('matches all English translation keys in Hindi dictionary', () => {
    const missingInHi = enKeys.filter((key) => !hiKeys.includes(key));
    expect(missingInHi).toEqual([]);
  });

  it('matches all English translation keys in Urdu dictionary', () => {
    const missingInUr = enKeys.filter((key) => !urKeys.includes(key));
    expect(missingInUr).toEqual([]);
  });

  it('preserves authentic company details in Hindi and Urdu', () => {
    expect(resources.hi.translation.about.legacyHeading).toBe('विश्वास की एक विरासत');
    expect(resources.ur.translation.about.legacyHeading).toBe('اعتماد کی ایک وراثت');
    expect(resources.hi.translation.home.title).toContain('आध्यात्मिक और पेशेवर');
    expect(resources.ur.translation.home.title).toContain('روحانی اور پیشہ ورانہ');
  });
});
