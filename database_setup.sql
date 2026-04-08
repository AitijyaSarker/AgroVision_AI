-- Supabase Database Setup for AgroVision (Updated - Safe to Run Multiple Times)
-- Run these SQL commands in your Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own scans" ON scans;
DROP POLICY IF EXISTS "Users can insert own scans" ON scans;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can insert messages" ON messages;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_profiles_updated_at ON profiles;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_updated_at();

-- Create profiles table (drop if exists and recreate)
DROP TABLE IF EXISTS profiles CASCADE;
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('farmer', 'specialist')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- TEMPORARILY DISABLE RLS FOR TESTING (remove this after fixing)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view specialists" ON profiles
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    role = 'specialist'
  );

CREATE POLICY "Authenticated users can view farmers" ON profiles
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    role = 'farmer'
  );
-- Also allow authenticated users to view all profiles (simpler approach)
CREATE POLICY "Allow authenticated users to view all profiles" ON profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Temporarily allow all authenticated users to insert profiles (for testing)
CREATE POLICY "Allow profile creation for authenticated users" ON profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow service role to insert/update profiles (for triggers)
CREATE POLICY "Enable insert for service role" ON profiles
  FOR ALL USING (auth.role() = 'service_role');

-- Allow authenticated users to update their own profile
CREATE POLICY "Enable update for authenticated users only" ON profiles
  FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = id);

-- Create scans table (drop if exists and recreate)
DROP TABLE IF EXISTS scans CASCADE;
CREATE TABLE scans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  crop_name TEXT,
  disease_name TEXT,
  confidence DECIMAL,
  result_json JSONB,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for scans
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

-- Policies for scans
CREATE POLICY "Users can view own scans" ON scans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scans" ON scans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create messages table (drop if exists and recreate)
DROP TABLE IF EXISTS messages CASCADE;
CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies for messages (simplified for now - you can adjust based on your conversation logic)
CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT USING (
    auth.uid() = sender_id OR 
    conversation_id LIKE auth.uid() || '-%' OR 
    conversation_id LIKE '%-' || auth.uid()
  );

CREATE POLICY "Users can insert messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Create function to handle user profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
  user_role TEXT;
  user_email TEXT;
BEGIN
  -- Extract data from metadata or use defaults
  user_name := COALESCE(NEW.raw_user_meta_data->>'name', NEW.user_metadata->>'name', '');
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', NEW.user_metadata->>'role', 'farmer');
  user_email := COALESCE(NEW.email, '');

  -- Log for debugging (you can remove this later)
  RAISE LOG 'Creating profile for user %: name=%, role=%, email=%', NEW.id, user_name, user_role, user_email;

  -- Insert or update profile
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (NEW.id, user_name, user_email, user_role)
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    updated_at = NOW();

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log any errors but don't fail the signup
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profiles updated_at
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Insert test specialists (run this manually after setup)
-- Note: Replace the UUIDs with actual user IDs after registering specialist accounts
-- INSERT INTO profiles (id, name, email, role) VALUES
--   ('specialist-user-id-1', 'Dr. Mohammad Rahman', 'rahman@bari.gov.bd', 'specialist'),
--   ('specialist-user-id-2', 'Dr. Fatima Khan', 'khan@bari.gov.bd', 'specialist'),
--   ('specialist-user-id-3', 'Dr. Abdul Karim', 'karim@bari.gov.bd', 'specialist');