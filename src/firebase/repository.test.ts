import { describe, expect, it } from 'vitest';
import { blankJob, blankPackage, publishOptions } from './repository';

describe('repository data structures', () => {
  it('creates valid initial blank packages', () => {
    const pkg = blankPackage();
    expect(pkg.id).toBeDefined();
    expect(pkg.status).toBe('draft');
    expect(pkg.category).toBe('umrah');
    expect(pkg.currency).toBe('INR');
    expect(Array.isArray(pkg.itinerary)).toBe(true);
    expect(Array.isArray(pkg.inclusions)).toBe(true);
    expect(Array.isArray(pkg.exclusions)).toBe(true);
    expect(pkg.availability).toContain('Enquire');
  });

  it('creates valid initial blank jobs', () => {
    const job = blankJob();
    expect(job.id).toBeDefined();
    expect(job.status).toBe('draft');
    expect(Array.isArray(job.requirements)).toBe(true);
    expect(Array.isArray(job.benefits)).toBe(true);
  });

  it('provides all 4 lifecycle publish statuses', () => {
    const values = publishOptions.map((o) => o.value);
    expect(values).toEqual(['draft', 'published', 'closed', 'archived']);
  });
});
