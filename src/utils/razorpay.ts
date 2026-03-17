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
  slotId: string;
  practiceStyleId: string;
  amount: number; // Amount in INR (will be converted to paise)
  currency?: string;
  userEmail: string;
  userName: string;
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
 * Create RazorPay order via secure backend API
 */
export const createRazorPayOrder = async (payload: CreateOrderPayload): Promise<OrderResponse & { razorPayKeyId: string }> => {
  const response = await fetch('/api/razorpay/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create payment order');
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Order creation failed');
  }

  return {
    ...data.order,
    entity: 'order',
    amount_paid: 0,
    amount_due: data.order.amount,
    created_at: Math.floor(Date.now() / 1000),
    razorPayKeyId: data.razorPayKeyId,
  };
};

/**
 * Open RazorPay checkout
 */
export const openRazorPayCheckout = async (options: RazorPayOptions): Promise<void> => {
  const scriptLoaded = await loadRazorPayScript();

  if (!scriptLoaded) {
    throw new Error('Failed to load RazorPay script');
  }

  if (!options.key) {
    throw new Error('RazorPay Key ID not provided');
  }

  const razorPay = new window.Razorpay({
    ...options,
    theme: {
      color: '#3D5A40', // OmYogVidya brand color
      ...options.theme,
    },
  });

  razorPay.open();
};

/**
 * Verify payment signature via secure backend API
 */
export const verifyPaymentSignature = async (
  paymentId: string,
  orderId: string,
  signature: string,
  slotId: string,
  userEmail: string
): Promise<{ success: boolean; bookingId?: string; error?: string }> => {
  try {
    const response = await fetch('/api/razorpay/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        razorpay_payment_id: paymentId,
        razorpay_order_id: orderId,
        razorpay_signature: signature,
        slotId,
        userEmail,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Payment verification failed:', data);
      return {
        success: false,
        error: data.error || 'Payment verification failed',
      };
    }

    return {
      success: data.success,
      bookingId: data.bookingId,
    };
  } catch (error) {
    console.error('Payment verification error:', error);
    return {
      success: false,
      error: 'Network error during payment verification',
    };
  }
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