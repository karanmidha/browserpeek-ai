import React, { useState, useEffect } from 'react';
import type { Database } from '../../types/database';

type TimeSlot = Database['public']['Tables']['time_slots']['Row'] & {
  practice_style?: Database['public']['Tables']['practice_styles']['Row'];
  booked_count: number;
  is_within_cutoff: boolean;
  is_full: boolean;
};

interface TimeSlotSelectorProps {
  selectedDate: Date | null;
  selectedSlot: TimeSlot | null;
  onSlotSelect: (slot: TimeSlot | null) => void;
  disabled?: boolean;
}

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  selectedDate,
  selectedSlot,
  onSlotSelect,
  disabled
}) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedDate) {
      loadTimeSlots();
    } else {
      setTimeSlots([]);
    }
  }, [selectedDate]);

  const loadTimeSlots = async () => {
    if (!selectedDate) return;

    setLoading(true);
    setError(null);

    try {
      // Mock data for development - replace with actual API call
      const mockSlots: TimeSlot[] = [
        {
          id: '1',
          instructor_id: 'instructor-1',
          date: selectedDate.toISOString().split('T')[0],
          start_time: '06:00',
          end_time: '07:30',
          is_available: true,
          max_students: 10,
          practice_style_id: 'hatha-yoga',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          practice_style: {
            id: 'hatha-yoga',
            name: 'Hatha Yoga',
            description: 'Gentle practice focusing on basic postures',
            duration_minutes: 90,
            max_students: 10,
            price: 500,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          booked_count: 3,
          is_within_cutoff: false,
          is_full: false,
        },
        {
          id: '2',
          instructor_id: 'instructor-1',
          date: selectedDate.toISOString().split('T')[0],
          start_time: '08:00',
          end_time: '09:30',
          is_available: true,
          max_students: 12,
          practice_style_id: 'vinyasa-flow',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          practice_style: {
            id: 'vinyasa-flow',
            name: 'Vinyasa Flow',
            description: 'Dynamic flow connecting breath and movement',
            duration_minutes: 90,
            max_students: 12,
            price: 600,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          booked_count: 8,
          is_within_cutoff: false,
          is_full: false,
        },
        {
          id: '3',
          instructor_id: 'instructor-1',
          date: selectedDate.toISOString().split('T')[0],
          start_time: '18:00',
          end_time: '19:30',
          is_available: true,
          max_students: 15,
          practice_style_id: 'yin-yoga',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          practice_style: {
            id: 'yin-yoga',
            name: 'Yin Yoga',
            description: 'Restorative practice with longer held poses',
            duration_minutes: 90,
            max_students: 15,
            price: 550,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          booked_count: 15,
          is_within_cutoff: false,
          is_full: true,
        },
        {
          id: '4',
          instructor_id: 'instructor-1',
          date: selectedDate.toISOString().split('T')[0],
          start_time: '20:00',
          end_time: '21:00',
          is_available: true,
          max_students: 8,
          practice_style_id: 'meditation',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          practice_style: {
            id: 'meditation',
            name: 'Meditation',
            description: 'Guided meditation and breathwork',
            duration_minutes: 60,
            max_students: 8,
            price: 400,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          booked_count: 2,
          is_within_cutoff: checkWithinCutoff(selectedDate, '20:00'),
          is_full: false,
        },
      ];

      setTimeSlots(mockSlots);
    } catch (err) {
      setError('Failed to load time slots. Please try again.');
      console.error('Error loading time slots:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkWithinCutoff = (date: Date, time: string): boolean => {
    const [hours, minutes] = time.split(':').map(Number);
    const slotDateTime = new Date(date);
    slotDateTime.setHours(hours, minutes, 0, 0);

    const now = new Date();
    const cutoffTime = new Date(slotDateTime.getTime() - 24 * 60 * 60 * 1000); // 24 hours before

    return now >= cutoffTime;
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

  const getSlotStatus = (slot: TimeSlot) => {
    if (!slot.is_available) return { label: 'Unavailable', color: 'gray' };
    if (slot.is_full) return { label: 'Full', color: 'red' };
    if (slot.is_within_cutoff) return { label: 'Too Late', color: 'orange' };

    const availableSpots = slot.max_students - slot.booked_count;
    if (availableSpots <= 2) return { label: 'Almost Full', color: 'yellow' };

    return { label: 'Available', color: 'green' };
  };

  const isSlotBookable = (slot: TimeSlot) => {
    return slot.is_available && !slot.is_full && !slot.is_within_cutoff;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (!selectedDate) {
    return (
      <div className="text-center py-12">
        <div className="text-secondary-500 mb-2">📅</div>
        <p className="text-secondary-600">Please select a date first</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary-600 mx-auto mb-4"></div>
        <p className="text-secondary-600">Loading time slots...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-2">⚠️</div>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadTimeSlots}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (timeSlots.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-secondary-500 mb-2">🧘‍♀️</div>
        <p className="text-secondary-600">No sessions available for this date</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-serif text-secondary-900 mb-4">
        Available Time Slots
        <span className="block text-sm font-normal text-secondary-600">
          {selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          })}
        </span>
      </h3>

      <div className="space-y-3">
        {timeSlots.map((slot) => {
          const status = getSlotStatus(slot);
          const isBookable = isSlotBookable(slot);
          const isSelected = selectedSlot?.id === slot.id;
          const availableSpots = slot.max_students - slot.booked_count;

          return (
            <button
              key={slot.id}
              onClick={() => isBookable ? onSlotSelect(slot) : null}
              disabled={disabled || !isBookable}
              className={`
                w-full p-4 rounded-lg border-2 text-left transition-all duration-200
                ${isSelected
                  ? 'border-secondary-600 bg-secondary-50 shadow-md'
                  : isBookable
                    ? 'border-secondary-200 bg-white hover:border-secondary-300 hover:shadow-sm'
                    : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-75'
                }
                ${isBookable && !disabled ? 'hover:scale-[1.01]' : ''}
              `}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-semibold text-secondary-900">
                      {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                    </span>
                    <span className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      ${status.color === 'green' ? 'bg-green-100 text-green-700' :
                        status.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                        status.color === 'orange' ? 'bg-orange-100 text-orange-700' :
                        status.color === 'red' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'}
                    `}>
                      {status.label}
                    </span>
                  </div>

                  <div className="mb-2">
                    <h4 className="font-semibold text-secondary-800">
                      {slot.practice_style?.name}
                    </h4>
                    <p className="text-sm text-secondary-600">
                      {slot.practice_style?.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-secondary-600">
                      {isBookable ? (
                        <>
                          {availableSpots} of {slot.max_students} spots available
                        </>
                      ) : slot.is_full ? (
                        `Fully booked (${slot.max_students} students)`
                      ) : slot.is_within_cutoff ? (
                        'Booking closed (24hr cutoff)'
                      ) : (
                        'Not available'
                      )}
                    </span>
                    <span className="font-semibold text-secondary-900">
                      {formatPrice(slot.practice_style?.price || 0)}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <div className="ml-3">
                    <div className="w-6 h-6 bg-secondary-600 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {selectedSlot && (
        <div className="mt-4 p-4 bg-primary-100 rounded-lg">
          <h4 className="font-semibold text-secondary-900 mb-2">Selected Session</h4>
          <div className="text-sm text-secondary-700">
            <p><strong>Time:</strong> {formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)}</p>
            <p><strong>Practice:</strong> {selectedSlot.practice_style?.name}</p>
            <p><strong>Duration:</strong> {selectedSlot.practice_style?.duration_minutes} minutes</p>
            <p><strong>Price:</strong> {formatPrice(selectedSlot.practice_style?.price || 0)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSlotSelector;