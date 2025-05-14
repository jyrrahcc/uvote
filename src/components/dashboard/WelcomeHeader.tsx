
import React from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

type UserProfile = {
  first_name: string;
  last_name: string;
  email: string;
}

const WelcomeHeader: React.FC = () => {
  const { user } = useAuth();
  
  const { data: profile } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      return data as UserProfile;
    },
    enabled: !!user,
  });

  if (!user) return null;
  
  // Use first name if available, otherwise extract username from email
  const displayName = profile?.first_name || user.email?.split('@')[0] || 'User';
  
  // Get current time of day
  const hour = new Date().getHours();
  let greeting = 'Good morning';
  if (hour >= 12 && hour < 18) {
    greeting = 'Good afternoon';
  } else if (hour >= 18) {
    greeting = 'Good evening';
  }
  
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-1">{greeting}, {displayName}!</h1>
      <p className="text-muted-foreground">
        Here's what's happening with your elections today.
      </p>
    </div>
  );
};

export default WelcomeHeader;
