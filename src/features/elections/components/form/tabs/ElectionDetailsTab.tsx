
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  DLSU_DEPARTMENTS, 
  YEAR_LEVELS 
} from "@/features/elections/types/electionFormTypes";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFormContext } from "react-hook-form";

export function ElectionDetailsTab() {
  // Get form from context
  const form = useFormContext();
  
  return (
    <div className="space-y-4 py-4">
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
            <FormLabel>Colleges</FormLabel>
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
                                return checked
                                  ? field.onChange([...field.value, department])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value: string) => value !== department
                                      )
                                    );
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
            <FormLabel>Year Levels</FormLabel>
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
                                return checked
                                  ? field.onChange([...field.value, yearLevel])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value: string) => value !== yearLevel
                                      )
                                    );
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
      
      <FormField
        control={form.control}
        name="restrictVoting"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-2 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Restrict Voting</FormLabel>
              <p className="text-sm text-muted-foreground">
                Only selected users from the selected colleges and year levels can vote in this election
              </p>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
}
