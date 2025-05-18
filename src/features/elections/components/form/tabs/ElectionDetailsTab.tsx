
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "react-hook-form";
import { MultiSelector } from "@/components/ui/multi-selector";
import DateTimeInput from "@/components/ui/date-time-input";
import { Checkbox } from "@/components/ui/checkbox";

// Department/College choices
const DEPARTMENT_OPTIONS = [
  "University-wide",
  "College of Business Administration and Accountancy",
  "College of Education",
  "College of Engineering, Architecture and Technology",
  "College of Humanities, Arts and Social Sciences",
  "College of Science and Computer Studies",
  "College of Criminal Justice Education",
  "College of Tourism and Hospitality Management"
];

// Year level choices
const YEAR_LEVEL_OPTIONS = [
  "All Year Levels",
  "1st Year",
  "2nd Year",
  "3rd Year", 
  "4th Year",
  "5th Year"
];

export const ElectionDetailsTab = () => {
  const { control, watch } = useFormContext();
  const isPrivate = watch("isPrivate");

  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Election Title*</FormLabel>
            <FormControl>
              <Input placeholder="Example: Student Council Elections 2023" {...field} />
            </FormControl>
            <FormDescription>
              The official title of the election
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Provide details about the election"
                className="min-h-32 resize-none"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Additional information about this election (optional)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="colleges"
          render={({ field }) => (
            <FormItem>
              <FormLabel>College/Department</FormLabel>
              <FormControl>
                <MultiSelector 
                  placeholder="Select departments or all"
                  options={DEPARTMENT_OPTIONS.map(dept => ({
                    value: dept,
                    label: dept
                  }))}
                  value={field.value?.map(d => ({ value: d, label: d })) || []}
                  onChange={(options) => {
                    field.onChange(options.map(o => o.value));
                  }}
                />
              </FormControl>
              <FormDescription>
                Which colleges are eligible for this election
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="eligibleYearLevels"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Eligible Year Levels</FormLabel>
              <FormControl>
                <MultiSelector 
                  placeholder="Select year levels or all"
                  options={YEAR_LEVEL_OPTIONS.map(yr => ({
                    value: yr,
                    label: yr
                  }))}
                  value={field.value?.map(y => ({ value: y, label: y })) || []}
                  onChange={(options) => {
                    field.onChange(options.map(o => o.value));
                  }}
                />
              </FormControl>
              <FormDescription>
                Which year levels are eligible to vote
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={control}
        name="allowFaculty"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
              <FormLabel>Allow Faculty Participation</FormLabel>
              <FormDescription>
                Enable faculty members to participate in this election
              </FormDescription>
            </div>
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <div className="grid md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="candidacyStartDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Candidacy Start Date*</FormLabel>
              <FormControl>
                <DateTimeInput
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormDescription>
                When candidates can start applying
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="candidacyEndDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Candidacy End Date*</FormLabel>
              <FormControl>
                <DateTimeInput
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormDescription>
                Last day candidates can apply
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Voting Start Date*</FormLabel>
              <FormControl>
                <DateTimeInput
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormDescription>
                When voting opens
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="endDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Voting End Date*</FormLabel>
              <FormControl>
                <DateTimeInput
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormDescription>
                When voting closes
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="positions"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Positions*</FormLabel>
            <FormControl>
              <div className="flex gap-2 flex-wrap">
                <Input 
                  placeholder="Position 1, Position 2, Position 3..."
                  value={field.value.join(", ")}
                  onChange={(e) => {
                    const value = e.target.value;
                    const positions = value.split(",").map((item) => item.trim()).filter(Boolean);
                    field.onChange(positions);
                  }}
                />
              </div>
            </FormControl>
            <FormDescription>
              Enter positions separated by commas
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="isPrivate"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Private Election</FormLabel>
                <FormDescription>
                  Require access code for voters
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {isPrivate && (
          <FormField
            control={control}
            name="accessCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Access Code*</FormLabel>
                <FormControl>
                  <Input 
                    type="text" 
                    placeholder="Enter secret code for voters"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Required if election is private
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    </div>
  );
};
