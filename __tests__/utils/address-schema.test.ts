import { AddressSchema } from '@/utils/schemas';

describe('Address Schema Validation', () => {
  it('should validate a complete valid address', () => {
    const validAddress = {
      nameAddress: 'Home',
      address: '123 Main St',
      country: 'US',
      state: 'California',
      city: 'Los Angeles',
      postalCode: '90001',
      primaryAddress: false,
    };

    const result = AddressSchema.safeParse(validAddress);
    expect(result.success).toBe(true);
  });

  it('should require nameAddress field', () => {
    const invalidAddress = {
      address: '123 Main St',
      country: 'US',
      state: 'California',
      city: 'Los Angeles',
      postalCode: '90001',
    };

    const result = AddressSchema.safeParse(invalidAddress);
    expect(result.success).toBe(false);
  });

  it('should require address field', () => {
    const invalidAddress = {
      nameAddress: 'Home',
      country: 'US',
      state: 'California',
      city: 'Los Angeles',
      postalCode: '90001',
    };

    const result = AddressSchema.safeParse(invalidAddress);
    expect(result.success).toBe(false);
  });

  it('should require country field', () => {
    const invalidAddress = {
      nameAddress: 'Home',
      address: '123 Main St',
      state: 'California',
      city: 'Los Angeles',
      postalCode: '90001',
    };

    const result = AddressSchema.safeParse(invalidAddress);
    expect(result.success).toBe(false);
  });

  it('should validate minimum address length', () => {
    const shortAddress = {
      nameAddress: 'Home',
      address: '12',
      country: 'US',
      state: 'California',
      city: 'Los Angeles',
      postalCode: '90001',
    };

    const result = AddressSchema.safeParse(shortAddress);
    expect(result.success).toBe(false);
  });

  it('should accept optional primaryAddress field', () => {
    const addressWithPrimary = {
      nameAddress: 'Home',
      address: '123 Main St',
      country: 'US',
      state: 'California',
      city: 'Los Angeles',
      postalCode: '90001',
      primaryAddress: true,
    };

    const addressWithoutPrimary = {
      nameAddress: 'Work',
      address: '456 Office Ave',
      country: 'US',
      state: 'California',
      city: 'San Francisco',
      postalCode: '94102',
    };

    expect(AddressSchema.safeParse(addressWithPrimary).success).toBe(true);
    expect(AddressSchema.safeParse(addressWithoutPrimary).success).toBe(true);
  });

  it('should reject empty strings for required fields', () => {
    const emptyFields = {
      nameAddress: '',
      address: '',
      country: '',
      state: '',
      city: '',
      postalCode: '',
    };

    const result = AddressSchema.safeParse(emptyFields);
    expect(result.success).toBe(false);
  });

  it('should validate city minimum length', () => {
    const shortCity = {
      nameAddress: 'Home',
      address: '123 Main St',
      country: 'US',
      state: 'California',
      city: 'L',
      postalCode: '90001',
    };

    const result = AddressSchema.safeParse(shortCity);
    expect(result.success).toBe(false);
  });

  it('should validate state minimum length', () => {
    const shortState = {
      nameAddress: 'Home',
      address: '123 Main St',
      country: 'US',
      state: 'C',
      city: 'Los Angeles',
      postalCode: '90001',
    };

    const result = AddressSchema.safeParse(shortState);
    expect(result.success).toBe(false);
  });

  it('should validate postalCode minimum length', () => {
    const shortPostalCode = {
      nameAddress: 'Home',
      address: '123 Main St',
      country: 'US',
      state: 'California',
      city: 'Los Angeles',
      postalCode: '9',
    };

    const result = AddressSchema.safeParse(shortPostalCode);
    expect(result.success).toBe(false);
  });
});
