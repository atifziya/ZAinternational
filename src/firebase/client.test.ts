import { describe, expect, it } from 'vitest';
import { getFirebaseConfigDiagnostic, hasFirebaseConfig } from './client';

describe('Firebase client initialization & diagnostics', () => {
  it('detects valid configuration without missing required fields', () => {
    const diagnostic = getFirebaseConfigDiagnostic();
    expect(diagnostic.configured).toBe(true);
    expect(diagnostic.missingFields).toEqual([]);
    expect(hasFirebaseConfig).toBe(true);
  });
});
