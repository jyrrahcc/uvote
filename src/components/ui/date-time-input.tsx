
import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "./input";

interface DateTimeInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

const DateTimeInput = ({
  value,
  onChange,
  className,
  disabled = false,
}: DateTimeInputProps) => {
  // Parse the value into date and time parts
  const dateValue = value ? new Date(value) : undefined;
  
  // Format time as HH:MM
  const timeString = dateValue 
    ? `${dateValue.getHours().toString().padStart(2, '0')}:${dateValue.getMinutes().toString().padStart(2, '0')}`
    : "";

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    // Preserve the time if we already had a value
    if (dateValue) {
      date.setHours(dateValue.getHours(), dateValue.getMinutes());
    }
    
    onChange(date.toISOString());
  };

  // Handle time input
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTimeString = e.target.value;
    
    if (!dateValue || !newTimeString) return;
    
    const [hours, minutes] = newTimeString.split(':').map(Number);
    
    if (isNaN(hours) || isNaN(minutes)) return;
    
    const newDate = new Date(dateValue);
    newDate.setHours(hours, minutes);
    
    onChange(newDate.toISOString());
  };

  return (
    <div className={cn("flex gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal w-[210px]",
              !dateValue && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateValue ? format(dateValue, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={dateValue}
            onSelect={handleDateSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <Input
        type="time"
        value={timeString}
        onChange={handleTimeChange}
        className="w-[120px]"
        disabled={disabled || !dateValue}
      />
    </div>
  );
};

export default DateTimeInput;
