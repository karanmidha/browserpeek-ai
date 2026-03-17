import React, { useState, useEffect } from 'react';

interface DateSelectorProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  disabled?: boolean;
}

const DateSelector: React.FC<DateSelectorProps> = ({ selectedDate, onDateSelect, disabled }) => {
  const [availableDates, setAvailableDates] = useState<Date[]>([]);

  useEffect(() => {
    // Generate next 30 days
    const dates: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to midnight for consistency

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }

    setAvailableDates(dates);
  }, []);

  const formatDateDisplay = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.getTime() === today.getTime()) {
      return 'Today';
    } else if (date.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const formatDateNumber = (date: Date) => {
    return date.getDate();
  };

  const formatWeekday = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date.getTime() === today.getTime();
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return date.getTime() === selectedDate.getTime();
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-serif text-secondary-900 mb-4">Select Date</h3>

      {/* Mobile: Vertical list */}
      <div className="md:hidden space-y-2">
        {availableDates.map((date, index) => (
          <button
            key={index}
            onClick={() => onDateSelect(date)}
            disabled={disabled}
            className={`
              w-full p-4 rounded-lg text-left transition-all duration-200
              ${isSelected(date)
                ? 'bg-secondary-600 text-white'
                : isToday(date)
                  ? 'bg-secondary-100 text-secondary-900 border-2 border-secondary-500'
                  : 'bg-white border border-secondary-200 text-secondary-700 hover:bg-secondary-50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}
            `}
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold">{formatDateDisplay(date)}</div>
                <div className="text-sm opacity-75">
                  {date.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </div>
              {isToday(date) && (
                <span className="text-xs bg-accent-500 text-white px-2 py-1 rounded-full">
                  Today
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Desktop: Horizontal strip */}
      <div className="hidden md:block">
        <div className="flex overflow-x-auto scrollbar-hide space-x-3 pb-2">
          {availableDates.map((date, index) => (
            <button
              key={index}
              onClick={() => onDateSelect(date)}
              disabled={disabled}
              className={`
                flex-shrink-0 p-4 rounded-lg transition-all duration-200 min-w-[100px]
                ${isSelected(date)
                  ? 'bg-secondary-600 text-white shadow-lg'
                  : isToday(date)
                    ? 'bg-secondary-100 text-secondary-900 border-2 border-secondary-500'
                    : 'bg-white border border-secondary-200 text-secondary-700 hover:bg-secondary-50 hover:border-secondary-300'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
              `}
            >
              <div className="text-center">
                <div className="text-xs font-medium opacity-75 mb-1">
                  {formatWeekday(date)}
                </div>
                <div className="text-2xl font-bold mb-1">
                  {formatDateNumber(date)}
                </div>
                <div className="text-xs">
                  {date.toLocaleDateString('en-US', { month: 'short' })}
                </div>
                {isToday(date) && (
                  <div className="text-xs bg-accent-500 text-white px-2 py-1 rounded-full mt-2">
                    Today
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

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

export default DateSelector;