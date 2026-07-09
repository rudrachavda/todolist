import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomDatePickerProps {
  value: string;
  onChange: (value: string) => void;
}

export const CustomDatePicker = ({ value, onChange }: CustomDatePickerProps) => {
  const [currentDate, setCurrentDate] = useState(() => {
    return value ? new Date(value) : new Date();
  });

  const [time, setTime] = useState(() => {
    if (value) {
      const d = new Date(value);
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    }
    return "09:00";
  });

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const handleDayClick = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    const [hours, minutes] = time.split(':').map(Number);
    newDate.setHours(hours || 0, minutes || 0, 0, 0);
    
    const tzOffset = newDate.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(newDate.getTime() - tzOffset)).toISOString().slice(0, 16);
    onChange(localISOTime);
    setCurrentDate(newDate);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTime(newTime);
    if (value) {
      const newDate = new Date(value);
      const [hours, minutes] = newTime.split(':').map(Number);
      newDate.setHours(hours || 0, minutes || 0, 0, 0);
      const tzOffset = newDate.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(newDate.getTime() - tzOffset)).toISOString().slice(0, 16);
      onChange(localISOTime);
    }
  };

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const selectedDateObj = value ? new Date(value) : null;
  const isSelected = (day: number) => {
    if (!selectedDateObj) return false;
    return selectedDateObj.getDate() === day && selectedDateObj.getMonth() === currentMonth && selectedDateObj.getFullYear() === currentYear;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
  };

  return (
    <div className="w-[232px]" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-3 px-1">
        <button onClick={handlePrevMonth} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors text-zinc-500">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-xs font-semibold tracking-[0.005em] text-zinc-900 dark:text-zinc-100">
          {monthNames[currentMonth]} {currentYear}
        </span>
        <button onClick={handleNextMonth} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors text-zinc-500">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {dayNames.map(d => (
          <div key={d} className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {days.map((day, i) => (
          <div key={i} className="aspect-square flex items-center justify-center">
            {day ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDayClick(day);
                }}
                className={cn(
                  "w-full h-full text-xs rounded-md flex items-center justify-center transition-colors font-medium tabular-nums",
                  isSelected(day) 
                    ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900" 
                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                  !isSelected(day) && isToday(day) && "text-blue-500 dark:text-blue-400"
                )}
              >
                {day}
              </button>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t-[0.5px] border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-1">
        <span className="text-xs font-medium tracking-[0.005em] text-[#646464] dark:text-zinc-400">Time</span>
        <input
          type="time"
          value={time}
          onChange={handleTimeChange}
          onClick={(e) => e.stopPropagation()}
          className="bg-transparent border-[0.5px] border-solid border-[rgba(225,228,232,0.8)] dark:border-[rgba(29,29,29,0.8)] rounded-md px-2 py-1 text-xs font-medium text-[#1d1d1d] dark:text-zinc-100 outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors tabular-nums cursor-text"
        />
      </div>
    </div>
  );
};
