-- NewsShield_AI Supabase Database Schema
-- Complies with PRD Section 21 & Section 27

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Analyses Table
CREATE TABLE IF NOT EXISTS public.analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    input_type TEXT DEFAULT 'text' CHECK (input_type IN ('text', 'url')),
    news_text TEXT NOT NULL,
    url TEXT,
    prediction TEXT NOT NULL CHECK (prediction IN ('Likely Real', 'Likely Fake')),
    confidence NUMERIC(4, 2) NOT NULL,
    model_name TEXT NOT NULL,
    model_version TEXT NOT NULL,
    evidence_status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Evidence Table
CREATE TABLE IF NOT EXISTS public.evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID REFERENCES public.analyses(id) ON DELETE CASCADE NOT NULL,
    source_name TEXT NOT NULL,
    source_url TEXT NOT NULL,
    title TEXT,
    snippet TEXT,
    evidence_type TEXT CHECK (evidence_type IN ('Supporting', 'Contradicting', 'Mixed', 'Neutral / Contextual')),
    retrieved_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Feedback Table
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID REFERENCES public.analyses(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Model Versions Table
CREATE TABLE IF NOT EXISTS public.model_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    version TEXT NOT NULL,
    dataset TEXT NOT NULL,
    metrics_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row-Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_versions ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Analyses Policies
CREATE POLICY "Users can view their own analyses" 
ON public.analyses FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert analyses" 
ON public.analyses FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Evidence Policies
CREATE POLICY "Users can view evidence of visible analyses" 
ON public.evidence FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.analyses 
    WHERE public.analyses.id = public.evidence.analysis_id 
    AND (public.analyses.user_id = auth.uid() OR public.analyses.user_id IS NULL)
));

CREATE POLICY "Users can insert evidence" 
ON public.evidence FOR INSERT 
WITH CHECK (true);

-- Feedback Policies
CREATE POLICY "Users can submit feedback" 
ON public.feedback FOR INSERT 
WITH CHECK (true);

-- Model Versions Policies (Public Read)
CREATE POLICY "Anyone can view model versions" 
ON public.model_versions FOR SELECT 
USING (true);
