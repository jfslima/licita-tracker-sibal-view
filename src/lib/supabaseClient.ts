import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://ngcfavdkmlfjvcqjqftj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nY2ZhdmRrbWxmanZjcWpxZnRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzQxMzksImV4cCI6MjA2NjgxMDEzOX0.Irns4W6pG_2jU5QayXxE7eaANJuP9vhZbaCgkOJZq50',
  {
    auth: { persistSession: true },
    realtime: { params: { eventsPerSecond: 10 } } // opcional
  }
);
