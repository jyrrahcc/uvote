
export interface Developer {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  image_url: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  email: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeveloperForm {
  name: string;
  role: string;
  bio: string;
  image_url: string;
  github_url: string;
  linkedin_url: string;
  twitter_url: string;
  email: string;
  display_order: number;
  is_active: boolean;
}

export const initialForm: DeveloperForm = {
  name: '',
  role: '',
  bio: '',
  image_url: '',
  github_url: '',
  linkedin_url: '',
  twitter_url: '',
  email: '',
  display_order: 0,
  is_active: true,
};
