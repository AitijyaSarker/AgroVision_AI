-- Supabase PostgreSQL Schema for Agro Vision

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    role TEXT NOT NULL CHECK (role IN ('farmer', 'specialist')),
    name TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Farmer requests table
CREATE TABLE IF NOT EXISTS public.farmer_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    farmer_id UUID REFERENCES auth.users(id) NOT NULL,
    farmer_name TEXT,
    message TEXT NOT NULL,
    crop_issue TEXT,
    location TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'resolved', 'ignored')),
    specialist_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    request_id UUID REFERENCES public.farmer_requests(id),
    sender_id UUID REFERENCES auth.users(id) NOT NULL,
    receiver_id UUID REFERENCES auth.users(id) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disease detection history
CREATE TABLE IF NOT EXISTS public.detection_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    image_url TEXT,
    crop_type TEXT,
    disease_name TEXT,
    confidence DECIMAL(5,2),
    solution TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detection_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Farmers can create requests
CREATE POLICY "Farmers can create requests" ON public.farmer_requests
    FOR INSERT WITH CHECK (auth.uid() = farmer_id);

-- Farmers can view their own requests
CREATE POLICY "Farmers can view own requests" ON public.farmer_requests
    FOR SELECT USING (auth.uid() = farmer_id OR auth.uid() = specialist_id);

-- Specialists can view pending requests
CREATE POLICY "Specialists can view pending requests" ON public.farmer_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'specialist'
        )
    );

-- Specialists can update requests
CREATE POLICY "Specialists can update requests" ON public.farmer_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'specialist'
        )
    );

-- Users can send messages in their chats
CREATE POLICY "Users can send messages" ON public.chat_messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Users can view messages in their chats
CREATE POLICY "Users can view own messages" ON public.chat_messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can view their detection history
CREATE POLICY "Users can view own history" ON public.detection_history
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create their detection history
CREATE POLICY "Users can create history" ON public.detection_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_farmer_requests_farmer_id ON public.farmer_requests(farmer_id);
CREATE INDEX IF NOT EXISTS idx_farmer_requests_status ON public.farmer_requests(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_request_id ON public.chat_messages(request_id);
CREATE INDEX IF NOT EXISTS idx_detection_history_user_id ON public.detection_history(user_id);


