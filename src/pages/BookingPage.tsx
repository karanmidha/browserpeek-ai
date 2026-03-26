import React, { useState } from 'react';
import WeeklyDateSelector from '../components/booking/WeeklyDateSelector';
import CleanTimeSlotSelector from '../components/booking/CleanTimeSlotSelector';
import EnhancedBookingSummary from '../components/booking/EnhancedBookingSummary';
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

      // Step 2: Create RazorPay order with secure backend validation
      const orderResponse = await createRazorPayOrder({
        slotId: selectedSlot.id,
        practiceStyleId: selectedSlot.practice_style?.id || '',
        amount: selectedSlot.practice_style?.price || 0,
        userEmail: bookingData.email,
        userName: bookingData.name,
      });

      // Step 3: Open RazorPay checkout with secure key from backend
      await openRazorPayCheckout({
        key: orderResponse.razorPayKeyId,
        amount: orderResponse.amount,
        currency: orderResponse.currency,
        name: 'OmYogVidya',
        description: `${selectedSlot.practice_style?.name} - ${selectedDate.toDateString()}`,
        order_id: orderResponse.id,
        handler: async (response) => {
          try {
            // Step 4: Verify payment and confirm booking
            await handlePaymentSuccess(response, bookingId, bookingData);
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
    bookingId: string,
    bookingData: BookingData
  ) => {
    // Step 1: Verify payment signature using secure backend
    const verificationResult = await verifyPaymentSignature(
      response.razorpay_payment_id,
      response.razorpay_order_id,
      response.razorpay_signature,
      selectedSlot?.id || '',
      bookingData.email
    );

    if (!verificationResult.success) {
      throw new Error(verificationResult.error || 'Payment signature verification failed');
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
    <div className="min-h-screen bg-cream-50 text-stone-800">
      <main className="max-w-5xl mx-auto px-4 py-8 md:py-16">
        {/* Header Section */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-semibold mb-4 text-stone-900">Book Your Flow</h1>
          <p className="text-sage-600 max-w-md mx-auto italic font-serif text-lg">"Yoga is the journey of the self, through the self, to the self."</p>
        </header>

        {/* Error Alert */}
        {bookingError && (
          <div className="max-w-5xl mx-auto mb-6">
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

        {/* Booking Card */}
        <section className="bg-white rounded-2xl shadow-sm border border-sage-100 overflow-hidden">
          <div className="grid md:grid-cols-2">

            {/* Selection Area */}
            <div className="p-8 md:p-10 border-b md:border-b-0 md:border-r border-sage-100">
              <h2 className="text-xl font-medium mb-6 flex items-center gap-2 text-stone-900">
                <svg className="w-5 h-5 text-wood-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
                Select Date & Time
              </h2>

              {/* Advance Booking Notice */}
              <div className="bg-cream-100 border border-wood-500/20 rounded-lg p-5 mb-8 text-sm text-wood-700 flex items-start gap-4">
                <svg className="w-5 h-5 text-wood-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
                <div>
                  <p className="font-medium text-wood-800 mb-1">Advance booking required</p>
                  <p className="text-wood-600">Sessions must be booked at least 24 hours in advance to ensure availability and proper preparation.</p>
                </div>
              </div>

              {/* Date Selection */}
              <div className="mb-8">
                <WeeklyDateSelector
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                  disabled={isProcessing}
                />
              </div>

              {/* Time Slot Selection */}
              <div>
                <CleanTimeSlotSelector
                  selectedDate={selectedDate}
                  selectedSlot={selectedSlot}
                  onSlotSelect={handleSlotSelect}
                  disabled={isProcessing}
                />
              </div>
            </div>

            {/* Summary Area */}
            <div className="p-8 md:p-10">
              <div className="sticky top-4">
                <EnhancedBookingSummary
                  selectedDate={selectedDate}
                  selectedSlot={selectedSlot}
                  onBookingSubmit={handleBookingSubmit}
                  loading={isProcessing}
                  disabled={isProcessing}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default BookingPage;