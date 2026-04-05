import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

function formatDateInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
}

function parseDDMMYYYY(dateStr: string): Date | null {
  if (!dateStr) return null;
  const parts = dateStr.split("-");
  if (parts.length !== 3) return null;
  const [dd, mm, yyyy] = parts;
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function formatToDD_MM_YYYY(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface DatePickerInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  maxDate?: Date;
  minDate?: Date;
  label?: string;
  className?: string;
  inputMode?: "numeric" | "text";
}

export default function DatePickerInput({
  value,
  onChange,
  placeholder = "DD-MM-YYYY",
  maxDate,
  minDate,
  className = "",
}: DatePickerInputProps) {
  const [calOpen, setCalOpen] = useState(false);

  // Parse current value as Date for calendar selection
  const selectedDate = parseDDMMYYYY(value) || undefined;

  const [calendarMonth, setCalendarMonth] = useState<Date>(
    selectedDate ?? new Date(),
  );

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setCalendarMonth(selectedDate ?? new Date());
    }
    setCalOpen(open);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(formatDateInput(e.target.value));
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (!date) return;
    onChange(formatToDD_MM_YYYY(date));
    setCalOpen(false);
  };

  const handleMonthChange = (monthStr: string) => {
    const newMonth = new Date(calendarMonth);
    newMonth.setMonth(Number(monthStr));
    setCalendarMonth(newMonth);
  };

  const handleYearChange = (yearStr: string) => {
    const newMonth = new Date(calendarMonth);
    newMonth.setFullYear(Number(yearStr));
    setCalendarMonth(newMonth);
  };

  const currentYear = new Date().getFullYear();
  const yearOptions: number[] = [];
  for (let y = currentYear - 10; y <= currentYear + 5; y++) {
    yearOptions.push(y);
  }

  const isDisabled = (date: Date): boolean => {
    if (maxDate && date > maxDate) return true;
    if (minDate && date < minDate) return true;
    return false;
  };

  return (
    <div className={`flex gap-1 ${className}`}>
      <Input
        value={value}
        onChange={handleTextChange}
        placeholder={placeholder}
        maxLength={10}
        inputMode="numeric"
        className="flex-1"
        style={{
          color: value ? undefined : "#9ca3af",
        }}
      />
      <Popover open={calOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="flex-shrink-0 h-9 w-9"
            title="Open calendar"
          >
            <CalendarIcon className="h-4 w-4 text-gray-500" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          {/* Month & Year navigation dropdowns */}
          <div className="flex items-center gap-1 px-3 pt-3 pb-1">
            <Select
              value={String(calendarMonth.getMonth())}
              onValueChange={handleMonthChange}
            >
              <SelectTrigger className="h-7 text-xs flex-1 min-w-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((month, idx) => (
                  <SelectItem
                    key={month}
                    value={String(idx)}
                    className="text-xs"
                  >
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={String(calendarMonth.getFullYear())}
              onValueChange={handleYearChange}
            >
              <SelectTrigger className="h-7 text-xs w-[72px] flex-shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem
                    key={year}
                    value={String(year)}
                    className="text-xs"
                  >
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleCalendarSelect}
            month={calendarMonth}
            onMonthChange={setCalendarMonth}
            disabled={maxDate || minDate ? isDisabled : undefined}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
