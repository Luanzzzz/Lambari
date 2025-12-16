import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hyjdhwkteereiwhnvrwj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5amRod2t0ZWVyZWl3aG52cndqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4OTAyMjcsImV4cCI6MjA4MTQ2NjIyN30.o1A5nYS-aBC02WqCqUKblJyGX2ynP13OhcE_OZwh0HY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
