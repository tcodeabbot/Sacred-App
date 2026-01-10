-- ============================================================================
-- PRAYERS AND COLLECTIONS TABLES
-- User's custom prayers with collection organization
-- ============================================================================

-- Create prayer_collections table
CREATE TABLE public.prayer_collections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT 'teal', -- gradient color key: teal, purple, amber, blue, pink
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for prayer_collections
CREATE INDEX idx_prayer_collections_user_id ON public.prayer_collections(user_id);
CREATE INDEX idx_prayer_collections_sort_order ON public.prayer_collections(sort_order);

-- Enable RLS for prayer_collections
ALTER TABLE public.prayer_collections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for prayer_collections
CREATE POLICY "Users can view own prayer collections"
  ON public.prayer_collections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prayer collections"
  ON public.prayer_collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prayer collections"
  ON public.prayer_collections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prayer collections"
  ON public.prayer_collections FOR DELETE
  USING (auth.uid() = user_id);

-- Add updated_at trigger for prayer_collections
CREATE TRIGGER update_prayer_collections_updated_at
  BEFORE UPDATE ON public.prayer_collections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- PRAYERS TABLE
-- ============================================================================

CREATE TABLE public.prayers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  collection_id UUID REFERENCES public.prayer_collections(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,        -- Short text shown on cards (~100 chars)
  full_text TEXT,               -- Complete prayer text shown during session
  is_favorite BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for prayers
CREATE INDEX idx_prayers_user_id ON public.prayers(user_id);
CREATE INDEX idx_prayers_collection_id ON public.prayers(collection_id);
CREATE INDEX idx_prayers_is_favorite ON public.prayers(is_favorite);
CREATE INDEX idx_prayers_sort_order ON public.prayers(sort_order);

-- Enable RLS for prayers
ALTER TABLE public.prayers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for prayers
CREATE POLICY "Users can view own prayers"
  ON public.prayers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prayers"
  ON public.prayers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prayers"
  ON public.prayers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prayers"
  ON public.prayers FOR DELETE
  USING (auth.uid() = user_id);

-- Add updated_at trigger for prayers
CREATE TRIGGER update_prayers_updated_at
  BEFORE UPDATE ON public.prayers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- UPDATE PRAYER_SCHEDULE TABLE
-- Add reference to selected prayer for sessions
-- ============================================================================

ALTER TABLE public.prayer_schedule 
ADD COLUMN selected_prayer_id UUID REFERENCES public.prayers(id) ON DELETE SET NULL;

-- Create index for the new column
CREATE INDEX idx_prayer_schedule_selected_prayer_id ON public.prayer_schedule(selected_prayer_id);

-- ============================================================================
-- SEED DEFAULT PRAYERS FOR NEW USERS
-- Update handle_new_user function to include starter prayers
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  morning_collection_id UUID;
  evening_collection_id UUID;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );

  -- Create default settings
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);

  -- Create initial stats
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);

  -- Create default prayer schedule
  INSERT INTO public.prayer_schedule (user_id, name, time, duration, enabled, sort_order)
  VALUES
    (NEW.id, 'Morning Prayer', '07:00', 5, true, 1),
    (NEW.id, 'Noon Prayer', '12:00', 5, true, 2),
    (NEW.id, 'Evening Prayer', '18:00', 5, true, 3),
    (NEW.id, 'Night Prayer', '21:00', 5, true, 4);

  -- Create default prayer collections
  INSERT INTO public.prayer_collections (user_id, name, description, color, sort_order)
  VALUES (NEW.id, 'Morning', 'Prayers to start the day', 'amber', 1)
  RETURNING id INTO morning_collection_id;

  INSERT INTO public.prayer_collections (user_id, name, description, color, sort_order)
  VALUES (NEW.id, 'Evening', 'Prayers for reflection and rest', 'purple', 2)
  RETURNING id INTO evening_collection_id;

  -- Create starter prayers
  INSERT INTO public.prayers (user_id, collection_id, title, excerpt, full_text, sort_order)
  VALUES
    (
      NEW.id,
      morning_collection_id,
      'Morning Offering',
      'Lord, I offer you this day...',
      'Lord, I offer you this day, all my prayers, works, joys, and sufferings. Bless my efforts and guide my steps. Fill me with your peace and help me to be a light to others. Amen.',
      1
    ),
    (
      NEW.id,
      morning_collection_id,
      'Daily Surrender',
      'Father, I surrender my plans to you...',
      'Father, I surrender my plans to you. Take control of my day and lead me where you want me to go. Help me to trust in your timing and your wisdom. I release my worries into your hands. Amen.',
      2
    ),
    (
      NEW.id,
      evening_collection_id,
      'Evening Reflection',
      'Thank you Lord for this day...',
      'Thank you Lord for this day. For every blessing seen and unseen, I give you thanks. Forgive me where I have fallen short. Grant me restful sleep and renew my strength for tomorrow. Amen.',
      1
    ),
    (
      NEW.id,
      NULL,
      'Prayer for Peace',
      'Lord, grant me your peace...',
      'Lord, grant me your peace that surpasses all understanding. Calm my anxious heart and quiet my racing thoughts. Help me to rest in your presence and trust in your love. Fill me with your Spirit. Amen.',
      1
    );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
