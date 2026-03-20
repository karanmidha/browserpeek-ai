import React, { useState, useEffect } from 'react';

interface WeeklyDateSelectorProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  disabled?: boolean;
}

const WeeklyDateSelector: React.FC<WeeklyDateSelectorProps> = ({
  selectedDate,
  onDateSelect,
  disabled
}) => {
  const [availableDates, setAvailableDates] = useState<Date[]>([]);

  useEffect(() => {
    // Generate available dates for the next 7 days starting from today
    const dates: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }

    setAvailableDates(dates);
  }, []);

  const getWeekDayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false;
    return selectedDate.getTime() === date.getTime();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date.getTime() === today.getTime();
  };

  const formatDateDisplay = (date: Date) => {
    const dayName = getWeekDayNames[date.getDay()];
    const dayNumber = date.getDate();
    return { dayName, dayNumber };
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-serif text-secondary-900 mb-4">Select Date</h3>

      {/* 7-Day Calendar Header */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {availableDates.map((date, index) => {
          const { dayName, dayNumber } = formatDateDisplay(date);
          const selected = isDateSelected(date);
          const today = isToday(date);

          return (
            <button
              key={index}
              onClick={() => onDateSelect(date)}
              disabled={disabled}
              className={`
                flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200
                ${selected
                  ? 'bg-secondary-600 text-white shadow-md'
                  : today
                    ? 'bg-secondary-100 text-secondary-900 border-2 border-secondary-500 hover:bg-secondary-200'
                    : 'text-secondary-700 hover:bg-secondary-50 hover:border hover:border-secondary-300 bg-white border border-gray-200'
                }
                ${!disabled ? 'hover:scale-105' : 'opacity-50'}
              `}
            >
              <div className="text-xs font-medium mb-1">
                {dayName}
              </div>
              <div className="text-lg font-bold">
                {dayNumber}
              </div>
              {today && (
                <div className="text-xs mt-1">
                  <span className={`px-1 rounded text-xs ${selected ? 'text-white' : 'text-accent-600'}`}>
                    Today
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 24-hour notice */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm font-medium text-yellow-800">24-Hour Advance Booking Required</p>
            <p className="text-xs text-yellow-700 mt-1">
              Bookings must be made at least 24 hours in advance
            </p>
          </div>
        </div>
      </div>

      {/* Selected Date Display */}
      {selectedDate && (
        <div className="mt-4 p-3 bg-primary-100 rounded-lg">
          <p className="text-sm text-secondary-700">
            Selected: <span className="font-semibold text-secondary-900">
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default WeeklyDateSelector;