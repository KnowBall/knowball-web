-- Enable RLS on all tables
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "questions_admins" ON public.questions;
DROP POLICY IF EXISTS "questions_select" ON public.questions;
DROP POLICY IF EXISTS "scores_insert_own" ON public.scores;
DROP POLICY IF EXISTS "scores_select" ON public.scores;
DROP POLICY IF EXISTS "profiles_self" ON public.profiles;
DROP POLICY IF EXISTS "user_answers_self" ON public.user_answers;

-- Questions policies
CREATE POLICY "questions_admins" ON public.questions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "questions_select" ON public.questions
  FOR SELECT
  USING (true);

-- Scores policies
CREATE POLICY "scores_insert_own" ON public.scores
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "scores_select" ON public.scores
  FOR SELECT
  USING (true);

-- Profiles policies
CREATE POLICY "profiles_self" ON public.profiles
  FOR ALL
  USING (auth.uid() = id);

-- User answers policies
CREATE POLICY "user_answers_self" ON public.user_answers
  FOR ALL
  USING (auth.uid() = user_id);

-- Verify policies are in place
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname; 