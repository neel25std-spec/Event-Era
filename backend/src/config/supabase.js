import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn(
    '⚠️  SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set — running in mock mode'
  );
}

/**
 * Server-side Supabase client using the service-role key.
 * This bypasses RLS so the backend can perform any DB operation.
 */
const supabase =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

export default supabase;
