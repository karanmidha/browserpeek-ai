// Supabase Database Types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: 'student' | 'instructor' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: 'student' | 'instructor' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'student' | 'instructor' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          first_name: string
          last_name: string
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name: string
          last_name: string
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string
          last_name?: string
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      practice_styles: {
        Row: {
          id: string
          name: string
          description: string
          duration_minutes: number
          max_students: number
          price: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          duration_minutes: number
          max_students: number
          price: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          duration_minutes?: number
          max_students?: number
          price?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      time_slots: {
        Row: {
          id: string
          instructor_id: string
          date: string
          start_time: string
          end_time: string
          is_available: boolean
          max_students: number
          practice_style_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          instructor_id: string
          date: string
          start_time: string
          end_time: string
          is_available?: boolean
          max_students: number
          practice_style_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          instructor_id?: string
          date?: string
          start_time?: string
          end_time?: string
          is_available?: boolean
          max_students?: number
          practice_style_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          user_id: string
          time_slot_id: string
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_id: string | null
          amount: number
          currency: string
          special_requests: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          time_slot_id: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_id?: string | null
          amount: number
          currency?: string
          special_requests?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          time_slot_id?: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_id?: string | null
          amount?: number
          currency?: string
          special_requests?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      testimonials: {
        Row: {
          id: string
          name: string
          email: string | null
          content: string
          rating: number
          status: 'pending' | 'approved' | 'rejected'
          is_featured: boolean
          submitted_at: string
          reviewed_at: string | null
          reviewed_by: string | null
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          content: string
          rating: number
          status?: 'pending' | 'approved' | 'rejected'
          is_featured?: boolean
          submitted_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          content?: string
          rating?: number
          status?: 'pending' | 'approved' | 'rejected'
          is_featured?: boolean
          submitted_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
      }
      contact_inquiries: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          subject: string
          message: string
          status: 'new' | 'in_progress' | 'resolved'
          priority: 'low' | 'medium' | 'high'
          assigned_to: string | null
          submitted_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          subject: string
          message: string
          status?: 'new' | 'in_progress' | 'resolved'
          priority?: 'low' | 'medium' | 'high'
          assigned_to?: string | null
          submitted_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          subject?: string
          message?: string
          status?: 'new' | 'in_progress' | 'resolved'
          priority?: 'low' | 'medium' | 'high'
          assigned_to?: string | null
          submitted_at?: string
          resolved_at?: string | null
        }
      }
      payments: {
        Row: {
          id: string
          booking_id: string
          razorpay_payment_id: string
          razorpay_order_id: string
          amount: number
          currency: string
          status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed'
          payment_method: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          razorpay_payment_id: string
          razorpay_order_id: string
          amount: number
          currency?: string
          status?: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed'
          payment_method?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          razorpay_payment_id?: string
          razorpay_order_id?: string
          amount?: number
          currency?: string
          status?: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed'
          payment_method?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          admin_id: string
          action: string
          target_id: string | null
          target_type: string | null
          old_value: Json | null
          new_value: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_id: string
          action: string
          target_id?: string | null
          target_type?: string | null
          old_value?: Json | null
          new_value?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          admin_id?: string
          action?: string
          target_id?: string | null
          target_type?: string | null
          old_value?: Json | null
          new_value?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'student' | 'instructor' | 'admin'
      booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
      payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
      testimonial_status: 'pending' | 'approved' | 'rejected'
      inquiry_status: 'new' | 'in_progress' | 'resolved'
      inquiry_priority: 'low' | 'medium' | 'high'
      payment_transaction_status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}