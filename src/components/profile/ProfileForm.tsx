import React from 'react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl?: string;
  studentId?: string;
  department?: string;
  yearLevel?: string;
  isFaculty?: boolean;
  facultyPosition?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProfileFormProps {
  profile: Profile | null;
  onUpdateProfile: (data: Profile) => void;
  loading: boolean;
}

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  studentId: z.string().optional(),
  department: z.string().optional(),
  yearLevel: z.string().optional(),
  isFaculty: z.boolean().default(false).optional(),
  facultyPosition: z.string().optional(),
});

const ProfileForm = ({ profile, onUpdateProfile, loading }: ProfileFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      email: profile?.email || "",
      studentId: profile?.studentId || "",
      department: profile?.department || "",
      yearLevel: profile?.yearLevel || "",
      isFaculty: profile?.isFaculty || false,
      facultyPosition: profile?.facultyPosition || '',
    },
    mode: "onChange",
  })

  const isFaculty = profile?.isFaculty || false;
  const facultyPosition = profile?.facultyPosition || '';

  function onSubmit(values: z.infer<typeof formSchema>) {
    onUpdateProfile({
      ...profile,
      ...values,
    } as Profile);
  }

  return (
    <div className="profile-form">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First name</FormLabel>
                <FormControl>
                  <Input placeholder="First name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last name</FormLabel>
                <FormControl>
                  <Input placeholder="Last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="studentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Student ID</FormLabel>
                <FormControl>
                  <Input placeholder="Student ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <FormControl>
                  <Input placeholder="Department" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="yearLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year Level</FormLabel>
                <FormControl>
                  <Input placeholder="Year Level" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isFaculty"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Is Faculty</FormLabel>
                  <FormDescription>
                    Enable this if you are a faculty member.
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
          {isFaculty && (
            <FormField
              control={form.control}
              name="facultyPosition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Faculty Position</FormLabel>
                  <FormControl>
                    <Input placeholder="Faculty Position" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <Button type="submit" disabled={loading}>Update Profile</Button>
        </form>
      </Form>
      <p className="text-xs text-muted-foreground mt-4">
        Account created on {profile?.createdAt ? format(new Date(profile.createdAt), 'PPP') : ''}
      </p>
    </div>
  );
};

export default ProfileForm;
