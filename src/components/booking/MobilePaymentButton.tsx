import React, { useState } from 'react';
import type { Database } from '../../types/database';

type TimeSlot = Database['public']['Tables']['time_slots']['Row'] & {
  practice_style?: Database['public']['Tables']['practice_styles']['Row'];
  booked_count: number;
  is_within_cutoff: boolean;
  is_full: boolean;
  available_spots: number;
};

interface BookingData {
  name: string;
  email: string;
  phone: string;
  specialRequests: string;
}

interface MobilePaymentButtonProps {
  selectedDate: Date | null;
  selectedSlot: TimeSlot | null;
  onPaymentClick: (bookingData: BookingData) => void;
  loading?: boolean;
  disabled?: boolean;
}

const MobilePaymentButton: React.FC<MobilePaymentButtonProps> = ({
  selectedDate,
  selectedSlot,
  onPaymentClick,
  loading = false,
  disabled = false
}) => {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData>({
    name: '',
    email: '',
    phone: '',
    specialRequests: ''
  });

  const getPrice = () => {
    return selectedSlot?.practice_style?.price || 0;
  };

  const handlePaymentClick = () => {
    if (!selectedDate || !selectedSlot) return;

    // Show booking form first
    setShowBookingForm(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!bookingData.name.trim() || !bookingData.email.trim() || !bookingData.phone.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    onPaymentClick(bookingData);
    setShowBookingForm(false);
  };

  const updateBookingData = (field: keyof BookingData, value: string) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <>
      {/* Main Payment Button */}
      <button
        onClick={handlePaymentClick}
        disabled={disabled || loading}
        className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-300 min-h-[56px] ${
          disabled || loading
            ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
            : 'bg-primary text-white hover:bg-primary/90 active:bg-primary/80 shadow-lg hover:shadow-xl'
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            <span>Processing...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-3">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2 12C2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10S2 17.52 2 12zm4.64-1.96l3.54 3.54 7.07-7.07 1.41 1.41-8.48 8.48-4.95-4.95 1.41-1.41z"/>
            </svg>
            <span>Pay with RazorPay</span>
          </div>
        )}
      </button>

      {/* Security Notice */}
      <p className="text-center text-xs text-stone-500 mt-2">
        SECURED BY RAZORPAY 256-BIT ENCRYPTION
      </p>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Complete Your Booking</h3>
                <button
                  onClick={() => setShowBookingForm(false)}
                  className="p-2 hover:bg-stone-100 rounded-full"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={bookingData.name}
                    onChange={(e) => updateBookingData('name', e.target.value)}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={bookingData.email}
                    onChange={(e) => updateBookingData('email', e.target.value)}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Enter your email"
                  />
                </div>

                {/* Phone Field */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={bookingData.phone}
                    onChange={(e) => updateBookingData('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Enter your phone number"
                  />
                </div>

                {/* Special Requests Field */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    value={bookingData.specialRequests}
                    onChange={(e) => updateBookingData('specialRequests', e.target.value)}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Any special requests or notes"
                    rows={3}
                  />
                </div>

                {/* Booking Summary */}
                <div className="bg-stone-50 rounded-lg p-4 mt-6">
                  <h4 className="font-semibold mb-2">Booking Summary</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Session:</span>
                      <span>{selectedSlot?.practice_style?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span>{selectedDate?.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-primary">
                      <span>Total:</span>
                      <span>₹{getPrice()}</span>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors mt-6"
                >
                  Proceed to Payment
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobilePaymentButton;