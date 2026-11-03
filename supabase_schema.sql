
-- =============================================================================
-- DATABASE SPMB SMK LENTERA BANGSA 2
-- SUPABASE DATABASE + MULTI GUEST + REALTIME
-- VERSION: STABLE / RE-RUN SAFE
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1. MEMBUAT TABEL UTAMA
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.spmb (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.app_state (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 2. TABEL PENDAFTAR
-- =============================================================================

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
    status_note TEXT DEFAULT 'Pendaftaran baru masuk. Menunggu verifikasi berkas.',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    data_payload JSONB NOT NULL
);

-- =============================================================================
-- 3. TABEL PENGATURAN SEKOLAH
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.spmb_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by TEXT DEFAULT 'Admin'
);

-- =============================================================================
-- 4. TABEL PENGUMUMAN
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.spmb_announcements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'PENTING',
    content TEXT NOT NULL,
    image_url TEXT,
    published_date TEXT DEFAULT TO_CHAR(NOW(), 'YYYY-MM-DD'),
    author TEXT DEFAULT 'Panitia SPMB',
    is_pinned BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 5. TABEL GELOMBANG PENDAFTARAN
-- =============================================================================

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

-- =============================================================================
-- 6. INDEX PERFORMA DATABASE
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_spmb_reg_full_name
ON public.spmb_registrations (full_name);

CREATE INDEX IF NOT EXISTS idx_spmb_reg_nik
ON public.spmb_registrations (nik);

CREATE INDEX IF NOT EXISTS idx_spmb_reg_nisn
ON public.spmb_registrations (nisn);

CREATE INDEX IF NOT EXISTS idx_spmb_reg_status
ON public.spmb_registrations (status);

CREATE INDEX IF NOT EXISTS idx_spmb_reg_wave
ON public.spmb_registrations (wave);

CREATE INDEX IF NOT EXISTS idx_spmb_reg_created
ON public.spmb_registrations (created_at DESC);

-- =============================================================================
-- 7. TRIGGER OTOMATIS UPDATED_AT
-- =============================================================================

CREATE OR REPLACE FUNCTION public.spmb_update_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_spmb_updated_at
ON public.spmb;

CREATE TRIGGER trg_spmb_updated_at
BEFORE UPDATE ON public.spmb
FOR EACH ROW
EXECUTE FUNCTION public.spmb_update_timestamp();

DROP TRIGGER IF EXISTS trg_app_state_updated_at
ON public.app_state;

CREATE TRIGGER trg_app_state_updated_at
BEFORE UPDATE ON public.app_state
FOR EACH ROW
EXECUTE FUNCTION public.spmb_update_timestamp();

DROP TRIGGER IF EXISTS trg_spmb_registrations_updated_at
ON public.spmb_registrations;

CREATE TRIGGER trg_spmb_registrations_updated_at
BEFORE UPDATE ON public.spmb_registrations
FOR EACH ROW
EXECUTE FUNCTION public.spmb_update_timestamp();

DROP TRIGGER IF EXISTS trg_spmb_settings_updated_at
ON public.spmb_settings;

CREATE TRIGGER trg_spmb_settings_updated_at
BEFORE UPDATE ON public.spmb_settings
FOR EACH ROW
EXECUTE FUNCTION public.spmb_update_timestamp();

-- =============================================================================
-- 8. ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.spmb ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spmb_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spmb_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spmb_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spmb_waves ENABLE ROW LEVEL SECURITY;

-- Menghapus kebijakan lama yang menggunakan nama sama

DROP POLICY IF EXISTS "Public access on spmb" ON public.spmb;
DROP POLICY IF EXISTS "Public access on app_state" ON public.app_state;
DROP POLICY IF EXISTS "Public access on spmb_registrations" ON public.spmb_registrations;
DROP POLICY IF EXISTS "Public access on spmb_settings" ON public.spmb_settings;
DROP POLICY IF EXISTS "Public access on spmb_announcements" ON public.spmb_announcements;
DROP POLICY IF EXISTS "Public access on spmb_waves" ON public.spmb_waves;

-- Kebijakan multi-guest publik

CREATE POLICY "Public access on spmb"
ON public.spmb
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Public access on app_state"
ON public.app_state
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Public access on spmb_registrations"
ON public.spmb_registrations
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Public access on spmb_settings"
ON public.spmb_settings
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Public access on spmb_announcements"
ON public.spmb_announcements
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Public access on spmb_waves"
ON public.spmb_waves
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- =============================================================================
-- 9. HAK AKSES TABEL
-- =============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.spmb,
   public.app_state,
   public.spmb_registrations,
   public.spmb_settings,
   public.spmb_announcements,
   public.spmb_waves
TO anon, authenticated;

-- =============================================================================
-- 10. AKTIFKAN SUPABASE REALTIME
-- =============================================================================

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY ARRAY[
        'spmb',
        'app_state',
        'spmb_registrations',
        'spmb_settings',
        'spmb_announcements',
        'spmb_waves'
    ]
    LOOP
        IF NOT EXISTS (
            SELECT 1
            FROM pg_publication_tables
            WHERE pubname = 'supabase_realtime'
              AND schemaname = 'public'
              AND tablename = tbl
        ) THEN
            EXECUTE format(
                'ALTER PUBLICATION supabase_realtime ADD TABLE public.%I',
                tbl
            );
        END IF;
    END LOOP;
END;
$$;

-- =============================================================================
-- 11. DATA AWAL SPMB
-- =============================================================================

INSERT INTO public.spmb (id, data)
VALUES (
'main_state',
'{
    "majors": [
        {
            "id": "tei",
            "code": "TEI",
            "name": "Teknik Elektronika Industri",
            "shortDesc": "Kuasai otomasi industri, pemrograman PLC modern, sensor IoT, mikrokontroler, dan sistem kontrol robotik pabrik.",
            "fullDesc": "Program keahlian unggulan berstandar industri manufaktur yang membekali siswa keahlian perancangan sistem elektronika industri, pemrograman PLC (Omron & Siemens), instrumentasi kontrol otomatis pabrik, instalasi sensor & aktuator, mikrokontroler, serta pemeliharaan sistem robotika modern siap kerja.",
            "quota": 108,
            "filledCount": 42,
            "color": "from-blue-600 to-indigo-700",
            "icon": "Cpu",
            "careers": [
                "Teknisi Otomasi & PLC Industri",
                "Instrument & Control Engineer Junior",
                "Teknisi Maintenance & Repair Elektronika",
                "Spesialis IoT & Sensor Otomasi Pabrik",
                "Teknisi Robotik Manufaktur"
            ],
            "facilities": [
                "Lab PLC & Otomasi Industri Terstandar Pabrik",
                "Bengkel Perakitan Panel Kontrol Kelistrikan",
                "Kit Trainer Mikrokontroler & Sensor IoT",
                "Pneumatik & Hidrolik Simulation Station"
            ],
            "bannerImage": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80"
        },
        {
            "id": "tsm",
            "code": "TSM",
            "name": "Teknik Sepeda Motor",
            "shortDesc": "Spesialis teknologi motor injeksi EFI modern, kelistrikan kendaraan roda dua, overhaul mesin, dan motor listrik (EV).",
            "fullDesc": "Program keahlian otomotif roda dua terkemuka yang bekerja sama dengan industri terstandar bengkel resmi. Membekali siswa keterampilan servis berkala, tune-up injeksi EFI, diagnosa kerusakan motor via scanner komputer modern, perbaikan kelistrikan & chasis, serta konversi teknologi sepeda motor listrik (EV).",
            "quota": 108,
            "filledCount": 48,
            "color": "from-amber-600 to-orange-700",
            "icon": "Wrench",
            "careers": [
                "Mekanik Diagnostik EFI & EV Motor",
                "Service Advisor Bengkel Resmi Roda Dua",
                "Kepala Regu & Quality Control Otomotif",
                "Teknisi Perakitan Industri Komponen Motor",
                "Wirausaha Bengkel Servis & Modifikasi Modern"
            ],
            "facilities": [
                "Bengkel Standar Bengkel Resmi Roda Dua",
                "Diagnostic Scanner Komputer Motor Injeksi",
                "Bike Lift Hidrolik & Alat Khusus Otomotif",
                "Unit Sepeda Motor Praktik Injeksi & EV Terkini"
            ],
            "bannerImage": "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80"
        }
    ],
    "waves": [
        {
            "id": "wave-1",
            "name": "Gelombang 1 (Jalur Prestasi & Minat)",
            "startDate": "2026-01-01",
            "endDate": "2026-02-28",
            "startTime": "08:00",
            "endTime": "23:59",
            "isActive": true,
            "benefits": "Diskon Biaya Seragam 50% + Bebas Biaya Pendaftaran + Prioritas Jurusan Utama",
            "quota": 200,
            "fee": "Gratis Biaya Pendaftaran",
            "discountNote": "Potongan DPP Rp 500.000"
        },
        {
            "id": "wave-2",
            "name": "Gelombang 2 (Jalur Reguler)",
            "startDate": "2026-03-01",
            "endDate": "2026-05-31",
            "startTime": "08:00",
            "endTime": "23:59",
            "isActive": false,
            "benefits": "Subsidi SPP Bulan Pertama + Paket Modul & Jas Almamater Lengkap",
            "quota": 150,
            "fee": "Rp 150.000",
            "discountNote": "Potongan Uang Praktik 25%"
        },
        {
            "id": "wave-3",
            "name": "Gelombang 3 (Jalur Kuota Terakhir)",
            "startDate": "2026-06-01",
            "endDate": "2026-07-10",
            "startTime": "08:00",
            "endTime": "17:00",
            "isActive": false,
            "benefits": "Pendaftaran Terakhir Selama Sisa Kuota Jurusan Masih Tersedia",
            "quota": 100,
            "fee": "Rp 200.000",
            "discountNote": "Reguler Sesuai Ketentuan"
        }
    ],
    "settings": {
        "schoolName": "SMK LENTERA BANGSA 2",
        "schoolTagline": "Mencetak Generasi Cerdas, Terampil, Mandiri & Berakhlak Mulia",
        "academicYear": "2026/2027",
        "address": "Jl. Raya Lentera No. 88, Telukjambe Timur, Karawang, Jawa Barat 41361",
        "phone": "(0267) 845-9922 / 845-9923",
        "whatsappNumber": "6281314420312",
        "email": "spmb@smklenterabangsa2.sch.id",
        "website": "https://smklenterabangsa2.sch.id",
        "npsn": "69987654",
        "accreditation": "TERAKREDITASI \"A\" (UNGGUL)",
        "headmasterName": "Drs. H. Mulyadi Suherman, M.Pd.",
        "headmasterNip": "19740512 199903 1 004",
        "committeeHeadName": "Ahmad Fauzi, S.Kom., M.T.",
        "logoUrl": "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=200&auto=format&fit=crop&q=80",
        "promoVideoUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ",
        "announcementTicker": "⭐ PENDAFTARAN GELOMBANG 1 SPMB 2026/2027 DIBUKA! Pilihan Jurusan: Teknik Elektronika Industri (TEI) & Teknik Sepeda Motor (TSM) ⭐",
        "primaryColor": "#2563eb",
        "whatsappGroupUrl": "https://chat.whatsapp.com/invite/spmb-smk-lentera-bangsa-2-2026"
    }
}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 12. SINKRONISASI APP_STATE
-- =============================================================================

INSERT INTO public.app_state (id, data)
SELECT id, data
FROM public.spmb
WHERE id = 'main_state'
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 13. PENGATURAN SEKOLAH
-- =============================================================================

INSERT INTO public.spmb_settings (key, value, updated_by)
VALUES (
'default_settings',
'{
    "schoolName": "SMK Lentera Bangsa 2",
    "schoolTagline": "Sekolah Pusat Keunggulan - Unggul, Berkarakter & Siap Kerja",
    "academicYear": "2026/2027",
    "schoolAddress": "Jl. Raya Lentera No. 88, Telukjambe Timur, Karawang, Jawa Barat 41361",
    "schoolPhone": "(0267) 845-9922",
    "schoolEmail": "spmb@smklenterabangsa2.sch.id",
    "schoolWebsite": "https://smklenterabangsa2.sch.id",
    "whatsappContact": "6281314420312",
    "whatsappGroupUrl": "https://chat.whatsapp.com/invite/spmb-smk-lentera-bangsa-2-2026",
    "isOpen": true
}'::jsonb,
'Inisialisasi Sistem'
)
ON CONFLICT (key) DO NOTHING;

-- =============================================================================
-- 14. PENGUMUMAN RESMI
-- =============================================================================

INSERT INTO public.spmb_announcements (
    id,
    title,
    category,
    content,
    image_url,
    published_date,
    author,
    is_pinned,
    is_active
)
VALUES (
    'ann-001',
    'Penerimaan Murid Baru (SPMB) Tahun Ajaran 2026/2027 Resmi Dibuka!',
    'PENTING',
    'Pendaftaran peserta didik baru SMK Lentera Bangsa 2 Gelombang 1 resmi dibuka. Dapatkan potongan DSP 30% dan seragam kejuruan gratis bagi 100 pendaftar pertama program keahlian TEI dan TSM.',
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
    '2026-01-05',
    'Ketua Panitia SPMB',
    TRUE,
    TRUE
)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 15. ANALISIS STATISTIK
-- =============================================================================

ANALYZE public.spmb;
ANALYZE public.app_state;
ANALYZE public.spmb_registrations;
ANALYZE public.spmb_settings;
ANALYZE public.spmb_announcements;
ANALYZE public.spmb_waves;

COMMIT;

-- =============================================================================
-- SELESAI
-- =============================================================================
