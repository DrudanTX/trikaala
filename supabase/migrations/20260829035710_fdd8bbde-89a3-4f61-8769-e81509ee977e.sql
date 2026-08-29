-- Shared updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Sandhya session enums
CREATE TYPE public.sandhya_kind AS ENUM ('pratah', 'madhyahnikam', 'sayam');
CREATE TYPE public.sandhya_status AS ENUM ('completed', 'acknowledged');

-- 1. profiles -----------------------------------------------------------
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles
  FOR DELETE TO authenticated USING (auth.uid() = id);

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. user_settings ------------------------------------------------------
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location_label TEXT,
  reminders_enabled BOOLEAN NOT NULL DEFAULT false,
  reminder_pratah BOOLEAN NOT NULL DEFAULT true,
  reminder_madhyahnikam BOOLEAN NOT NULL DEFAULT true,
  reminder_sayam BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT user_settings_user_unique UNIQUE (user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_settings TO authenticated;
GRANT ALL ON public.user_settings TO service_role;

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_settings_select_own" ON public.user_settings
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_settings_insert_own" ON public.user_settings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_settings_update_own" ON public.user_settings
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_settings_delete_own" ON public.user_settings
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER user_settings_set_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. sandhya_sessions ---------------------------------------------------
CREATE TABLE public.sandhya_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  practice_date DATE NOT NULL,
  sandhya public.sandhya_kind NOT NULL,
  status public.sandhya_status NOT NULL DEFAULT 'completed',
  gayatri_count INTEGER NOT NULL DEFAULT 0 CHECK (gayatri_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT sandhya_sessions_unique_per_day UNIQUE (user_id, practice_date, sandhya)
);

CREATE INDEX sandhya_sessions_user_date_idx
  ON public.sandhya_sessions (user_id, practice_date DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sandhya_sessions TO authenticated;
GRANT ALL ON public.sandhya_sessions TO service_role;

ALTER TABLE public.sandhya_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sandhya_sessions_select_own" ON public.sandhya_sessions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "sandhya_sessions_insert_own" ON public.sandhya_sessions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sandhya_sessions_update_own" ON public.sandhya_sessions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sandhya_sessions_delete_own" ON public.sandhya_sessions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER sandhya_sessions_set_updated_at
  BEFORE UPDATE ON public.sandhya_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. japa_sessions ------------------------------------------------------
CREATE TABLE public.japa_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  practice_date DATE NOT NULL,
  target_count INTEGER NOT NULL CHECK (target_count > 0),
  completed_count INTEGER NOT NULL DEFAULT 0 CHECK (completed_count >= 0),
  reached_target BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX japa_sessions_user_date_idx
  ON public.japa_sessions (user_id, practice_date DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.japa_sessions TO authenticated;
GRANT ALL ON public.japa_sessions TO service_role;

ALTER TABLE public.japa_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "japa_sessions_select_own" ON public.japa_sessions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "japa_sessions_insert_own" ON public.japa_sessions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "japa_sessions_update_own" ON public.japa_sessions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "japa_sessions_delete_own" ON public.japa_sessions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER japa_sessions_set_updated_at
  BEFORE UPDATE ON public.japa_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();