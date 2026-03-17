import React, { useState } from 'react';
import DateSelector from '../components/booking/DateSelector';
import TimeSlotSelector from '../components/booking/TimeSlotSelector';
import BookingSummary from '../components/booking/BookingSummary';
import type { Database } from '../types/database';
import { openRazorPayCheckout, createRazorPayOrder, verifyPaymentSignature } from '../utils/razorpay';

type TimeSlot = Database['public']['Tables']['time_slots']['Row'] & {
  practice_style?: Database['public']['Tables']['practice_styles']['Row'];
  booked_count: number;
  is_within_cutoff: boolean;
  is_full: boolean;
};

interface BookingData {
  name: string;
  email: string;
  phone: string;
  specialRequests: string;
}

const BookingPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null); // Reset slot selection when date changes
    setBookingError(null);
  };

  const handleSlotSelect = (slot: TimeSlot | null) => {
    setSelectedSlot(slot);
    setBookingError(null);
  };

  const handleBookingSubmit = async (bookingData: BookingData) => {
    if (!selectedDate || !selectedSlot) {
      setBookingError('Please select a date and time slot');
      return;
    }

    setIsProcessing(true);
    setBookingError(null);

    try {
      // Step 1: Create booking record with "pending" status
      const bookingId = await createPendingBooking(bookingData);

      // Step 2: Create RazorPay order
      const orderResponse = await createRazorPayOrder({
        amount: selectedSlot.practice_style?.price || 0,
        receipt: `booking_${bookingId}`,
        notes: {
          bookingId,
          timeSlotId: selectedSlot.id,
          practiceStyle: selectedSlot.practice_style?.name || '',
        },
      });

      // Step 3: Open RazorPay checkout
      await openRazorPayCheckout({
        amount: orderResponse.amount,
        currency: orderResponse.currency,
        name: 'OmYogVidya',
        description: `${selectedSlot.practice_style?.name} - ${selectedDate.toDateString()}`,
        order_id: orderResponse.id,
        handler: async (response) => {
          try {
            // Step 4: Verify payment and confirm booking
            await handlePaymentSuccess(response, bookingId);
            setBookingSuccess(true);
          } catch (error) {
            console.error('Payment verification failed:', error);
            setBookingError('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: bookingData.name,
          email: bookingData.email,
          contact: bookingData.phone,
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            setBookingError('Payment was cancelled. Your booking has not been confirmed.');
          },
        },
      });
    } catch (error) {
      console.error('Booking error:', error);
      setBookingError(
        error instanceof Error
          ? error.message
          : 'Failed to process booking. Please try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const createPendingBooking = async (bookingData: BookingData): Promise<string> => {
    // Mock implementation - replace with actual Supabase call
    const mockBookingId = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // In real implementation, this would:
    // 1. Validate availability again (race condition check)
    // 2. Create booking record with "pending" status
    // 3. Reserve the slot temporarily (with timeout)
    // 4. Return booking ID

    console.log('Creating pending booking:', {
      id: mockBookingId,
      userId: 'current-user-id', // Would come from auth
      timeSlotId: selectedSlot?.id,
      name: bookingData.name,
      email: bookingData.email,
      phone: bookingData.phone,
      specialRequests: bookingData.specialRequests,
      amount: selectedSlot?.practice_style?.price,
      status: 'pending',
    });

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return mockBookingId;
  };

  const handlePaymentSuccess = async (
    response: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    },
    bookingId: string
  ) => {
    // Step 1: Verify payment signature
    const isVerified = await verifyPaymentSignature(
      response.razorpay_payment_id,
      response.razorpay_order_id,
      response.razorpay_signature
    );

    if (!isVerified) {
      throw new Error('Payment signature verification failed');
    }

    // Step 2: Update booking status to "confirmed"
    // In real implementation, this would:
    // 1. Verify signature on backend
    // 2. Update booking record with payment details
    // 3. Update slot availability
    // 4. Send confirmation email

    console.log('Payment verified and booking confirmed:', {
      bookingId,
      paymentId: response.razorpay_payment_id,
      orderId: response.razorpay_order_id,
    });
  };

  const resetBooking = () => {
    setSelectedDate(null);
    setSelectedSlot(null);
    setBookingSuccess(false);
    setBookingError(null);
    setIsProcessing(false);
  };

  if (bookingSuccess) {
    return (
      <div className="min-h-screen py-12 bg-primary-100">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-3xl font-serif text-secondary-900 mb-4">
                Booking Confirmed! 🧘‍♀️
              </h1>
              <p className="text-secondary-700 mb-6">
                Your yoga session has been successfully booked and payment processed.
                You'll receive a confirmation email shortly with all the details.
              </p>
            </div>

            {selectedDate && selectedSlot && (
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-secondary-900 mb-3">Session Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Date:</span>
                    <span className="font-medium text-secondary-900">
                      {selectedDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Time:</span>
                    <span className="font-medium text-secondary-900">
                      {new Date(`1970-01-01T${selectedSlot.start_time}`).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })} - {new Date(`1970-01-01T${selectedSlot.end_time}`).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Practice:</span>
                    <span className="font-medium text-secondary-900">
                      {selectedSlot.practice_style?.name}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={resetBooking}
                className="btn-primary w-full"
              >
                Book Another Session
              </button>

              <div className="flex gap-4">
                <button
                  onClick={() => window.location.href = '/'}
                  className="btn-secondary flex-1"
                >
                  Back to Home
                </button>
                <button
                  onClick={() => window.location.href = '/contact'}
                  className="btn-secondary flex-1"
                >
                  Contact Us
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-primary-100">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-serif text-secondary-900 text-center mb-12">
          Book Your Session
        </h1>

        {/* Error Alert */}
        {bookingError && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-red-800">Booking Error</h3>
                  <p className="text-sm text-red-700 mt-1">{bookingError}</p>
                </div>
                <button
                  onClick={() => setBookingError(null)}
                  className="ml-auto pl-3"
                >
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto">
          {/* Responsive Layout: Stacked on mobile, side-by-side on desktop */}
          <div className="grid lg:grid-cols-3 gap-8">

            {/* Date Selection */}
            <div className="lg:col-span-1">
              <div className="card h-fit">
                <DateSelector
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                  disabled={isProcessing}
                />
              </div>
            </div>

            {/* Time Slot Selection */}
            <div className="lg:col-span-1">
              <div className="card h-fit">
                <TimeSlotSelector
                  selectedDate={selectedDate}
                  selectedSlot={selectedSlot}
                  onSlotSelect={handleSlotSelect}
                  disabled={isProcessing}
                />
              </div>
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <div className="card h-fit sticky top-6">
                <BookingSummary
                  selectedDate={selectedDate}
                  selectedSlot={selectedSlot}
                  onBookingSubmit={handleBookingSubmit}
                  loading={isProcessing}
                  disabled={isProcessing}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="max-w-4xl mx-auto mt-12">
          <div className="bg-white border border-primary-200 rounded-lg p-6">
            <h3 className="font-serif text-xl text-secondary-900 mb-4">Need Help?</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-secondary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-secondary-900 mb-2">Call Us</h4>
                <p className="text-sm text-secondary-600">+91 98765 43210</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-secondary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-secondary-900 mb-2">Email Us</h4>
                <p className="text-sm text-secondary-600">hello@omyogvidya.com</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-secondary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="font-semibold text-secondary-900 mb-2">FAQs</h4>
                <p className="text-sm text-secondary-600">
                  <a href="/contact" className="text-secondary-600 hover:text-secondary-800">
                    View common questions
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;