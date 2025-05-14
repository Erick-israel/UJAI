
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wfgxuujyetiwyugxluaj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmZ3h1dWp5ZXRpd3l1Z3hsdWFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwMzQwODMsImV4cCI6MjA2MjYxMDA4M30.lfiHmM1KHeaQjO9Q5IP6y5Jl_voQQnhSycODg4Ae7es';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
