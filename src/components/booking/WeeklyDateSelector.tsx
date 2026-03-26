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
    // Generate available dates for the next 7 days starting from TOMORROW
    // Rolling date window: always starts with tomorrow as first day
    const dates: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Start from tomorrow (today + 1 day)
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    for (let i = 0; i < 7; i++) {
      const date = new Date(tomorrow);
      date.setDate(tomorrow.getDate() + i);
      dates.push(date);
    }

    setAvailableDates(dates);
  }, []);

  const getWeekDayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false;
    return selectedDate.getTime() === date.getTime();
  };

  const isTomorrow = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return date.getTime() === tomorrow.getTime();
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
      <div className="grid grid-cols-7 gap-3 mb-4">
        {availableDates.map((date, index) => {
          const { dayName, dayNumber } = formatDateDisplay(date);
          const selected = isDateSelected(date);
          const tomorrow = isTomorrow(date);

          return (
            <button
              key={index}
              onClick={() => onDateSelect(date)}
              disabled={disabled}
              className={`
                flex flex-col items-center justify-center p-4 rounded-lg transition-all duration-200 min-h-[4rem]
                ${selected
                  ? 'bg-sage-600 text-white shadow-md'
                  : tomorrow
                    ? 'bg-white text-stone-900 border-2 border-sage-300 hover:bg-sage-50'
                    : 'text-stone-700 hover:bg-sage-50 hover:border hover:border-sage-300 bg-white border border-sage-100'
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
              {tomorrow && (
                <div className="text-xs mt-1 w-full text-center">
                  <span className={`px-2 py-0.5 rounded text-xs whitespace-nowrap ${selected ? 'text-white' : 'text-sage-700'}`}>
                    Tomorrow
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