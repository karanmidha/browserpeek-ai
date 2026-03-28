import React, { useState, useEffect } from 'react';
import type { Database } from '../../types/database';

type TimeSlot = Database['public']['Tables']['time_slots']['Row'] & {
  practice_style?: Database['public']['Tables']['practice_styles']['Row'];
  booked_count: number;
  is_within_cutoff: boolean;
  is_full: boolean;
  available_spots: number;
};

interface MobilePillTimeSlotSelectorProps {
  selectedDate: Date | null;
  selectedSlot: TimeSlot | null;
  onSlotSelect: (slot: TimeSlot | null) => void;
  disabled?: boolean;
}

const MobilePillTimeSlotSelector: React.FC<MobilePillTimeSlotSelectorProps> = ({
  selectedDate,
  selectedSlot,
  onSlotSelect,
  disabled = false
}) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      loadTimeSlots(selectedDate);
    } else {
      setTimeSlots([]);
    }
  }, [selectedDate]);

  const loadTimeSlots = async (date: Date) => {
    setLoading(true);
    try {
      // Mock data for demonstration - in real implementation, this would fetch from Supabase
      const mockSlots: TimeSlot[] = [
        {
          id: '1',
          instructor_id: 'instructor1',
          date: date.toISOString().split('T')[0],
          start_time: '07:00:00',
          end_time: '08:00:00',
          is_available: true,
          max_students: 10,
          practice_style_id: '1',
          practice_style: {
            id: '1',
            name: 'Morning Vinyasa Flow',
            description: 'Energizing flow practice',
            duration_minutes: 60,
            max_students: 10,
            price: 500,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          booked_count: 8,
          is_within_cutoff: false,
          is_full: false,
          available_spots: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          instructor_id: 'instructor1',
          date: date.toISOString().split('T')[0],
          start_time: '09:30:00',
          end_time: '10:30:00',
          is_available: true,
          max_students: 10,
          practice_style_id: '2',
          practice_style: {
            id: '2',
            name: 'Gentle Hatha',
            description: 'Gentle practice for beginners',
            duration_minutes: 60,
            max_students: 10,
            price: 450,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          booked_count: 2,
          is_within_cutoff: false,
          is_full: false,
          available_spots: 8,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          instructor_id: 'instructor1',
          date: date.toISOString().split('T')[0],
          start_time: '17:30:00',
          end_time: '18:30:00',
          is_available: true,
          max_students: 8,
          practice_style_id: '3',
          practice_style: {
            id: '3',
            name: 'Evening Flow',
            description: 'Relaxing evening practice',
            duration_minutes: 60,
            max_students: 8,
            price: 500,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          booked_count: 3,
          is_within_cutoff: false,
          is_full: false,
          available_spots: 5,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '4',
          instructor_id: 'instructor1',
          date: date.toISOString().split('T')[0],
          start_time: '19:00:00',
          end_time: '20:00:00',
          is_available: true,
          max_students: 8,
          practice_style_id: '4',
          practice_style: {
            id: '4',
            name: 'Yin Yoga',
            description: 'Deep restorative practice',
            duration_minutes: 60,
            max_students: 8,
            price: 450,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          booked_count: 5,
          is_within_cutoff: false,
          is_full: false,
          available_spots: 3,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '5',
          instructor_id: 'instructor1',
          date: date.toISOString().split('T')[0],
          start_time: '20:30:00',
          end_time: '21:30:00',
          is_available: true,
          max_students: 6,
          practice_style_id: '5',
          practice_style: {
            id: '5',
            name: 'Restorative',
            description: 'Deep relaxation practice',
            duration_minutes: 60,
            max_students: 6,
            price: 400,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          booked_count: 0,
          is_within_cutoff: false,
          is_full: false,
          available_spots: 6,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setTimeSlots(mockSlots);
    } catch (error) {
      console.error('Failed to load time slots:', error);
      setTimeSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime12Hour = (time24: string) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  };

  const isMorningSlot = (time24: string) => {
    const hour = parseInt(time24.split(':')[0]);
    return hour < 12;
  };

  const morningSlots = timeSlots.filter(slot => isMorningSlot(slot.start_time));
  const eveningSlots = timeSlots.filter(slot => !isMorningSlot(slot.start_time));

  const handleSlotClick = (slot: TimeSlot) => {
    if (disabled || slot.is_full || slot.is_within_cutoff) return;

    if (selectedSlot?.id === slot.id) {
      onSlotSelect(null);
    } else {
      onSlotSelect(slot);
    }
  };

  if (!selectedDate) {
    return (
      <div className="text-center py-8 text-stone-500">
        <p>Please select a date to view available time slots</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        <p className="text-stone-500 mt-2 text-sm">Loading time slots...</p>
      </div>
    );
  }

  if (timeSlots.length === 0) {
    return (
      <div className="text-center py-8 text-stone-500">
        <p>No time slots available for this date</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Morning Sessions */}
      {morningSlots.length > 0 && (
        <div>
          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">
            Morning Sessions
          </label>
          <div className="grid grid-cols-2 gap-2">
            {morningSlots.map((slot) => {
              const isSelected = selectedSlot?.id === slot.id;
              const isSlotDisabled = slot.is_full || slot.is_within_cutoff;

              return (
                <div key={slot.id} className="relative">
                  <input
                    type="radio"
                    className="hidden slot-pill"
                    id={`slot-${slot.id}`}
                    name="session-slot"
                    checked={isSelected}
                    onChange={() => handleSlotClick(slot)}
                    disabled={disabled || isSlotDisabled}
                  />
                  <label
                    htmlFor={`slot-${slot.id}`}
                    className={`flex items-center justify-center px-4 py-3 border rounded-xl cursor-pointer transition-all text-sm font-medium min-h-[44px] ${
                      isSelected
                        ? 'bg-green-50 text-primary border-primary shadow-sm'
                        : isSlotDisabled
                        ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                        : 'border-stone-200 hover:border-primary text-stone-600 bg-white'
                    } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    <div className="flex flex-col items-center">
                      <span>{formatTime12Hour(slot.start_time)}</span>
                      <span className="text-[10px] font-bold text-amber-600 mt-0.5">
                        {isSlotDisabled ? 'FULL' : `${slot.available_spots} SLOTS LEFT`}
                      </span>
                    </div>
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Evening Sessions */}
      {eveningSlots.length > 0 && (
        <div>
          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">
            Evening Sessions
          </label>
          <div className="grid grid-cols-3 gap-2">
            {eveningSlots.map((slot) => {
              const isSelected = selectedSlot?.id === slot.id;
              const isSlotDisabled = slot.is_full || slot.is_within_cutoff;

              return (
                <div key={slot.id} className="relative">
                  <input
                    type="radio"
                    className="hidden slot-pill"
                    id={`slot-${slot.id}`}
                    name="session-slot"
                    checked={isSelected}
                    onChange={() => handleSlotClick(slot)}
                    disabled={disabled || isSlotDisabled}
                  />
                  <label
                    htmlFor={`slot-${slot.id}`}
                    className={`flex items-center justify-center px-2 py-3 border rounded-xl cursor-pointer transition-all text-xs font-medium min-h-[44px] ${
                      isSelected
                        ? 'bg-green-50 text-primary border-primary shadow-sm'
                        : isSlotDisabled
                        ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                        : 'border-stone-200 hover:border-primary text-stone-600 bg-white'
                    } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    <div className="flex flex-col items-center">
                      <span>{formatTime12Hour(slot.start_time)}</span>
                      <span className="text-[9px] font-bold text-amber-600 mt-0.5 uppercase">
                        {isSlotDisabled ? 'FULL' : `${slot.available_spots} SLOTS LEFT`}
                      </span>
                    </div>
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobilePillTimeSlotSelector;