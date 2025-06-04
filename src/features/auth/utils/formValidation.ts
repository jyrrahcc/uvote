
interface FormErrors {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  general?: string;
}

interface FormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// University email domains that are allowed
const allowedDomains = [
  '@dlsud.edu.ph',
  '@gmail.com', // For testing purposes
  '@example.com' // For testing purposes
];

export const validateEmail = (email: string): string | undefined => {
  if (!email) return "Email is required";
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  
  // Check if email ends with allowed domain
  const isValidDomain = allowedDomains.some(domain => email.toLowerCase().endsWith(domain.toLowerCase()));
  if (!isValidDomain) {
    return `Please use a university email address (${allowedDomains.join(', ')})`;
  }
  
  return undefined;
};

export const validatePassword = (password: string): string | undefined => {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters long";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
  if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
  if (!/\d/.test(password)) return "Password must contain at least one number";
  return undefined;
};

export const validateName = (name: string, fieldName: string): string | undefined => {
  if (!name) return `${fieldName} is required`;
  if (name.length < 2) return `${fieldName} must be at least 2 characters long`;
  if (!/^[a-zA-Z\s'-]+$/.test(name)) return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`;
  return undefined;
};

export const validateForm = (formData: FormData, setErrors: (errors: FormErrors) => void): boolean => {
  const newErrors: FormErrors = {};

  newErrors.firstName = validateName(formData.firstName, "First name");
  newErrors.lastName = validateName(formData.lastName, "Last name");
  newErrors.email = validateEmail(formData.email);
  newErrors.password = validatePassword(formData.password);

  setErrors(newErrors);
  return !Object.values(newErrors).some(error => error !== undefined);
};
