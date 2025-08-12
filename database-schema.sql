-- Database schema for Live Blog + Video Grid application
-- Run this in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    passkey_registered BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    author TEXT NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Themes table
CREATE TABLE IF NOT EXISTS public.themes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    theme_data JSONB NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Videos table
CREATE TABLE IF NOT EXISTS public.videos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- YJS documents table for persistence
CREATE TABLE IF NOT EXISTS public.yjs_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    room_name TEXT UNIQUE NOT NULL,
    document_data BYTEA NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_user_id ON public.blog_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_themes_user_id ON public.themes(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON public.videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON public.videos(created_at);
CREATE INDEX IF NOT EXISTS idx_yjs_documents_room ON public.yjs_documents(room_name);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yjs_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view and edit their own profile
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Blog posts: authenticated users can view all, edit their own
CREATE POLICY "Authenticated users can view posts" ON public.blog_posts
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can edit own posts" ON public.blog_posts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can create posts" ON public.blog_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Themes: users can manage their own themes
CREATE POLICY "Users can view own themes" ON public.themes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own themes" ON public.themes
    FOR ALL USING (auth.uid() = user_id);

-- Videos: users can manage their own videos
CREATE POLICY "Users can view own videos" ON public.videos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own videos" ON public.videos
    FOR ALL USING (auth.uid() = user_id);

-- YJS documents: public read, authenticated write
CREATE POLICY "Anyone can read documents" ON public.yjs_documents
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can write documents" ON public.yjs_documents
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update documents" ON public.yjs_documents
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_themes_updated_at BEFORE UPDATE ON public.themes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON public.videos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default theme
INSERT INTO public.themes (user_id, name, theme_data, is_default)
VALUES (
    '00000000-0000-0000-0000-000000000000', -- Placeholder UUID
    'Default Theme',
    '{
        "name": "Default",
        "colors": {
            "primary": "#61dafb",
            "secondary": "#282c34",
            "background": "#ffffff",
            "text": "#000000",
            "accent": "#ff6b6b",
            "surface": "#f8f9fa",
            "border": "#dee2e6"
        },
        "fonts": {
            "heading": "Noto Sans",
            "body": "Noto Sans",
            "code": "Fira Code"
        },
        "spacing": {
            "xs": "0.25rem",
            "sm": "0.5rem",
            "md": "1rem",
            "lg": "1.5rem",
            "xl": "2rem",
            "xxl": "3rem"
        },
        "borderRadius": {
            "sm": "0.25rem",
            "md": "0.5rem",
            "lg": "1rem",
            "xl": "1.5rem"
        },
        "shadows": {
            "sm": "0 1px 3px rgba(0,0,0,0.12)",
            "md": "0 4px 6px rgba(0,0,0,0.1)",
            "lg": "0 10px 15px rgba(0,0,0,0.1)",
            "xl": "0 20px 25px rgba(0,0,0,0.15)"
        },
        "darkMode": false
    }'::jsonb,
    true
) ON CONFLICT DO NOTHING; 