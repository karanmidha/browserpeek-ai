// User and Authentication Types
export interface User {
  id: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  profile: UserProfile | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

// Booking and Time Slot Types
export interface TimeSlot {
  id: string;
  instructor_id: string;
  date: string; // YYYY-MM-DD format
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  is_available: boolean;
  max_students: number;
  practice_style?: string;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  time_slot_id: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_id?: string; // RazorPay payment ID
  amount: number;
  currency: string;
  special_requests?: string;
  created_at: string;
  updated_at: string;

  // Relations
  user?: User;
  time_slot?: TimeSlot;
}

// Testimonial Types
export interface Testimonial {
  id: string;
  name: string;
  email?: string;
  content: string;
  rating: number; // 1-5
  status: 'pending' | 'approved' | 'rejected';
  is_featured: boolean;
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string; // admin user ID
}

// Contact and Inquiry Types
export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  assigned_to?: string; // admin user ID
  submitted_at: string;
  resolved_at?: string;
}

// Practice Style Types
export interface PracticeStyle {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  max_students: number;
  price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Payment Types
export interface Payment {
  id: string;
  booking_id: string;
  razorpay_payment_id: string;
  razorpay_order_id: string;
  amount: number;
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';
  payment_method?: string;
  created_at: string;
  updated_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Form Types
export interface BookingFormData {
  date: string;
  time_slot_id: string;
  special_requests?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface TestimonialFormData {
  name: string;
  email?: string;
  content: string;
  rating: number;
}

// UI Types
export interface CalendarDate {
  date: Date;
  isCurrentMonth: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  hasTimeSlots: boolean;
}

export interface NavigationItem {
  label: string;
  href: string;
  icon?: string;
}