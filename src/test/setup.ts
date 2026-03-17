import '@testing-library/jest-dom';
import { vi, beforeEach } from 'vitest';

// Mock environment variables for tests
vi.mock('../lib/validations', async () => {
  const actual = await vi.importActual('../lib/validations');
  return {
    ...actual,
    validateEnv: vi.fn(() => ({
      VITE_SUPABASE_URL: 'https://test.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'test-key',
      VITE_RAZORPAY_KEY_ID: 'test-razorpay-key',
    })),
  };
});

// Global test setup
beforeEach(() => {
  // Clear all mocks between tests
  vi.clearAllMocks();
});