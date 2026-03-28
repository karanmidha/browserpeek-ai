import React, { useState, useEffect } from 'react';

interface MobileCompactDateSelectorProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  disabled?: boolean;
}

const MobileCompactDateSelector: React.FC<MobileCompactDateSelectorProps> = ({
  selectedDate,
  onDateSelect,
  disabled = false
}) => {
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date());

  useEffect(() => {
    // Generate available dates (next 7 days)
    const dates: Date[] = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }

    setAvailableDates(dates);
  }, []);

  const formatDate = (date: Date) => {
    return {
      dayAbbr: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      dayNum: date.getDate().toString()
    };
  };

  const isDateSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const isDateDisabled = (date: Date) => {
    // Disable dates in the past or more than 30 days out
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 30);

    return date < today || date > maxDate;
  };

  const getCurrentMonthYear = () => {
    return currentWeekStart.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    }).toUpperCase();
  };

  const handleDateClick = (date: Date) => {
    if (disabled || isDateDisabled(date)) return;
    onDateSelect(date);
  };

  return (
    <div>
      <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">
        {getCurrentMonthYear()}
      </label>

      <div className="grid grid-cols-7 gap-1.5">
        {availableDates.map((date, index) => {
          const { dayAbbr, dayNum } = formatDate(date);
          const isSelected = isDateSelected(date);
          const isDisabled = isDateDisabled(date);

          if (isDisabled) {
            return (
              <div key={index} className="relative opacity-30">
                <div className="flex flex-col items-center justify-center py-2 border border-stone-100 rounded-lg bg-stone-50">
                  <span className="text-[9px] uppercase font-bold opacity-70">{dayAbbr}</span>
                  <span className="text-base font-semibold">{dayNum}</span>
                </div>
              </div>
            );
          }

          return (
            <div key={index} className="relative">
              <input
                type="radio"
                className="hidden date-radio"
                id={`date-${index}`}
                name="session-date"
                checked={isSelected || false}
                onChange={() => handleDateClick(date)}
                disabled={disabled}
              />
              <label
                htmlFor={`date-${index}`}
                className={`flex flex-col items-center justify-center py-2 border rounded-lg cursor-pointer transition-all min-h-[44px] ${
                  isSelected
                    ? 'bg-primary text-white border-primary'
                    : 'border-stone-200 hover:border-primary bg-white'
                } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                <span className="text-[9px] uppercase font-bold opacity-70">{dayAbbr}</span>
                <span className="text-base font-semibold">{dayNum}</span>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MobileCompactDateSelector;