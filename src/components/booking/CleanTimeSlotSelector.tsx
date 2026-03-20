import React, { useState, useEffect } from 'react';
import type { Database } from '../../types/database';

type TimeSlot = Database['public']['Tables']['time_slots']['Row'] & {
  practice_style?: Database['public']['Tables']['practice_styles']['Row'];
  booked_count: number;
  is_within_cutoff: boolean;
  is_full: boolean;
};

interface CleanTimeSlotSelectorProps {
  selectedDate: Date | null;
  selectedSlot: TimeSlot | null;
  onSlotSelect: (slot: TimeSlot | null) => void;
  disabled?: boolean;
}

interface TimeSlotGroup {
  title: string;
  icon: string;
  slots: TimeSlot[];
}

const CleanTimeSlotSelector: React.FC<CleanTimeSlotSelectorProps> = ({
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
      // Clean time slots matching the design requirements
      const mockSlots: TimeSlot[] = [
        // Morning Sessions: 07:00 AM, 09:30 AM
        {
          id: '1',
          instructor_id: 'instructor-1',
          date: selectedDate.toISOString().split('T')[0],
          start_time: '07:00',
          end_time: '08:30',
          is_available: true,
          max_students: 12,
          practice_style_id: 'session-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          practice_style: {
            id: 'session-1',
            name: 'Yoga Session', // Generic name since class types aren't shown
            description: 'Instructor decides what to teach each day',
            duration_minutes: 90,
            max_students: 12,
            price: 600,
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
          start_time: '09:30',
          end_time: '11:00',
          is_available: true,
          max_students: 10,
          practice_style_id: 'session-2',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          practice_style: {
            id: 'session-2',
            name: 'Yoga Session',
            description: 'Instructor decides what to teach each day',
            duration_minutes: 90,
            max_students: 10,
            price: 600,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          booked_count: 7,
          is_within_cutoff: false,
          is_full: false,
        },
        // Evening Sessions: 05:30 PM, 07:00 PM, 08:30 PM
        {
          id: '3',
          instructor_id: 'instructor-1',
          date: selectedDate.toISOString().split('T')[0],
          start_time: '17:30',
          end_time: '19:00',
          is_available: true,
          max_students: 15,
          practice_style_id: 'session-3',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          practice_style: {
            id: 'session-3',
            name: 'Yoga Session',
            description: 'Instructor decides what to teach each day',
            duration_minutes: 90,
            max_students: 15,
            price: 600,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          booked_count: 9,
          is_within_cutoff: false,
          is_full: false,
        },
        {
          id: '4',
          instructor_id: 'instructor-1',
          date: selectedDate.toISOString().split('T')[0],
          start_time: '19:00',
          end_time: '20:30',
          is_available: true,
          max_students: 12,
          practice_style_id: 'session-4',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          practice_style: {
            id: 'session-4',
            name: 'Yoga Session',
            description: 'Instructor decides what to teach each day',
            duration_minutes: 90,
            max_students: 12,
            price: 600,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          booked_count: 5,
          is_within_cutoff: false,
          is_full: false,
        },
        {
          id: '5',
          instructor_id: 'instructor-1',
          date: selectedDate.toISOString().split('T')[0],
          start_time: '20:30',
          end_time: '22:00',
          is_available: true,
          max_students: 8,
          practice_style_id: 'session-5',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          practice_style: {
            id: 'session-5',
            name: 'Yoga Session',
            description: 'Instructor decides what to teach each day',
            duration_minutes: 90,
            max_students: 8,
            price: 600,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          booked_count: 2,
          is_within_cutoff: checkWithinCutoff(selectedDate, '20:30'),
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

  const groupTimeSlots = (slots: TimeSlot[]): TimeSlotGroup[] => {
    const groups: TimeSlotGroup[] = [
      { title: 'MORNING SESSIONS', icon: '🌅', slots: [] },
      { title: 'EVENING SESSIONS', icon: '🌆', slots: [] }
    ];

    slots.forEach(slot => {
      const [hours] = slot.start_time.split(':').map(Number);

      if (hours < 12) {
        groups[0].slots.push(slot);
      } else {
        groups[1].slots.push(slot);
      }
    });

    // Filter out empty groups and sort slots by time
    return groups.filter(group => group.slots.length > 0).map(group => ({
      ...group,
      slots: group.slots.sort((a, b) => a.start_time.localeCompare(b.start_time))
    }));
  };

  if (!selectedDate) {
    return (
      <div className="text-center py-12">
        <div className="text-secondary-500 mb-2">🧘‍♀️</div>
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

  const groupedSlots = groupTimeSlots(timeSlots);

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

      {groupedSlots.map((group, groupIndex) => (
        <div key={group.title} className={groupIndex > 0 ? 'mt-8' : ''}>
          {/* Group Header */}
          <div className="flex items-center mb-4">
            <h4 className="text-sm font-bold text-secondary-800 tracking-wide">{group.title}</h4>
            <div className="flex-1 ml-3 h-px bg-secondary-200"></div>
          </div>

          {/* Group Slots - Clean Time Display */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {group.slots.map((slot) => {
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
                    p-3 rounded-lg border-2 text-center transition-all duration-200
                    ${isSelected
                      ? 'border-secondary-600 bg-secondary-50 shadow-md'
                      : isBookable
                        ? 'border-secondary-200 bg-white hover:border-secondary-300 hover:shadow-sm'
                        : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-75'
                    }
                    ${isBookable && !disabled ? 'hover:scale-[1.02]' : ''}
                  `}
                >
                  {/* Clean Time Display - Only Time, No Labels */}
                  <div className="text-lg font-semibold text-secondary-900 mb-2">
                    {formatTime(slot.start_time)}
                  </div>

                  {/* Status Indicator */}
                  <div className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${status.color === 'green' ? 'bg-green-100 text-green-700' :
                      status.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                      status.color === 'orange' ? 'bg-orange-100 text-orange-700' :
                      status.color === 'red' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'}
                  `}>
                    {status.label}
                  </div>

                  {/* Available Spots */}
                  {isBookable && (
                    <div className="text-xs text-secondary-600 mt-2">
                      {availableSpots} spots left
                    </div>
                  )}

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="mt-2">
                      <div className="w-4 h-4 bg-secondary-600 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {selectedSlot && (
        <div className="mt-6 p-4 bg-primary-100 rounded-lg">
          <h4 className="font-semibold text-secondary-900 mb-2">Selected Session</h4>
          <div className="text-sm text-secondary-700">
            <p><strong>Time:</strong> {formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)}</p>
            <p><strong>Duration:</strong> {selectedSlot.practice_style?.duration_minutes} minutes</p>
            <p><strong>Price:</strong> ₹{selectedSlot.practice_style?.price || 600}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CleanTimeSlotSelector;