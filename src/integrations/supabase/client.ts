// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://bugjwqjetdptocipxede.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1Z2p3cWpldGRwdG9jaXB4ZWRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NTU5NjIsImV4cCI6MjA2MjAzMTk2Mn0.3fkxNQRLw07QHO6JFrLdv8Eppj5NCYekyfr_zsKxJj8";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);