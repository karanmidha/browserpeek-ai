import React, { useState } from 'react';
import type { Database } from '../../types/database';
import { bookingSchema } from '../../lib/validations';

type TimeSlot = Database['public']['Tables']['time_slots']['Row'] & {
  practice_style?: Database['public']['Tables']['practice_styles']['Row'];
};

interface BookingData {
  name: string;
  email: string;
  phone: string;
  specialRequests: string;
}

interface BookingSummaryProps {
  selectedDate: Date | null;
  selectedSlot: TimeSlot | null;
  onBookingSubmit: (bookingData: BookingData) => void;
  loading?: boolean;
  disabled?: boolean;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({
  selectedDate,
  selectedSlot,
  onBookingSubmit,
  loading = false,
  disabled = false
}) => {
  const [formData, setFormData] = useState<BookingData>({
    name: '',
    email: '',
    phone: '',
    specialRequests: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isFormValid, setIsFormValid] = useState(false);

  const validateForm = () => {
    if (!selectedDate || !selectedSlot) {
      return false;
    }

    try {
      // Create validation object that matches the booking schema
      const validationData = {
        date: selectedDate.toISOString(),
        timeSlotId: selectedSlot.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        notes: formData.specialRequests || undefined
      };

      bookingSchema.parse(validationData);
      setErrors({});
      return true;
    } catch (error: any) {
      const newErrors: Record<string, string> = {};

      if (error.errors) {
        error.errors.forEach((err: any) => {
          newErrors[err.path[0]] = err.message;
        });
      }

      setErrors(newErrors);
      return false;
    }
  };

  const handleInputChange = (field: keyof BookingData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Validate form after state update
    setTimeout(() => {
      setIsFormValid(validateForm());
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm() && selectedDate && selectedSlot) {
      onBookingSubmit(formData);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Calculate total (for future use with additional fees)
  const basePrice = selectedSlot?.practice_style?.price || 0;
  const platformFee = 0; // Could add platform fee later
  const totalPrice = basePrice + platformFee;

  const canProceed = selectedDate && selectedSlot && isFormValid && !loading && !disabled;

  return (
    <div className="w-full">
      <h3 className="text-lg font-serif text-secondary-900 mb-6">Booking Summary</h3>

      {/* Selection Summary */}
      {selectedDate && selectedSlot ? (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-secondary-900 mb-3">Selected Session</h4>
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
                {formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-600">Practice Style:</span>
              <span className="font-medium text-secondary-900">
                {selectedSlot.practice_style?.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-600">Duration:</span>
              <span className="font-medium text-secondary-900">
                {selectedSlot.practice_style?.duration_minutes} minutes
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6 text-center">
          <p className="text-secondary-600">Please select a date and time slot above</p>
        </div>
      )}

      {/* User Details Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-secondary-800 font-medium mb-2">
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`input ${errors.name ? 'border-red-500' : ''}`}
            placeholder="Enter your full name"
            disabled={disabled}
          />
          {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-secondary-800 font-medium mb-2">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`input ${errors.email ? 'border-red-500' : ''}`}
            placeholder="Enter your email address"
            disabled={disabled}
          />
          {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="block text-secondary-800 font-medium mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className={`input ${errors.phone ? 'border-red-500' : ''}`}
            placeholder="Enter your phone number"
            disabled={disabled}
          />
          {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
          <p className="text-xs text-secondary-500 mt-1">
            10-digit mobile number (e.g., 9876543210)
          </p>
        </div>

        <div>
          <label htmlFor="specialRequests" className="block text-secondary-800 font-medium mb-2">
            Special Requests or Notes (Optional)
          </label>
          <textarea
            id="specialRequests"
            value={formData.specialRequests}
            onChange={(e) => handleInputChange('specialRequests', e.target.value)}
            className={`input ${errors.notes ? 'border-red-500' : ''}`}
            rows={3}
            placeholder="Any injuries, experience level, or special requirements..."
            maxLength={500}
            disabled={disabled}
          />
          {errors.notes && <p className="text-red-600 text-sm mt-1">{errors.notes}</p>}
          <p className="text-xs text-secondary-500 mt-1">
            {formData.specialRequests.length}/500 characters
          </p>
        </div>

        {/* Price Breakdown */}
        {selectedSlot && (
          <div className="border-t pt-4 mt-6">
            <h4 className="font-semibold text-secondary-900 mb-3">Price Breakdown</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-secondary-600">Session Fee:</span>
                <span className="text-secondary-900">{formatPrice(basePrice)}</span>
              </div>
              {platformFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-secondary-600">Platform Fee:</span>
                  <span className="text-secondary-900">{formatPrice(platformFee)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span className="text-secondary-900">Total Amount:</span>
                <span className="text-secondary-900">{formatPrice(totalPrice)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={!canProceed}
            className={`
              w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200
              ${canProceed
                ? 'bg-secondary-600 hover:bg-secondary-700 text-white shadow-md hover:shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              `Pay ${formatPrice(totalPrice)} & Book Session`
            )}
          </button>
        </div>

        {!canProceed && (selectedDate && selectedSlot) && (
          <p className="text-sm text-red-600 text-center">
            Please fill in all required fields to proceed
          </p>
        )}
      </form>

      {/* Security Notice */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm text-blue-800 font-medium">Secure Payment</p>
            <p className="text-xs text-blue-700">
              Your payment is processed securely through RazorPay.
              We don't store your card details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSummary;