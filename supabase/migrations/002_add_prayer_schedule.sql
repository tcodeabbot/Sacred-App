-- ============================================================================
-- PRAYER SCHEDULE TABLE
-- User's custom prayer schedule with times and names
-- ============================================================================
CREATE TABLE public.prayer_schedule (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  time TEXT NOT NULL, -- Format: "HH:mm" (24-hour)
  enabled BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_prayer_schedule_user_id ON public.prayer_schedule(user_id);
CREATE INDEX idx_prayer_schedule_enabled ON public.prayer_schedule(enabled);
CREATE INDEX idx_prayer_schedule_sort_order ON public.prayer_schedule(sort_order);

-- Enable Row Level Security
ALTER TABLE public.prayer_schedule ENABLE ROW LEVEL SECURITY;

-- Policies for prayer schedule
CREATE POLICY "Users can view own prayer schedule"
  ON public.prayer_schedule FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prayer schedule"
  ON public.prayer_schedule FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prayer schedule"
  ON public.prayer_schedule FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prayer schedule"
  ON public.prayer_schedule FOR DELETE
  USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_prayer_schedule_updated_at
  BEFORE UPDATE ON public.prayer_schedule
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- UPDATE HANDLE_NEW_USER FUNCTION
-- Add default prayer schedule when a new user signs up
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
  INSERT INTO public.prayer_schedule (user_id, name, time, enabled, sort_order)
  VALUES
    (NEW.id, 'Morning Prayer', '07:00', true, 1),
    (NEW.id, 'Noon Prayer', '12:00', true, 2),
    (NEW.id, 'Evening Prayer', '18:00', true, 3),
    (NEW.id, 'Night Prayer', '21:00', true, 4);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
