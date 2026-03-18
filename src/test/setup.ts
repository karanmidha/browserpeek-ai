import '@testing-library/jest-dom';
import { vi, beforeEach } from 'vitest';

// Mock IntersectionObserver for LazyImage component
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }

  callback: IntersectionObserverCallback;

  observe(element: Element) {
    // Immediately trigger the callback as if the element is intersecting
    this.callback([{ isIntersecting: true, target: element } as IntersectionObserverEntry], this);
  }

  unobserve() {}
  disconnect() {}
};

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