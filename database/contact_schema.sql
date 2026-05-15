-- Contact Messages Table for Supabase
-- Run this in Supabase SQL Editor if you want to store contact form submissions

CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    mobile TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for contact form)
CREATE POLICY "Anyone can submit contact form" ON public.contact_messages
    FOR INSERT WITH CHECK (true);

-- Only admins can view (you can modify this)
CREATE POLICY "Admins can view contact messages" ON public.contact_messages
    FOR SELECT USING (false); -- Set to true for admin users

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON public.contact_messages(created_at);


