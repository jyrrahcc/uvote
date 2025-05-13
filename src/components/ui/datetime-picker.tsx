
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
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
  showTimePicker = true,
  className,
}: DateTimePickerProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => {
              if (!newDate) {
                setDate(undefined);
                return;
              }
              
              // If we already have a date, preserve the time
              if (date) {
                const hours = date.getHours();
                const minutes = date.getMinutes();
                const seconds = date.getSeconds();
                newDate.setHours(hours);
                newDate.setMinutes(minutes);
                newDate.setSeconds(seconds);
              }
              
              setDate(newDate);
            }}
            initialFocus
          />
          {showTimePicker && date && (
            <div className="border-t border-border p-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground mb-1">Hours</span>
                  <Select
                    value={date?.getHours().toString().padStart(2, "0")}
                    onValueChange={(value) => {
                      const newDate = new Date(date);
                      newDate.setHours(parseInt(value));
                      setDate(newDate);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Hour" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }).map((_, i) => (
                        <SelectItem key={i} value={i.toString().padStart(2, "0")}>
                          {i.toString().padStart(2, "0")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground mb-1">Minutes</span>
                  <Select
                    value={date?.getMinutes().toString().padStart(2, "0")}
                    onValueChange={(value) => {
                      const newDate = new Date(date);
                      newDate.setMinutes(parseInt(value));
                      setDate(newDate);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Minute" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 60 }).map((_, i) => (
                        <SelectItem key={i} value={i.toString().padStart(2, "0")}>
                          {i.toString().padStart(2, "0")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground mb-1">Seconds</span>
                  <Select
                    value={date?.getSeconds().toString().padStart(2, "0")}
                    onValueChange={(value) => {
                      const newDate = new Date(date);
                      newDate.setSeconds(parseInt(value));
                      setDate(newDate);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Second" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 60 }).map((_, i) => (
                        <SelectItem key={i} value={i.toString().padStart(2, "0")}>
                          {i.toString().padStart(2, "0")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
