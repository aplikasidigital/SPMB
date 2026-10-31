-- ====================================================================
-- SKRIP SQL SKEMA DATABASE SUPABASE SPMB SMK LENTERA BANGSA 2
-- Jalankan skrip ini di SQL Editor dashboard Supabase Anda:
-- https://supabase.com/dashboard/project/jxcjjyqswnvbjpelptig/sql
-- ====================================================================

-- 1. TABEL PENDAFTAR SISWA BARU (spmb_registrations)
CREATE TABLE IF NOT EXISTS public.spmb_registrations (
    id TEXT PRIMARY KEY,
    registration_number TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    nik TEXT,
    family_card_number TEXT,
    nisn TEXT,
    phone TEXT,
    email TEXT,
    wave TEXT DEFAULT 'Gelombang 1',
    major_first TEXT,
    major_second TEXT,
    status TEXT DEFAULT 'PENDING',
    status_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    data_payload JSONB NOT NULL
);

-- Index untuk pencarian cepat nomor pendaftaran, nama, dan status
CREATE INDEX IF NOT EXISTS idx_spmb_reg_number ON public.spmb_registrations(registration_number);
CREATE INDEX IF NOT EXISTS idx_spmb_full_name ON public.spmb_registrations(full_name);
CREATE INDEX IF NOT EXISTS idx_spmb_status ON public.spmb_registrations(status);
CREATE INDEX IF NOT EXISTS idx_spmb_wave ON public.spmb_registrations(wave);

-- 2. TABEL PENGATURAN SEKOLAH (spmb_settings)
CREATE TABLE IF NOT EXISTS public.spmb_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by TEXT DEFAULT 'Admin'
);

-- 3. TABEL PENGUMUMAN & INFORMASI PENTING (spmb_announcements)
CREATE TABLE IF NOT EXISTS public.spmb_announcements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'PENTING',
    content TEXT NOT NULL,
    image_url TEXT,
    published_date TEXT,
    author TEXT DEFAULT 'Panitia SPMB',
    is_pinned BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL GELOMBANG PENDAFTARAN (spmb_waves)
CREATE TABLE IF NOT EXISTS public.spmb_waves (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    start_date TEXT,
    end_date TEXT,
    start_time TEXT DEFAULT '08:00',
    end_time TEXT DEFAULT '23:59',
    is_active BOOLEAN DEFAULT TRUE,
    benefits TEXT,
    data_payload JSONB
);

-- ====================================================================
-- PENGATURAN KEAMANAN ROW LEVEL SECURITY (RLS) & PUBLIC ACCESS
-- ====================================================================

-- Aktifkan Row Level Security
ALTER TABLE public.spmb_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spmb_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spmb_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spmb_waves ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses Pendaftar (Publik & Anonim dapat Membaca dan Menyimpan Pendaftaran)
DROP POLICY IF EXISTS "Public can read registrants" ON public.spmb_registrations;
CREATE POLICY "Public can read registrants" ON public.spmb_registrations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert registrants" ON public.spmb_registrations;
CREATE POLICY "Public can insert registrants" ON public.spmb_registrations FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update registrants" ON public.spmb_registrations;
CREATE POLICY "Public can update registrants" ON public.spmb_registrations FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can delete registrants" ON public.spmb_registrations;
CREATE POLICY "Public can delete registrants" ON public.spmb_registrations FOR DELETE USING (true);

-- Kebijakan Akses Pengaturan Sekolah
DROP POLICY IF EXISTS "Public can read settings" ON public.spmb_settings;
CREATE POLICY "Public can read settings" ON public.spmb_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can upsert settings" ON public.spmb_settings;
CREATE POLICY "Public can upsert settings" ON public.spmb_settings FOR ALL USING (true) WITH CHECK (true);

-- Kebijakan Akses Pengumuman
DROP POLICY IF EXISTS "Public can read announcements" ON public.spmb_announcements;
CREATE POLICY "Public can read announcements" ON public.spmb_announcements FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can modify announcements" ON public.spmb_announcements;
CREATE POLICY "Public can modify announcements" ON public.spmb_announcements FOR ALL USING (true) WITH CHECK (true);

-- Kebijakan Akses Gelombang
DROP POLICY IF EXISTS "Public can read waves" ON public.spmb_waves;
CREATE POLICY "Public can read waves" ON public.spmb_waves FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can modify waves" ON public.spmb_waves;
CREATE POLICY "Public can modify waves" ON public.spmb_waves FOR ALL USING (true) WITH CHECK (true);

-- ====================================================================
-- AKTIFKAN SUPABASE REALTIME REPLICATION TANPA REFRESH
-- ====================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'spmb_registrations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.spmb_registrations;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'spmb_settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.spmb_settings;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'spmb_announcements'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.spmb_announcements;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'spmb_waves'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.spmb_waves;
  END IF;
END $$;
