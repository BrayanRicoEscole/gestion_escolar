import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = 'https://gzdiljudmdezdkntnhml.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZGlsanVkbWRlemRrbnRuaG1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MzQ5OTEsImV4cCI6MjA4NTExMDk5MX0.Ui20tkVIXRslewslnM7vzDKkftdpxLnFBZn3KzoOue0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  db: {
    schema: 'api'
  }
});