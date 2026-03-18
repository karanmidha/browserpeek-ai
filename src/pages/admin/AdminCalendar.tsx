import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { adminAuth } from '../../lib/admin/auth';
import {
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
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
  created_at: string;
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
  date: string;
  start_time: string;
  end_time: string;
  practice_style_id: string;
  max_students: number;
  is_available: boolean;
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const AdminCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [practiceStyles, setPracticeStyles] = useState<PracticeStyle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [_selectedDate, setSelectedDate] = useState<string>(''); // TODO: Implement date selection functionality
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStyle, setFilterStyle] = useState('');

  const [slotForm, setSlotForm] = useState<SlotFormData>({
    date: '',
    start_time: '09:00',
    end_time: '10:00',
    practice_style_id: '',
    max_students: 10,
    is_available: true,
  });

  useEffect(() => {
    loadInitialData();
  }, [currentDate]);

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

  const handleAddSlot = (date: string) => {
    setSelectedDate(date);
    setSlotForm({
      ...slotForm,
      date,
      practice_style_id: practiceStyles[0]?.id || '',
    });
    setEditingSlot(null);
    setShowSlotModal(true);
  };

  const handleEditSlot = (slot: TimeSlot) => {
    setEditingSlot(slot);
    setSlotForm({
      date: slot.date,
      start_time: slot.start_time,
      end_time: slot.end_time,
      practice_style_id: slot.practice_style_id || '',
      max_students: slot.max_students,
      is_available: slot.is_available,
    });
    setShowSlotModal(true);
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('Are you sure you want to delete this time slot? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('time_slots')
        .delete()
        .eq('id', slotId);

      if (error) throw error;

      // Log audit action
      await logAuditAction('time_slot.delete', slotId, 'time_slots');

      await loadTimeSlots();
    } catch (error) {
      console.error('Failed to delete time slot:', error);
      alert('Failed to delete time slot');
    }
  };

  const handleSaveSlot = async () => {
    try {
      const slotData = {
        ...slotForm,
        instructor_id: adminAuth.getCurrentSession()?.user.id || '',
      };

      let result;
      if (editingSlot) {
        result = await supabase
          .from('time_slots')
          .update(slotData)
          .eq('id', editingSlot.id);

        await logAuditAction('time_slot.update', editingSlot.id, 'time_slots', slotData);
      } else {
        result = await supabase
          .from('time_slots')
          .insert(slotData);

        await logAuditAction('time_slot.create', null, 'time_slots', slotData);
      }

      if (result.error) throw result.error;

      setShowSlotModal(false);
      await loadTimeSlots();
    } catch (error) {
      console.error('Failed to save time slot:', error);
      alert('Failed to save time slot');
    }
  };

  const logAuditAction = async (action: string, targetId: string | null, targetType: string, data?: any) => {
    try {
      await supabase.from('audit_logs').insert({
        admin_id: adminAuth.getCurrentSession()?.user.id || '',
        action,
        target_id: targetId,
        target_type: targetType,
        new_value: data || null,
        ip_address: await getClientIP(),
        user_agent: navigator.userAgent,
      });
    } catch (error) {
      console.error('Failed to log audit action:', error);
    }
  };

  const getClientIP = async (): Promise<string | null> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || null;
    } catch {
      return null;
    }
  };

  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    // const lastDay = new Date(year, month + 1, 0); // TODO: Use for calendar boundary calculation
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
      const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

      return (
        <div
          key={index}
          className={`min-h-[120px] p-2 border-r border-b border-gray-200 ${
            isCurrentMonth ? 'bg-white' : 'bg-gray-50'
          } ${isToday ? 'bg-blue-50' : ''}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-sm font-medium ${
                isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
              } ${isToday ? 'text-blue-600' : ''} ${isPast ? 'text-gray-400' : ''}`}
            >
              {date.getDate()}
            </span>
            {isCurrentMonth && !isPast && (
              <button
                onClick={() => handleAddSlot(dateStr)}
                className="p-1 text-gray-400 hover:text-forest-green rounded"
                title="Add time slot"
              >
                <Plus size={14} />
              </button>
            )}
          </div>
          <div className="space-y-1">
            {daySlots.map((slot) => (
              <div
                key={slot.id}
                className={`p-1 rounded text-xs cursor-pointer group relative ${
                  slot.is_available
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600'
                }`}
                onClick={() => handleEditSlot(slot)}
              >
                <div className="font-medium">
                  {slot.start_time} - {slot.end_time}
                </div>
                <div className="flex items-center justify-between">
                  <span className="truncate">
                    {slot.practice_styles?.name || 'No style'}
                  </span>
                  <span>{slot.bookings_count || 0}/{slot.max_students}</span>
                </div>
                <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSlot(slot.id);
                    }}
                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    });
  };

  // TODO: Implement time slot filtering in the UI
  // const filteredTimeSlots = timeSlots.filter(slot => {
  //   const matchesSearch = searchTerm === '' ||
  //     slot.practice_styles?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     slot.date.includes(searchTerm);
  //   const matchesStyle = filterStyle === '' || slot.practice_style_id === filterStyle;
  //   return matchesSearch && matchesStyle;
  // });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-green"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar Management</h1>
          <p className="text-gray-600 mt-1">Manage time slots and class schedules</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'month'
                  ? 'bg-white text-forest-green shadow-sm'
                  : 'text-gray-600 hover:text-forest-green'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'week'
                  ? 'bg-white text-forest-green shadow-sm'
                  : 'text-gray-600 hover:text-forest-green'
              }`}
            >
              Week
            </button>
          </div>
          <button
            onClick={() => handleAddSlot(new Date().toISOString().split('T')[0])}
            className="bg-forest-green text-white px-4 py-2 rounded-lg hover:bg-forest-green/90 transition-colors flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Add Slot
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by practice style or date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-green focus:border-transparent"
            />
          </div>
        </div>
        <select
          value={filterStyle}
          onChange={(e) => setFilterStyle(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-green focus:border-transparent"
        >
          <option value="">All Practice Styles</option>
          {practiceStyles.map((style) => (
            <option key={style.id} value={style.id}>
              {style.name}
            </option>
          ))}
        </select>
        <button
          onClick={loadTimeSlots}
          className="p-2 text-gray-600 hover:text-forest-green border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between bg-white rounded-xl shadow-sm p-4">
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

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              className="p-3 text-center text-sm font-medium text-gray-700 bg-gray-50 border-r border-gray-200"
            >
              {day}
            </div>
          ))}
        </div>
        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {renderCalendarDays()}
        </div>
      </div>

      {/* Time Slot Modal */}
      {showSlotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingSlot ? 'Edit Time Slot' : 'Add Time Slot'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={slotForm.date}
                  onChange={(e) => setSlotForm({ ...slotForm, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-green focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={slotForm.start_time}
                    onChange={(e) => setSlotForm({ ...slotForm, start_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-green focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={slotForm.end_time}
                    onChange={(e) => setSlotForm({ ...slotForm, end_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-green focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Practice Style</label>
                <select
                  value={slotForm.practice_style_id}
                  onChange={(e) => setSlotForm({ ...slotForm, practice_style_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-green focus:border-transparent"
                >
                  <option value="">Select practice style...</option>
                  {practiceStyles.map((style) => (
                    <option key={style.id} value={style.id}>
                      {style.name} (₹{style.price/100} - {style.duration_minutes}min)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Students</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={slotForm.max_students}
                  onChange={(e) => setSlotForm({ ...slotForm, max_students: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-green focus:border-transparent"
                />
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={slotForm.is_available}
                    onChange={(e) => setSlotForm({ ...slotForm, is_available: e.target.checked })}
                    className="mr-2 rounded border-gray-300 text-forest-green focus:ring-forest-green"
                  />
                  <span className="text-sm font-medium text-gray-700">Available for booking</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSlotModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSlot}
                className="px-4 py-2 bg-forest-green text-white hover:bg-forest-green/90 rounded-lg transition-colors"
              >
                {editingSlot ? 'Update' : 'Create'} Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};