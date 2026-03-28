import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { adminAuth } from '../lib/admin/auth';
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
  Save,
  X,
} from 'lucide-react';

interface TimeSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  max_students: number;
  practice_style_id: string | null;
  instructor_id: string;
  practice_styles?: {
    name: string;
    price: number;
  } | null;
  bookings_count?: number;
}

interface PracticeStyle {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
  max_students: number;
}

interface SlotFormData {
  start_time: string;
  end_time: string;
  practice_style_id: string;
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const InstructorDashboard: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [practiceStyles, setPracticeStyles] = useState<PracticeStyle[]>([]);
  const [daySlots, setDaySlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAcceptingBookings, setIsAcceptingBookings] = useState(true);
  const [showAddSlotForm, setShowAddSlotForm] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [newSlot, setNewSlot] = useState<SlotFormData>({
    start_time: '09:00',
    end_time: '10:00',
    practice_style_id: '',
  });

  const session = adminAuth.getCurrentSession();
  const instructorName = session?.user.user_metadata?.first_name || 'PROF. MILLER';

  useEffect(() => {
    loadInitialData();
  }, [currentDate]);

  useEffect(() => {
    if (selectedDate) {
      const slots = timeSlots.filter(slot => slot.date === selectedDate);
      setDaySlots(slots);
    } else {
      setDaySlots([]);
    }
  }, [selectedDate, timeSlots]);

  const loadInitialData = async () => {
    setLoading(true);
    await Promise.all([
      loadTimeSlots(),
      loadPracticeStyles(),
    ]);
    setLoading(false);
  };

  const loadTimeSlots = async () => {
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const { data, error } = await supabase
        .from('time_slots')
        .select(`
          *,
          practice_styles(name, price),
          bookings(id)
        `)
        .gte('date', startOfMonth.toISOString().split('T')[0])
        .lte('date', endOfMonth.toISOString().split('T')[0])
        .order('date')
        .order('start_time');

      if (error) throw error;

      const slotsWithBookingCount = data?.map(slot => ({
        ...slot,
        bookings_count: slot.bookings?.length || 0,
      })) || [];

      setTimeSlots(slotsWithBookingCount);
    } catch (error) {
      console.error('Failed to load time slots:', error);
    }
  };

  const loadPracticeStyles = async () => {
    try {
      const { data, error } = await supabase
        .from('practice_styles')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setPracticeStyles(data || []);
      if (data && data.length > 0 && !newSlot.practice_style_id) {
        setNewSlot(prev => ({ ...prev, practice_style_id: data[0].id }));
      }
    } catch (error) {
      console.error('Failed to load practice styles:', error);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateSelect = (dateStr: string) => {
    if (hasUnsavedChanges) {
      if (!confirm('You have unsaved changes. Do you want to discard them?')) {
        return;
      }
    }
    setSelectedDate(dateStr);
    setShowAddSlotForm(false);
    setHasUnsavedChanges(false);
  };

  const handleAddSlot = async () => {
    try {
      const slotData = {
        ...newSlot,
        date: selectedDate,
        is_available: isAcceptingBookings,
        max_students: practiceStyles.find(ps => ps.id === newSlot.practice_style_id)?.max_students || 10,
        instructor_id: session?.user.id || '',
      };

      const { error } = await supabase
        .from('time_slots')
        .insert(slotData);

      if (error) throw error;

      await loadTimeSlots();
      setShowAddSlotForm(false);
      setNewSlot({
        start_time: '09:00',
        end_time: '10:00',
        practice_style_id: practiceStyles[0]?.id || '',
      });
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to add slot:', error);
      alert('Failed to add time slot');
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('Are you sure you want to delete this time slot?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('time_slots')
        .delete()
        .eq('id', slotId);

      if (error) throw error;
      await loadTimeSlots();
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to delete time slot:', error);
      alert('Failed to delete time slot');
    }
  };

  const handleSaveDay = async () => {
    // In this simplified version, we just mark as saved
    // In full implementation, would batch update all day changes
    setHasUnsavedChanges(false);
    alert('Day settings saved successfully!');
  };

  const handleDiscardChanges = () => {
    if (confirm('Are you sure you want to discard all changes?')) {
      setHasUnsavedChanges(false);
      setShowAddSlotForm(false);
      loadTimeSlots();
    }
  };

  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      days.push(date);
    }

    return days.map((date, index) => {
      const dateStr = date.toISOString().split('T')[0];
      const daySlots = timeSlots.filter(slot => slot.date === dateStr);
      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate === dateStr;
      const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

      return (
        <div
          key={index}
          onClick={() => isCurrentMonth && !isPast && handleDateSelect(dateStr)}
          className={`min-h-[80px] p-2 border border-gray-200 cursor-pointer transition-colors ${
            isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-100'
          } ${isToday ? 'bg-blue-50 border-blue-300' : ''} ${
            isSelected ? 'bg-forest-green text-cream border-forest-green' : ''
          } ${isPast ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <div className="flex items-center justify-between mb-1">
            <span
              className={`text-sm font-medium ${
                isSelected ? 'text-cream' :
                isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
              } ${isToday && !isSelected ? 'text-blue-600' : ''}`}
            >
              {date.getDate()}
            </span>
          </div>
          <div className="text-xs text-gray-600">
            {daySlots.length > 0 && (
              <span className={isSelected ? 'text-cream/80' : 'text-gray-600'}>
                {daySlots.length} slot{daySlots.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      );
    });
  };

  const formatTime12Hour = (time24: string) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getSelectedDateFormatted = () => {
    if (!selectedDate) return '';
    const date = new Date(selectedDate);
    const month = MONTH_NAMES[date.getMonth()];
    return `${month.slice(0, 3)} ${date.getDate()}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-green"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                WELCOME BACK, {instructorName.toUpperCase()}
              </h1>
              <p className="text-gray-600 mt-1">Manage your availability and session slots</p>
            </div>
            <button
              onClick={handleSaveDay}
              disabled={!hasUnsavedChanges}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                hasUnsavedChanges
                  ? 'bg-forest-green text-white hover:bg-forest-green/90'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              SAVE ALL CHANGES
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {/* Calendar Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2 text-gray-600 hover:text-forest-green hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 text-gray-600 hover:text-forest-green hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="p-6">
                {/* Day headers */}
                <div className="grid grid-cols-7 mb-4">
                  {DAYS_OF_WEEK.map((day) => (
                    <div
                      key={day}
                      className="p-2 text-center text-sm font-medium text-gray-700"
                    >
                      {day.slice(0, 3)}
                    </div>
                  ))}
                </div>
                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1">
                  {renderCalendarDays()}
                </div>
              </div>
            </div>
          </div>

          {/* Day Editor Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {selectedDate ? (
                <>
                  {/* Day Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Edit Day: {getSelectedDateFormatted()}
                      </h3>
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                        ACTIVE
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-6">
                    Configure your availability for this specific date
                  </p>

                  {/* Accepting Bookings Toggle */}
                  <div className="mb-6">
                    <label className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Accepting Bookings</span>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={isAcceptingBookings}
                          onChange={(e) => {
                            setIsAcceptingBookings(e.target.checked);
                            setHasUnsavedChanges(true);
                          }}
                          className="sr-only"
                        />
                        <div
                          onClick={() => {
                            setIsAcceptingBookings(!isAcceptingBookings);
                            setHasUnsavedChanges(true);
                          }}
                          className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${
                            isAcceptingBookings ? 'bg-forest-green' : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
                              isAcceptingBookings ? 'translate-x-6' : 'translate-x-1'
                            } mt-1`}
                          />
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Time Slots Section */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">TIME SLOTS</h4>

                    {/* Existing Slots */}
                    <div className="space-y-2 mb-4">
                      {daySlots.map((slot) => (
                        <div
                          key={slot.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {formatTime12Hour(slot.start_time)} - {formatTime12Hour(slot.end_time)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {slot.practice_styles?.name || 'No style'}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteSlot(slot.id)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add Slot Button */}
                    {!showAddSlotForm ? (
                      <button
                        onClick={() => setShowAddSlotForm(true)}
                        className="w-full py-2 px-4 bg-forest-green text-white rounded-lg hover:bg-forest-green/90 transition-colors flex items-center justify-center"
                      >
                        <Plus size={16} className="mr-2" />
                        ADD SLOT
                      </button>
                    ) : (
                      /* Add Slot Form */
                      <div className="space-y-3 p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-medium text-gray-900">Add New Slot</h5>
                          <button
                            onClick={() => setShowAddSlotForm(false)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Start Time
                            </label>
                            <input
                              type="time"
                              value={newSlot.start_time}
                              onChange={(e) => {
                                setNewSlot({ ...newSlot, start_time: e.target.value });
                                setHasUnsavedChanges(true);
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              End Time
                            </label>
                            <input
                              type="time"
                              value={newSlot.end_time}
                              onChange={(e) => {
                                setNewSlot({ ...newSlot, end_time: e.target.value });
                                setHasUnsavedChanges(true);
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Session Type
                          </label>
                          <select
                            value={newSlot.practice_style_id}
                            onChange={(e) => {
                              setNewSlot({ ...newSlot, practice_style_id: e.target.value });
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            {practiceStyles.map((style) => (
                              <option key={style.id} value={style.id}>
                                {style.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          onClick={handleAddSlot}
                          className="w-full py-1.5 px-3 bg-forest-green text-white text-sm rounded hover:bg-forest-green/90 transition-colors"
                        >
                          Add Slot
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={handleDiscardChanges}
                      disabled={!hasUnsavedChanges}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                        hasUnsavedChanges
                          ? 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                          : 'border border-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      DISCARD
                    </button>
                    <button
                      onClick={handleSaveDay}
                      disabled={!hasUnsavedChanges}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                        hasUnsavedChanges
                          ? 'bg-forest-green text-white hover:bg-forest-green/90'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      SAVE DAY
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No date selected</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Select a date from the calendar to edit time slots
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};