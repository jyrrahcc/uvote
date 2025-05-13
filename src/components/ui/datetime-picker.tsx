
"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DateTimePickerProps {
  date?: Date;
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
  const [selectedDateTime, setSelectedDateTime] = React.useState<Date | undefined>(date);

  // Update the component state when the external date changes
  React.useEffect(() => {
    setSelectedDateTime(date);
  }, [date]);

  // Define time options
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 15, 30, 45];

  const handleDateChange = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      setDate(undefined);
      return;
    }

    const newDate = selectedDateTime ? new Date(selectedDateTime) : new Date(selectedDate);
    newDate.setFullYear(selectedDate.getFullYear());
    newDate.setMonth(selectedDate.getMonth());
    newDate.setDate(selectedDate.getDate());

    setSelectedDateTime(newDate);
    setDate(newDate);
  };

  const handleTimeChange = (type: "hours" | "minutes", value: number) => {
    if (!selectedDateTime) return;

    const newDateTime = new Date(selectedDateTime);
    if (type === "hours") {
      newDateTime.setHours(value);
    } else {
      newDateTime.setMinutes(value);
    }

    setSelectedDateTime(newDateTime);
    setDate(newDateTime);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? (
              format(date, showTimePicker ? "PPP 'at' p" : "PPP")
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDateTime}
            onSelect={handleDateChange}
            initialFocus
            className="rounded-md border"
          />
          {showTimePicker && selectedDateTime && (
            <div className="border-t border-border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Time</p>
                  <div className="flex gap-2">
                    <Select
                      defaultValue={selectedDateTime.getHours().toString()}
                      onValueChange={(value) => handleTimeChange("hours", parseInt(value))}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue placeholder="Hour" />
                      </SelectTrigger>
                      <SelectContent>
                        {hours.map((hour) => (
                          <SelectItem key={hour} value={hour.toString()}>
                            {hour.toString().padStart(2, "0")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-sm self-center">:</span>
                    <Select
                      defaultValue={Math.floor(selectedDateTime.getMinutes() / 15) * 15 + ""}
                      onValueChange={(value) => handleTimeChange("minutes", parseInt(value))}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue placeholder="Min" />
                      </SelectTrigger>
                      <SelectContent>
                        {minutes.map((minute) => (
                          <SelectItem key={minute} value={minute.toString()}>
                            {minute.toString().padStart(2, "0")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
