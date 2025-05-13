import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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

interface DateTimePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  showTimePicker?: boolean;
  className?: string;
}

export function DateTimePicker({
  date,
  setDate,
  showTimePicker = false,
  className,
}: DateTimePickerProps) {
  const [selectedHour, setSelectedHour] = React.useState<string>(
    date ? format(date, "HH") : "12"
  );
  const [selectedMinute, setSelectedMinute] = React.useState<string>(
    date ? format(date, "mm") : "00"
  );

  // Update the time when hour or minute changes
  React.useEffect(() => {
    if (date && (selectedHour || selectedMinute)) {
      const newDate = new Date(date);
      newDate.setHours(parseInt(selectedHour || "0", 10));
      newDate.setMinutes(parseInt(selectedMinute || "0", 10));
      setDate(newDate);
    }
  }, [selectedHour, selectedMinute, date, setDate]);

  // Update hour and minute when date changes
  React.useEffect(() => {
    if (date) {
      setSelectedHour(format(date, "HH"));
      setSelectedMinute(format(date, "mm"));
    }
  }, [date]);

  const handleSelectDate = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      
      // If we already have a date, preserve the time
      if (date) {
        newDate.setHours(date.getHours());
        newDate.setMinutes(date.getMinutes());
      } else {
        // Otherwise set to current time
        const now = new Date();
        newDate.setHours(now.getHours());
        newDate.setMinutes(now.getMinutes());
        
        // Update the time selectors
        setSelectedHour(format(newDate, "HH"));
        setSelectedMinute(format(newDate, "mm"));
      }
      
      setDate(newDate);
    } else {
      setDate(undefined);
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, showTimePicker ? "PPP 'at' HH:mm" : "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelectDate}
            initialFocus
            className="p-3 pointer-events-auto"
          />
          
          {showTimePicker && date && (
            <div className="border-t border-border p-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={selectedHour}
                  onValueChange={(value) => setSelectedHour(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Hour" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="h-[300px]">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <SelectItem key={i} value={i.toString().padStart(2, "0")}>
                        {i.toString().padStart(2, "0")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select
                  value={selectedMinute}
                  onValueChange={(value) => setSelectedMinute(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Minute" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="h-[300px]">
                    {Array.from({ length: 60 }).map((_, i) => (
                      <SelectItem key={i} value={i.toString().padStart(2, "0")}>
                        {i.toString().padStart(2, "0")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
