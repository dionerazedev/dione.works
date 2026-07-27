import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

const isPlaceholder = (value?: string) => !value || value.includes('PASTE_') || value.endsWith('_HERE');

export const isCommunityConfigured = Boolean(!isPlaceholder(supabaseUrl) && !isPlaceholder(supabaseAnonKey));

let clientPromise: Promise<SupabaseClient | null> | null = null;

export const getSupabaseClient = () => {
  if (!isCommunityConfigured) return Promise.resolve(null);
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) => createClient(
      supabaseUrl as string,
      supabaseAnonKey as string,
      {
        auth: { persistSession: false, autoRefreshToken: false },
        realtime: { params: { eventsPerSecond: 4 } },
      },
    ));
  }
  return clientPromise;
};
