// RazorPay Integration Utilities

interface RazorPayCheckout {
  open(): void;
  on(event: string, callback: (response: unknown) => void): void;
}

interface RazorPayClass {
  new (options: RazorPayOptions): RazorPayCheckout;
}

declare global {
  interface Window {
    Razorpay: RazorPayClass;
  }
}

export interface RazorPayOptions {
  key: string;
  amount: number; // Amount in paise (smallest currency unit)
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorPayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact?: string;
  };
  notes?: {
    [key: string]: string;
  };
  theme?: {
    color: string;
  };
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    backdropclose?: boolean;
  };
}

export interface RazorPayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface CreateOrderPayload {
  amount: number; // Amount in INR (will be converted to paise)
  currency?: string;
  receipt?: string;
  notes?: {
    [key: string]: string;
  };
}

export interface OrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
}

// RazorPay configuration
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || '';

if (!RAZORPAY_KEY_ID) {
  console.warn('RazorPay Key ID not found in environment variables');
}

/**
 * Load RazorPay script dynamically
 */
export const loadRazorPayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check if script is already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Create RazorPay order (to be called from backend)
 */
export const createRazorPayOrder = async (payload: CreateOrderPayload): Promise<OrderResponse> => {
  // This would typically be a call to your backend API
  // For now, we'll return a mock response
  const mockOrder: OrderResponse = {
    id: `order_${Date.now()}`,
    entity: 'order',
    amount: payload.amount * 100, // Convert to paise
    amount_paid: 0,
    amount_due: payload.amount * 100,
    currency: payload.currency || 'INR',
    receipt: payload.receipt || `receipt_${Date.now()}`,
    status: 'created',
    created_at: Math.floor(Date.now() / 1000),
  };

  return mockOrder;
};

/**
 * Open RazorPay checkout
 */
export const openRazorPayCheckout = async (options: Omit<RazorPayOptions, 'key'>): Promise<void> => {
  const scriptLoaded = await loadRazorPayScript();

  if (!scriptLoaded) {
    throw new Error('Failed to load RazorPay script');
  }

  if (!RAZORPAY_KEY_ID) {
    throw new Error('RazorPay Key ID not configured');
  }

  const razorPay = new window.Razorpay({
    key: RAZORPAY_KEY_ID,
    ...options,
    theme: {
      color: '#3D5A40', // OmYogVidya brand color
      ...options.theme,
    },
  });

  razorPay.open();
};

/**
 * Verify payment signature (to be done on backend)
 */
export const verifyPaymentSignature = async (
  paymentId: string,
  orderId: string,
  signature: string
): Promise<boolean> => {
  // This should be implemented on your backend for security
  // For now, we'll return true (NEVER do this in production)
  console.log('Verifying payment signature:', { paymentId, orderId, signature });

  // In a real implementation, you would:
  // 1. Send these details to your backend
  // 2. Backend would verify using RazorPay webhook secret
  // 3. Return verification result

  return true;
};

/**
 * Format amount for display
 */
export const formatAmount = (amount: number, currency = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Convert rupees to paise
 */
export const rupeesToPaise = (rupees: number): number => {
  return Math.round(rupees * 100);
};

/**
 * Convert paise to rupees
 */
export const paiseToRupees = (paise: number): number => {
  return paise / 100;
};

// Payment constants
export const PAYMENT_CONFIG = {
  CURRENCY: 'INR',
  COMPANY_NAME: 'OmYogVidya',
  PAYMENT_DESCRIPTION: 'Yoga Session Booking',
  THEME_COLOR: '#3D5A40',
  RETRY_ATTEMPTS: 3,
  TIMEOUT_MS: 300000, // 5 minutes
};