-- Migration script: Convert twitter_streams to videos table
-- Run this in your Supabase SQL editor after backing up your data

-- 1. Create the new videos table
CREATE TABLE IF NOT EXISTS public.videos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes for the new table
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON public.videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON public.videos(created_at);

-- 3. Enable RLS on the new table
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for videos
CREATE POLICY "Users can view own videos" ON public.videos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own videos" ON public.videos
    FOR ALL USING (auth.uid() = user_id);

-- 5. Create trigger for updated_at
CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON public.videos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Update blog_posts table to support images
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS description TEXT;

-- 7. Optional: Migrate existing data from twitter_streams (if you want to keep it)
-- INSERT INTO public.videos (user_id, title, description, video_url, created_at, updated_at)
-- SELECT 
--     user_id,
--     title,
--     description,
--     COALESCE(twitter_url, 'https://example.com/video') as video_url,
--     created_at,
--     updated_at
-- FROM public.twitter_streams
-- WHERE twitter_url IS NOT NULL AND twitter_url != '';

-- 8. Optional: Drop the old table (only after confirming migration worked)
-- DROP TABLE IF EXISTS public.twitter_streams;

-- Note: Run the migration steps one by one and test before dropping the old table 