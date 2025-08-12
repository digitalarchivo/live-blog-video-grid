import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database table names
export const TABLES = {
  USERS: 'users',
  BLOG_POSTS: 'blog_posts',
  THEMES: 'themes',
  TWITTER_STREAMS: 'twitter_streams',
  YJS_DOCS: 'yjs_documents'
};

// RLS policies will be set up in Supabase dashboard
export const POLICIES = {
  USERS: {
    SELECT: 'users can view their own profile',
    UPDATE: 'users can update their own profile',
    INSERT: 'users can create their own profile'
  },
  BLOG_POSTS: {
    SELECT: 'authenticated users can view all posts',
    UPDATE: 'authenticated users can update posts',
    INSERT: 'authenticated users can create posts'
  },
  THEMES: {
    SELECT: 'authenticated users can view themes',
    UPDATE: 'authenticated users can update themes',
    INSERT: 'authenticated users can create themes'
  }
}; 