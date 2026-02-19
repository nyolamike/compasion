import { createClient } from '@supabase/supabase-js';

// Initialize database client
// Use environment variables if available, otherwise fall back to defaults
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fifusnozzlusrsjwkepe.databasepad.com';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjM0N2NkOTMyLWM3MjktNDJiYS05NGViLTVlYzQyMmQ5OTkyNyJ9.eyJwcm9qZWN0SWQiOiJmaWZ1c25venpsdXNyc2p3a2VwZSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzY5NjAwNzM4LCJleHAiOjIwODQ5NjA3MzgsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.ECpF72q5ktT-qlE8MfEhl3Jr0LOdWBPZ4-rczpUFMjM';

const supabase = createClient(supabaseUrl, supabaseKey);

// Log which database we're connecting to (helpful for debugging)
console.log('🔌 Connecting to Supabase:', supabaseUrl);

export { supabase };