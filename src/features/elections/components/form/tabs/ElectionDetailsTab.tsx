
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { X, Plus, Info } from "lucide-react";
import { useFormContext, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { 
  DLSU_DEPARTMENTS, 
  ElectionFormValues,
  YEAR_LEVELS 
} from "../../../types/electionFormTypes";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const ElectionDetailsTab = () => {
  const form = useFormContext<ElectionFormValues>();
  const [newPosition, setNewPosition] = useState("");
  const positions = form.watch("positions");

  const addPosition = () => {
    if (newPosition && newPosition.trim() !== "") {
      if (!positions.includes(newPosition.trim())) {
        form.setValue("positions", [...positions, newPosition.trim()]);
      }
      setNewPosition("");
    }
  };

  const removePosition = (position: string) => {
    form.setValue("positions", positions.filter(p => p !== position));
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Election Title*</FormLabel>
            <FormControl>
              <Input 
                placeholder="e.g., Student Council Election 2023"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <Card className="border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <span>Eligible Voters</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-2">
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Only verified users from the selected departments and year levels will be 
                    eligible to vote in this election.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          <CardDescription>
            Select the departments and year levels that are eligible to vote in this election
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="departments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Eligible Departments*</FormLabel>
                  <div className="space-y-2">
                    {DLSU_DEPARTMENTS.map((dept) => (
                      <div key={dept} className="flex items-center space-x-2">
                        <Checkbox 
                          id={dept}
                          checked={field.value.includes(dept)}
                          onCheckedChange={(checked) => {
                            const currentDepartments = [...field.value];
                            if (checked) {
                              // If University-wide is selected, clear other selections
                              if (dept === "University-wide") {
                                form.setValue("departments", ["University-wide"]);
                              } else {
                                // If another option is selected, remove University-wide
                                const newDeps = currentDepartments.filter(d => d !== "University-wide");
                                newDeps.push(dept);
                                form.setValue("departments", newDeps);
                              }
                            } else {
                              form.setValue("departments", 
                                currentDepartments.filter(d => d !== dept)
                              );
                            }
                          }}
                        />
                        <Label 
                          htmlFor={dept}
                          className="text-sm font-normal"
                        >
                          {dept}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Select one or more departments for this election.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="eligibleYearLevels"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Eligible Year Levels</FormLabel>
                  <div className="space-y-2">
                    {YEAR_LEVELS.map((year) => (
                      <div key={year} className="flex items-center space-x-2">
                        <Checkbox 
                          id={year}
                          checked={field.value.includes(year)}
                          onCheckedChange={(checked) => {
                            const currentYears = [...field.value];
                            if (checked) {
                              // If All Year Levels is selected, clear other selections
                              if (year === "All Year Levels") {
                                form.setValue("eligibleYearLevels", ["All Year Levels"]);
                              } else {
                                // If another option is selected, remove All Year Levels
                                const newYears = currentYears.filter(y => y !== "All Year Levels");
                                newYears.push(year);
                                form.setValue("eligibleYearLevels", newYears);
                              }
                            } else {
                              form.setValue("eligibleYearLevels", 
                                currentYears.filter(y => y !== year)
                              );
                            }
                          }}
                        />
                        <Label 
                          htmlFor={year}
                          className="text-sm font-normal"
                        >
                          {year}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Select eligible year levels. If none selected, all year levels are eligible.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
      
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Input 
                placeholder="Provide a brief description"
                {...field} 
                value={field.value || ""}
              />
            </FormControl>
          </FormItem>
        )}
      />
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Election Positions</h3>
        <div className="flex items-end gap-2">
          <div className="flex-grow">
            <Label htmlFor="new-position">Add New Position</Label>
            <Input 
              id="new-position"
              placeholder="Enter position name"
              value={newPosition}
              onChange={(e) => setNewPosition(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addPosition();
                }
              }}
            />
          </div>
          <Button 
            type="button" 
            onClick={addPosition}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
        
        <div className="border rounded-md p-3 space-y-2">
          {positions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {positions.map(position => (
                <div 
                  key={position} 
                  className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-md"
                >
                  <span>{position}</span>
                  <button
                    type="button"
                    onClick={() => removePosition(position)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-2">
              No positions added. Add at least one position for candidates.
            </p>
          )}
        </div>
      </div>
      
      <h3 className="text-lg font-semibold pt-2 flex items-center">
        Candidacy Period
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="candidacyStartDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Candidacy Start Date*</FormLabel>
              <FormControl>
                <Input 
                  type="datetime-local"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="candidacyEndDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Candidacy End Date*</FormLabel>
              <FormControl>
                <Input 
                  type="datetime-local"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <h3 className="text-lg font-semibold pt-2 flex items-center">
        Voting Period
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Voting Start Date*</FormLabel>
              <FormControl>
                <Input 
                  type="datetime-local"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Voting End Date*</FormLabel>
              <FormControl>
                <Input 
                  type="datetime-local"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={form.control}
        name="isPrivate"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>
                Make Election Private
              </FormLabel>
              <p className="text-sm text-muted-foreground">
                Private elections require an access code to view and participate
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
              <FormLabel>Access Code*</FormLabel>
              <FormControl>
                <Input
                  placeholder="Required access code for private elections"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};

export default ElectionDetailsTab;
