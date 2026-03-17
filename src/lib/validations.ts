import { z } from 'zod';

// Custom validators - DOMPurify will be used in browser environment
const sanitizedString = (schema: z.ZodString) =>
  schema.transform((val) => {
    const trimmed = val.trim();
    // In test/Node environment, just remove basic HTML tags
    if (typeof window === 'undefined') {
      return trimmed.replace(/<[^>]*>/g, '');
    }
    // In browser, dynamically import DOMPurify
    try {
      // Use dynamic import for DOMPurify to avoid Node.js issues
      if (typeof window !== 'undefined' && (window as any).DOMPurify) {
        return (window as any).DOMPurify.sanitize(trimmed);
      }
      // Fallback to basic sanitization
      return trimmed.replace(/<[^>]*>/g, '');
    } catch {
      return trimmed.replace(/<[^>]*>/g, '');
    }
  });

const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// User authentication schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain uppercase, lowercase, number and special character'),
  firstName: sanitizedString(z.string().min(1, 'First name is required').max(50, 'First name too long')),
  lastName: sanitizedString(z.string().min(1, 'Last name is required').max(50, 'Last name too long')),
  phone: z.string().regex(phoneRegex, 'Invalid phone number').optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});

// Profile schemas
export const profileUpdateSchema = z.object({
  firstName: sanitizedString(z.string().min(1, 'First name is required').max(50, 'First name too long')),
  lastName: sanitizedString(z.string().min(1, 'Last name is required').max(50, 'Last name too long')),
  phone: z.string().regex(phoneRegex, 'Invalid phone number').optional(),
});

// Booking schemas
export const bookingSchema = z.object({
  timeSlotId: z.string().uuid('Invalid time slot ID'),
  specialRequests: sanitizedString(z.string().max(500, 'Special requests too long')).optional(),
});

// Contact form schema
export const contactSchema = z.object({
  name: sanitizedString(z.string().min(1, 'Name is required').max(100, 'Name too long')),
  email: z.string().regex(emailRegex, 'Invalid email address'),
  phone: z.string().regex(phoneRegex, 'Invalid phone number').optional(),
  subject: sanitizedString(z.string().min(1, 'Subject is required').max(200, 'Subject too long')),
  message: sanitizedString(z.string().min(1, 'Message is required').max(2000, 'Message too long')),
});

// Testimonial schema
export const testimonialSchema = z.object({
  name: sanitizedString(z.string().min(1, 'Name is required').max(100, 'Name too long')),
  email: z.string().regex(emailRegex, 'Invalid email address').optional(),
  content: sanitizedString(z.string().min(10, 'Testimonial must be at least 10 characters').max(1000, 'Testimonial too long')),
  rating: z.number().int().min(1, 'Rating must be 1-5').max(5, 'Rating must be 1-5'),
});

// Admin schemas
export const practiceStyleSchema = z.object({
  name: sanitizedString(z.string().min(1, 'Name is required').max(100, 'Name too long')),
  description: sanitizedString(z.string().min(1, 'Description is required').max(500, 'Description too long')),
  durationMinutes: z.number().int().min(15, 'Duration must be at least 15 minutes').max(180, 'Duration cannot exceed 3 hours'),
  maxStudents: z.number().int().min(1, 'Must allow at least 1 student').max(50, 'Cannot exceed 50 students'),
  price: z.number().min(0, 'Price cannot be negative').max(10000, 'Price too high'),
  isActive: z.boolean(),
});

export const timeSlotSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  maxStudents: z.number().int().min(1, 'Must allow at least 1 student').max(50, 'Cannot exceed 50 students'),
  practiceStyleId: z.string().uuid('Invalid practice style ID'),
}).refine((data) => {
  const start = new Date(`2000-01-01T${data.startTime}`);
  const end = new Date(`2000-01-01T${data.endTime}`);
  return start < end;
}, {
  message: 'End time must be after start time',
  path: ['endTime'],
});

// Payment validation
export const paymentSchema = z.object({
  razorpayPaymentId: z.string().min(1, 'Payment ID is required'),
  razorpayOrderId: z.string().min(1, 'Order ID is required'),
  razorpaySignature: z.string().min(1, 'Payment signature is required'),
  bookingId: z.string().uuid('Invalid booking ID'),
});

// Search and filter schemas
export const timeSlotFilterSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
  practiceStyleId: z.string().uuid('Invalid practice style ID').optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

// Type exports for TypeScript
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type TestimonialInput = z.infer<typeof testimonialSchema>;
export type PracticeStyleInput = z.infer<typeof practiceStyleSchema>;
export type TimeSlotInput = z.infer<typeof timeSlotSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type TimeSlotFilterInput = z.infer<typeof timeSlotFilterSchema>;

// Validation helpers
export const validateInput = <T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.issues?.map((err: any) => `${err.path.join('.')}: ${err.message}`) || ['Validation error'],
      };
    }
    return {
      success: false,
      errors: ['Invalid input data'],
    };
  }
};

// Environment variable validation
export const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  VITE_RAZORPAY_KEY_ID: z.string().min(1, 'RazorPay key ID is required'),
});

// Validate environment variables at startup
export const validateEnv = () => {
  const env = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    VITE_RAZORPAY_KEY_ID: import.meta.env.VITE_RAZORPAY_KEY_ID,
  };

  const result = envSchema.safeParse(env);
  if (!result.success) {
    throw new Error(`Invalid environment variables: ${result.error.issues.map((err: any) => err.message).join(', ')}`);
  }
  return result.data;
};