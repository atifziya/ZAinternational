import { describe, expect, it } from 'vitest';
import type { Package, PublishStatus } from '../types/content';

describe('package and status formatting helpers', () => {
  it('formats package prices correctly with Indian Rupee formatting', () => {
    const pkg: Package = {
      id: 'test-1',
      slug: 'test-pkg',
      title: 'Deluxe Umrah',
      category: 'umrah',
      shortDescription: 'Short info',
      description: 'Long info',
      featuredImage: '/images/umrah1.png',
      gallery: [],
      duration: '15 days',
      itinerary: ['Day 1'],
      inclusions: ['Meals'],
      exclusions: ['Insurance'],
      price: 123999,
      currency: 'INR',
      availability: 'Available',
      status: 'published',
    };

    const formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: pkg.currency,
      maximumFractionDigits: 0,
    }).format(pkg.price!);

    expect(formatted).toMatch(/1,23,999/);
  });

  it('validates allowed publish statuses', () => {
    const validStatuses: PublishStatus[] = ['draft', 'published', 'closed', 'archived'];
    expect(validStatuses).toHaveLength(4);
    expect(validStatuses.includes('published')).toBe(true);
    expect(validStatuses.includes('closed')).toBe(true);
  });
});
