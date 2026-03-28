import React from 'react';
import type { Database } from '../../types/database';

type TimeSlot = Database['public']['Tables']['time_slots']['Row'] & {
  practice_style?: Database['public']['Tables']['practice_styles']['Row'];
  booked_count: number;
  is_within_cutoff: boolean;
  is_full: boolean;
  available_spots: number;
};

interface MobileBookingSummaryProps {
  selectedDate: Date | null;
  selectedSlot: TimeSlot | null;
}

const MobileBookingSummary: React.FC<MobileBookingSummaryProps> = ({
  selectedDate,
  selectedSlot
}) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime12Hour = (time24: string) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  };

  const getPrice = () => {
    return selectedSlot?.practice_style?.price || 0;
  };

  const getSessionName = () => {
    return selectedSlot?.practice_style?.name || 'Session';
  };

  return (
    <div>
      <h2 className="text-xl font-medium mb-4">Booking Summary</h2>

      <div className="space-y-3">
        {/* Session */}
        <div className="flex justify-between pb-2 border-b border-stone-200">
          <span className="text-stone-500 text-sm">Session</span>
          <span className="font-medium text-sm text-right">
            {selectedSlot ? getSessionName() : '—'}
          </span>
        </div>

        {/* Date */}
        <div className="flex justify-between pb-2 border-b border-stone-200">
          <span className="text-stone-500 text-sm">Date</span>
          <span className="font-medium text-sm">
            {selectedDate ? formatDate(selectedDate) : '—'}
          </span>
        </div>

        {/* Time */}
        <div className="flex justify-between pb-2 border-b border-stone-200">
          <span className="text-stone-500 text-sm">Time</span>
          <span className="font-medium text-sm">
            {selectedSlot ? formatTime12Hour(selectedSlot.start_time) : '—'}
          </span>
        </div>

        {/* Base Price */}
        <div className="flex justify-between pb-2 border-b border-stone-200">
          <span className="text-stone-500 text-sm">Base Price</span>
          <span className="font-medium text-sm">
            {selectedSlot ? `₹${getPrice()}` : '—'}
          </span>
        </div>

        {/* Total Amount */}
        <div className="flex justify-between pt-3">
          <span className="font-semibold text-lg">Total Amount</span>
          <span className="font-bold text-xl text-primary">
            {selectedSlot ? `₹${getPrice()}` : '₹0'}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-stone-200 text-center">
        <p className="text-xs text-stone-500 mb-2">© 2023 OmYogVidya. All rights reserved.</p>
        <div className="flex justify-center space-x-4 text-xs">
          <a href="/cancellation" className="text-stone-400 hover:text-stone-600 underline">
            Cancellation Policy
          </a>
          <a href="/terms" className="text-stone-400 hover:text-stone-600 underline">
            Terms of Service
          </a>
        </div>
      </div>
    </div>
  );
};

export default MobileBookingSummary;