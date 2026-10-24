import { describe, expect, it } from 'vitest';
import { enquirySchema } from './schema';

const validEnquiry = {
  name: 'Amina Khan', phone: '+91 88773 85139', email: 'amina@example.com', category: 'umrah', selectedItem: 'Legacy Umrah', travelDate: '2027-01-10', message: 'Please tell me which current Umrah options are available.', consent: true,
};

describe('enquirySchema', () => {
  it('accepts a minimal safe, consented enquiry', () => {
    expect(enquirySchema.safeParse(validEnquiry).success).toBe(true);
  });

  it('rejects submissions without consent or enough context', () => {
    expect(enquirySchema.safeParse({ ...validEnquiry, consent: false }).success).toBe(false);
    expect(enquirySchema.safeParse({ ...validEnquiry, message: 'Help' }).success).toBe(false);
  });
});
