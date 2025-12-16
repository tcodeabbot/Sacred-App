-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROFILES TABLE
-- Extends the auth.users table with additional user information
-- ============================================================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- USER SETTINGS TABLE
-- Stores user preferences and configuration
-- ============================================================================
CREATE TABLE public.user_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  pause_duration INTEGER DEFAULT 5,
  daily_goal INTEGER DEFAULT 3,
  frequency TEXT DEFAULT 'once' CHECK (frequency IN ('once', 'few', 'every')),
  prayer_style TEXT DEFAULT 'scripture' CHECK (prayer_style IN ('scripture', 'guided', 'silent')),
  notifications_enabled BOOLEAN DEFAULT TRUE,
  grace_days_enabled BOOLEAN DEFAULT TRUE,
  max_grace_days INTEGER DEFAULT 7,
  max_consecutive_grace_days INTEGER DEFAULT 2,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- USER STATS TABLE
-- Tracks user streaks and prayer statistics
-- ============================================================================
CREATE TABLE public.user_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  total_prayers INTEGER DEFAULT 0,
  total_minutes INTEGER DEFAULT 0,
  weekly_prayers INTEGER[] DEFAULT ARRAY[0,0,0,0,0,0,0],
  grace_days_used TIMESTAMPTZ[] DEFAULT ARRAY[]::TIMESTAMPTZ[],
  consecutive_grace_days INTEGER DEFAULT 0,
  last_prayer_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stats"
  ON public.user_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
  ON public.user_stats FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats"
  ON public.user_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- PRAYER SESSIONS TABLE
-- Records of all prayer sessions
-- ============================================================================
CREATE TABLE public.prayer_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  duration INTEGER NOT NULL,
  triggered_by TEXT,
  completed BOOLEAN DEFAULT FALSE,
  mode TEXT CHECK (mode IN ('silent', 'scripture', 'written')),
  journal_entry TEXT,
  intent TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_prayer_sessions_user_id ON public.prayer_sessions(user_id);
CREATE INDEX idx_prayer_sessions_started_at ON public.prayer_sessions(started_at);

ALTER TABLE public.prayer_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own prayer sessions"
  ON public.prayer_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prayer sessions"
  ON public.prayer_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prayer sessions"
  ON public.prayer_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prayer sessions"
  ON public.prayer_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- BLOCKED APPS TABLE
-- User's list of apps they want to block/pause when triggered
-- ============================================================================
CREATE TABLE public.blocked_apps (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  app_id TEXT NOT NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  gradient TEXT[] NOT NULL,
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, app_id)
);

CREATE INDEX idx_blocked_apps_user_id ON public.blocked_apps(user_id);

ALTER TABLE public.blocked_apps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own blocked apps"
  ON public.blocked_apps FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own blocked apps"
  ON public.blocked_apps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own blocked apps"
  ON public.blocked_apps FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own blocked apps"
  ON public.blocked_apps FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- SCRIPTURE REFLECTIONS TABLE
-- User's saved reflections on scriptures
-- ============================================================================
CREATE TABLE public.scripture_reflections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scripture_id TEXT NOT NULL,
  text TEXT NOT NULL,
  reference TEXT NOT NULL,
  reflection TEXT NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scripture_reflections_user_id ON public.scripture_reflections(user_id);
CREATE INDEX idx_scripture_reflections_created_at ON public.scripture_reflections(created_at DESC);

ALTER TABLE public.scripture_reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reflections"
  ON public.scripture_reflections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reflections"
  ON public.scripture_reflections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reflections"
  ON public.scripture_reflections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reflections"
  ON public.scripture_reflections FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to handle new user creation
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

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile, settings, and stats when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to relevant tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON public.user_stats
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blocked_apps_updated_at
  BEFORE UPDATE ON public.blocked_apps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scripture_reflections_updated_at
  BEFORE UPDATE ON public.scripture_reflections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to update user stats after completing a prayer
CREATE OR REPLACE FUNCTION public.update_stats_after_prayer(
  p_user_id UUID,
  p_duration INTEGER,
  p_completed_at TIMESTAMPTZ
)
RETURNS void AS $$
DECLARE
  v_last_prayer_date DATE;
  v_current_date DATE;
  v_day_diff INTEGER;
  v_current_streak INTEGER;
  v_day_of_week INTEGER;
BEGIN
  -- Get current date
  v_current_date := p_completed_at::DATE;

  -- Get last prayer date and current streak
  SELECT last_prayer_date, current_streak
  INTO v_last_prayer_date, v_current_streak
  FROM public.user_stats
  WHERE user_id = p_user_id;

  -- Calculate day difference
  IF v_last_prayer_date IS NOT NULL THEN
    v_day_diff := v_current_date - v_last_prayer_date;
  ELSE
    v_day_diff := 0;
  END IF;

  -- Update streak logic
  IF v_day_diff = 1 THEN
    -- Consecutive day, increment streak
    v_current_streak := v_current_streak + 1;
  ELSIF v_day_diff = 0 THEN
    -- Same day, keep streak
    v_current_streak := v_current_streak;
  ELSE
    -- Streak broken, reset to 1
    v_current_streak := 1;
  END IF;

  -- Get day of week (0 = Sunday, 6 = Saturday)
  v_day_of_week := EXTRACT(DOW FROM p_completed_at);

  -- Update stats
  UPDATE public.user_stats
  SET
    total_prayers = total_prayers + 1,
    total_minutes = total_minutes + p_duration,
    current_streak = v_current_streak,
    longest_streak = GREATEST(longest_streak, v_current_streak),
    best_streak = GREATEST(best_streak, v_current_streak),
    last_prayer_date = v_current_date,
    weekly_prayers[v_day_of_week + 1] = weekly_prayers[v_day_of_week + 1] + 1,
    consecutive_grace_days = 0,
    updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
