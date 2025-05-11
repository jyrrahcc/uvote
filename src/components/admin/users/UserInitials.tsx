
import React from "react";

interface UserInitialsProps {
  firstName?: string;
  lastName?: string;
  email?: string;
}

const UserInitials: React.FC<UserInitialsProps> = ({ firstName, lastName, email }) => {
  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`;
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return "U";
  };

  return <>{getInitials()}</>;
};

export default UserInitials;
