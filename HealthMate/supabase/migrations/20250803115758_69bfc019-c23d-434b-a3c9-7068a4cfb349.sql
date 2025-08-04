-- Enable the required extensions for enhanced functionality
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create a table to store symptom analysis results for user history (optional)
CREATE TABLE IF NOT EXISTS public.symptom_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  symptoms TEXT NOT NULL,
  analysis_result JSONB NOT NULL,
  location_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on the symptom analyses table
ALTER TABLE public.symptom_analyses ENABLE ROW LEVEL SECURITY;

-- Create policies for symptom analyses (if users want to save their history)
CREATE POLICY "Users can view their own symptom analyses" 
ON public.symptom_analyses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own symptom analyses" 
ON public.symptom_analyses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;