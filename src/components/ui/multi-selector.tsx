
import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";
import { cn } from "@/lib/utils";

// Define the option type for the MultiSelector
export interface Option {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface MultiSelectorProps {
  options: Option[];
  value: Option[];
  onChange: (value: Option[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function MultiSelector({
  options,
  value,
  onChange,
  placeholder = "Select options...",
  className,
  disabled = false,
}: MultiSelectorProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const handleUnselect = (option: Option) => {
    onChange(value.filter((item) => item.value !== option.value));
  };

  const handleSelect = (option: Option) => {
    setInputValue("");
    if (value.some((item) => item.value === option.value)) {
      onChange(value.filter((item) => item.value !== option.value));
    } else {
      onChange([...value, option]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const input = inputRef.current;
    if (input) {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (input.value === "" && value.length > 0) {
          onChange(value.slice(0, -1));
        }
      }
      // Prevent keyboard navigation when no suggestions are available
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        if (options.length === 0) {
          e.preventDefault();
        }
      }
    }
  };

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <Command
      onKeyDown={handleKeyDown}
      className={cn(
        "overflow-visible bg-transparent",
        className
      )}
    >
      <div
        className={cn(
          "group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <div className="flex flex-wrap gap-1">
          {value.map((option) => (
            <Badge
              key={option.value}
              variant="secondary"
              className="rounded-sm px-1 py-0 text-xs font-normal"
            >
              {option.label}
              <button
                className={cn(
                  "ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  disabled && "cursor-not-allowed"
                )}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!disabled) {
                      handleUnselect(option);
                    }
                  }
                }}
                onClick={() => {
                  if (!disabled) {
                    handleUnselect(option);
                  }
                }}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          ))}
          {/* Avoid shrinking the input */}
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder={value.length === 0 ? placeholder : ""}
            disabled={disabled}
            className="ml-1 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <div className="relative">
        {open && inputValue.length > 0 && (
          <CommandList className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
            {filteredOptions.length > 0 ? (
              <CommandGroup>
                {filteredOptions.map((option) => {
                  const isSelected = value.some((item) => item.value === option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onSelect={() => {
                        if (!disabled) {
                          handleSelect(option);
                        }
                      }}
                      className={cn(
                        "cursor-pointer",
                        isSelected && "bg-accent font-medium",
                        disabled && "cursor-not-allowed"
                      )}
                    >
                      {option.icon && (
                        <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="truncate">{option.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ) : (
              <CommandEmpty className="py-2 text-center text-sm">
                No results found.
              </CommandEmpty>
            )}
          </CommandList>
        )}
      </div>
    </Command>
  );
}
