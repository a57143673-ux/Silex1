-- ==========================================
-- Schema for Merchant Dashboard (Tasko Platform)
-- ==========================================

-- 1. جدول المخازن والمنتجات (Products & Inventory)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC(10, 2) DEFAULT 0 NOT NULL,
    stock INT DEFAULT 0 NOT NULL,
    status TEXT CHECK (status IN ('متوفر', 'منخفض', 'نفاذ', 'استلام')) DEFAULT 'متوفر',
    image_url TEXT
);

-- 2. جدول دفتر الديون (Debts Management)
CREATE TABLE IF NOT EXISTS public.debts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    customer_name TEXT NOT NULL,
    phone TEXT,
    amount NUMERIC(10, 2) DEFAULT 0 NOT NULL,
    due_date DATE NOT NULL,
    status TEXT CHECK (status IN ('ضمن المدة', 'متأخر', 'تم تحصيله')) DEFAULT 'ضمن المدة'
);

-- 3. جدول الإعدادات والتنبيهات (Store Settings)
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    debt_notifications BOOLEAN DEFAULT true,
    inventory_notifications BOOLEAN DEFAULT true,
    order_notifications BOOLEAN DEFAULT false,
    weekly_reports BOOLEAN DEFAULT false,
    dark_mode BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. إعداد حاوية الصور (Supabase Storage Bucket for Products)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- سياسات الوصول للصورة (Storage Security Policies)
CREATE POLICY "Public Read Images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Authenticated Upload Images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "Authenticated Update Images" ON storage.objects FOR UPDATE WITH CHECK (bucket_id = 'product-images');

-- جدول الحملات الإعلانية والترويج
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    template_type TEXT NOT NULL,
    message_body TEXT NOT NULL,
    image_url TEXT,
    target_count INT DEFAULT 0,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'completed')) DEFAULT 'pending',
    rejection_reason TEXT
);

-- 1. جدول المحادثات مع الزبائن
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone_or_id TEXT NOT NULL,
    platform TEXT CHECK (platform IN ('whatsapp', 'facebook', 'instagram', 'web')) DEFAULT 'whatsapp',
    auto_reply_enabled BOOLEAN DEFAULT true,
    last_message TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. جدول سجل الرسائل
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender TEXT CHECK (sender IN ('customer', 'ai', 'human')) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. تفعيل الاستماع الفوري للرسائل (Supabase Realtime)
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

