import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { 
  DLSU_DEPARTMENTS, 
  YEAR_LEVELS,
  DEFAULT_POSITIONS
} from "@/features/elections/types/electionFormTypes";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

export function ElectionDetailsTab() {
  const form = useFormContext();
  const [newPosition, setNewPosition] = useState("");
  
  const addPosition = () => {
    if (newPosition.trim()) {
      const currentPositions = form.getValues("positions") || [];
      const trimmedPosition = newPosition.trim();
      
      // Check for duplicate positions (case-insensitive)
      const isDuplicate = currentPositions.some((position: string) => 
        position.toLowerCase() === trimmedPosition.toLowerCase()
      );
      
      if (isDuplicate) {
        toast.error(`Position "${trimmedPosition}" already exists`);
        return;
      }
      
      form.setValue("positions", [...currentPositions, trimmedPosition]);
      setNewPosition("");
    }
  };

  const removePosition = (indexToRemove: number) => {
    const currentPositions = form.getValues("positions") || [];
    form.setValue("positions", currentPositions.filter((_, index) => index !== indexToRemove));
  };

  const addDefaultPosition = (position: string) => {
    const currentPositions = form.getValues("positions") || [];
    
    // Check for duplicate positions (case-insensitive)
    const isDuplicate = currentPositions.some((existingPosition: string) => 
      existingPosition.toLowerCase() === position.toLowerCase()
    );
    
    if (isDuplicate) {
      toast.error(`Position "${position}" already exists`);
      return;
    }
    
    form.setValue("positions", [...currentPositions, position]);
  };

  const handleCollegeChange = (college: string, checked: boolean) => {
    const currentColleges = form.getValues("colleges") || [];
    
    if (college === "University-wide") {
      if (checked) {
        // Select all colleges when University-wide is selected
        form.setValue("colleges", [...DLSU_DEPARTMENTS]);
      } else {
        // Unselect University-wide only
        form.setValue("colleges", currentColleges.filter(c => c !== "University-wide"));
      }
    } else {
      if (checked) {
        form.setValue("colleges", [...currentColleges, college]);
      } else {
        const newColleges = currentColleges.filter(c => c !== college);
        form.setValue("colleges", newColleges);
      }
    }
  };

  const handleYearLevelChange = (yearLevel: string, checked: boolean) => {
    const currentYearLevels = form.getValues("eligibleYearLevels") || [];
    
    if (yearLevel === "All Year Levels & Groups") {
      if (checked) {
        // Select all year levels when "All Year Levels & Groups" is selected
        form.setValue("eligibleYearLevels", [...YEAR_LEVELS]);
      } else {
        // Unselect "All Year Levels & Groups" only
        form.setValue("eligibleYearLevels", currentYearLevels.filter(y => y !== "All Year Levels & Groups"));
      }
    } else {
      if (checked) {
        form.setValue("eligibleYearLevels", [...currentYearLevels, yearLevel]);
      } else {
        const newYearLevels = currentYearLevels.filter(y => y !== yearLevel);
        form.setValue("eligibleYearLevels", newYearLevels);
      }
    }
  };
  
  return (
    <div className="space-y-6 py-4">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Election Title</FormLabel>
            <FormControl>
              <Input placeholder="e.g. Student Council Election 2023" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Enter a short description about the election..."
                className="h-24"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Election Positions Section */}
      <FormField
        control={form.control}
        name="positions"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Election Positions</FormLabel>
            <div className="space-y-3">
              {/* Current Positions */}
              <div className="flex flex-wrap gap-2">
                {(field.value || []).map((position: string, index: number) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {position}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => removePosition(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>

              {/* Add Custom Position */}
              <div className="flex gap-2">
                <Input
                  placeholder="Enter position name"
                  value={newPosition}
                  onChange={(e) => setNewPosition(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPosition())}
                />
                <Button type="button" onClick={addPosition} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Quick Add Default Positions */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Quick add common positions:</p>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_POSITIONS.map((position) => {
                    const currentPositions = field.value || [];
                    const isDisabled = currentPositions.some((existingPosition: string) => 
                      existingPosition.toLowerCase() === position.toLowerCase()
                    );
                    
                    return (
                      <Button
                        key={position}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addDefaultPosition(position)}
                        disabled={isDisabled}
                      >
                        {position}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="candidacyStartDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Candidacy Start Date</FormLabel>
              <input
                type="datetime-local"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : null;
                  field.onChange(date?.toISOString());
                }}
                placeholder="Select candidacy start date"
              />
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="candidacyEndDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Candidacy End Date</FormLabel>
              <input
                type="datetime-local"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : null;
                  field.onChange(date?.toISOString());
                }}
                placeholder="Select candidacy end date"
              />
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={form.control}
        name="colleges"
        render={() => (
          <FormItem>
            <FormLabel>Eligible Colleges/Departments</FormLabel>
            <ScrollArea className="h-40 rounded-md border">
              <div className="p-4 space-y-2">
                {DLSU_DEPARTMENTS.map((department) => (
                  <FormField
                    key={department}
                    control={form.control}
                    name="colleges"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={department}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(department)}
                              onCheckedChange={(checked) => {
                                handleCollegeChange(department, !!checked);
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            {department}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
            </ScrollArea>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="eligibleYearLevels"
        render={() => (
          <FormItem>
            <FormLabel>Eligible Year Levels & Groups</FormLabel>
            <ScrollArea className="h-40 rounded-md border">
              <div className="p-4 space-y-2">
                {YEAR_LEVELS.map((yearLevel) => (
                  <FormField
                    key={yearLevel}
                    control={form.control}
                    name="eligibleYearLevels"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={yearLevel}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(yearLevel)}
                              onCheckedChange={(checked) => {
                                handleYearLevelChange(yearLevel, !!checked);
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            {yearLevel}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
            </ScrollArea>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Election Start Date</FormLabel>
              <input
                type="datetime-local"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : null;
                  field.onChange(date?.toISOString());
                }}
                placeholder="Select election start date"
              />
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Election End Date</FormLabel>
              <input
                type="datetime-local"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : null;
                  field.onChange(date?.toISOString());
                }}
                placeholder="Select election end date"
              />
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={form.control}
        name="isPrivate"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center space-x-2 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Private Election</FormLabel>
              <p className="text-sm text-muted-foreground">
                Require an access code for users to view this election
              </p>
            </div>
          </FormItem>
        )}
      />
      
      {form.watch("isPrivate") && (
        <FormField
          control={form.control}
          name="accessCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Access Code</FormLabel>
              <FormControl>
                <Input placeholder="Enter access code" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
