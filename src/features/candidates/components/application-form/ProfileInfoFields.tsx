
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ProfileInfoFieldsProps {
  name: string;
  setName: (name: string) => void;
  userProfile: {
    student_id?: string;
    department?: string;
    year_level?: string;
  } | null;
}

const ProfileInfoFields = ({ 
  name, 
  setName, 
  userProfile 
}: ProfileInfoFieldsProps) => {
  return (
    <>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">
          Name
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="col-span-3"
          required
        />
      </div>
      
      {userProfile && userProfile.student_id && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="student_id" className="text-right">
            Student ID
          </Label>
          <Input
            id="student_id"
            value={userProfile.student_id}
            readOnly
            className="col-span-3 bg-muted"
          />
        </div>
      )}
      
      {userProfile && userProfile.department && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="department" className="text-right">
            Department
          </Label>
          <Input
            id="department"
            value={userProfile.department}
            readOnly
            className="col-span-3 bg-muted"
          />
        </div>
      )}
      
      {userProfile && userProfile.year_level && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="year_level" className="text-right">
            Year Level
          </Label>
          <Input
            id="year_level"
            value={userProfile.year_level}
            readOnly
            className="col-span-3 bg-muted"
          />
        </div>
      )}
    </>
  );
};

export default ProfileInfoFields;
