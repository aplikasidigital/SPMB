-- =============================================================================
-- DATABASE SPMB SMK LENTERA BANGSA 2
-- SUPABASE DATABASE - STABLE MIGRATION
-- MULTI GUEST + REALTIME + DATA PRESERVATION
-- RE-RUN SAFE
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1. MEMBUAT TABEL UTAMA
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.spmb (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL DEFAULT '{}'::JSONB,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.app_state (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL DEFAULT '{}'::JSONB,
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
    data_payload JSONB NOT NULL DEFAULT '{}'::JSONB
);

-- =============================================================================
-- 3. TABEL PENGATURAN SEKOLAH
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.spmb_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::JSONB,
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
    data_payload JSONB,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 6. MIGRASI STRUKTUR TABEL LAMA TANPA MENGHAPUS DATA
-- =============================================================================

ALTER TABLE public.spmb
    ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::JSONB,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.app_state
    ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::JSONB,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.spmb_registrations
    ADD COLUMN IF NOT EXISTS registration_number TEXT,
    ADD COLUMN IF NOT EXISTS full_name TEXT,
    ADD COLUMN IF NOT EXISTS nik TEXT,
    ADD COLUMN IF NOT EXISTS family_card_number TEXT,
    ADD COLUMN IF NOT EXISTS nisn TEXT,
    ADD COLUMN IF NOT EXISTS phone TEXT,
    ADD COLUMN IF NOT EXISTS email TEXT,
    ADD COLUMN IF NOT EXISTS wave TEXT DEFAULT 'Gelombang 1',
    ADD COLUMN IF NOT EXISTS major_first TEXT,
    ADD COLUMN IF NOT EXISTS major_second TEXT,
    ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PENDING',
    ADD COLUMN IF NOT EXISTS status_note TEXT DEFAULT 'Pendaftaran baru masuk. Menunggu verifikasi berkas.',
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS data_payload JSONB DEFAULT '{}'::JSONB;

ALTER TABLE public.spmb_settings
    ADD COLUMN IF NOT EXISTS value JSONB DEFAULT '{}'::JSONB,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_by TEXT DEFAULT 'Admin';

ALTER TABLE public.spmb_announcements
    ADD COLUMN IF NOT EXISTS title TEXT,
    ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'PENTING',
    ADD COLUMN IF NOT EXISTS content TEXT,
    ADD COLUMN IF NOT EXISTS image_url TEXT,
    ADD COLUMN IF NOT EXISTS published_date TEXT,
    ADD COLUMN IF NOT EXISTS author TEXT DEFAULT 'Panitia SPMB',
    ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.spmb_waves
    ADD COLUMN IF NOT EXISTS name TEXT,
    ADD COLUMN IF NOT EXISTS start_date TEXT,
    ADD COLUMN IF NOT EXISTS end_date TEXT,
    ADD COLUMN IF NOT EXISTS start_time TEXT DEFAULT '08:00',
    ADD COLUMN IF NOT EXISTS end_time TEXT DEFAULT '23:59',
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS benefits TEXT,
    ADD COLUMN IF NOT EXISTS data_payload JSONB,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- =============================================================================
-- 7. MELENGKAPI NILAI KOSONG PADA DATA LAMA
-- =============================================================================

UPDATE public.spmb
SET
    data = COALESCE(data, '{}'::JSONB),
    updated_at = COALESCE(updated_at, NOW())
WHERE data IS NULL OR updated_at IS NULL;

UPDATE public.app_state
SET
    data = COALESCE(data, '{}'::JSONB),
    updated_at = COALESCE(updated_at, NOW())
WHERE data IS NULL OR updated_at IS NULL;

UPDATE public.spmb_registrations
SET
    registration_number = COALESCE(
        NULLIF(TRIM(registration_number), ''),
        'LEGACY-' || id
    ),
    full_name = COALESCE(
        NULLIF(TRIM(full_name), ''),
        'Data Pendaftar Lama'
    ),
    status = COALESCE(status, 'PENDING'),
    wave = COALESCE(wave, 'Gelombang 1'),
    status_note = COALESCE(
        status_note,
        'Pendaftaran baru masuk. Menunggu verifikasi berkas.'
    ),
    created_at = COALESCE(created_at, NOW()),
    updated_at = COALESCE(updated_at, NOW()),
    data_payload = COALESCE(data_payload, '{}'::JSONB);

-- Memastikan nomor pendaftaran lama tidak memiliki duplikasi.
WITH duplicate_numbers AS (
    SELECT
        id,
        registration_number,
        ROW_NUMBER() OVER (
            PARTITION BY registration_number
            ORDER BY created_at NULLS LAST, id
        ) AS row_num
    FROM public.spmb_registrations
)
UPDATE public.spmb_registrations AS r
SET registration_number = 'LEGACY-' || r.id
FROM duplicate_numbers AS d
WHERE r.id = d.id
AND d.row_num > 1;

UPDATE public.spmb_settings
SET
    value = COALESCE(value, '{}'::JSONB),
    updated_at = COALESCE(updated_at, NOW()),
    updated_by = COALESCE(updated_by, 'Admin')
WHERE value IS NULL OR updated_at IS NULL OR updated_by IS NULL;

UPDATE public.spmb_announcements
SET
    category = COALESCE(category, 'PENTING'),
    published_date = COALESCE(
        published_date,
        TO_CHAR(NOW(), 'YYYY-MM-DD')
    ),
    author = COALESCE(author, 'Panitia SPMB'),
    is_pinned = COALESCE(is_pinned, FALSE),
    is_active = COALESCE(is_active, TRUE),
    created_at = COALESCE(created_at, NOW()),
    updated_at = COALESCE(updated_at, NOW());

UPDATE public.spmb_waves
SET
    start_time = COALESCE(start_time, '08:00'),
    end_time = COALESCE(end_time, '23:59'),
    is_active = COALESCE(is_active, TRUE),
    updated_at = COALESCE(updated_at, NOW());

-- =============================================================================
-- 8. MEMASTIKAN KOLOM WAJIB TIDAK NULL
-- =============================================================================

ALTER TABLE public.spmb
    ALTER COLUMN data SET DEFAULT '{}'::JSONB,
    ALTER COLUMN data SET NOT NULL,
    ALTER COLUMN updated_at SET DEFAULT NOW(),
    ALTER COLUMN updated_at SET NOT NULL;

ALTER TABLE public.app_state
    ALTER COLUMN data SET DEFAULT '{}'::JSONB,
    ALTER COLUMN data SET NOT NULL,
    ALTER COLUMN updated_at SET DEFAULT NOW(),
    ALTER COLUMN updated_at SET NOT NULL;

ALTER TABLE public.spmb_registrations
    ALTER COLUMN registration_number SET NOT NULL,
    ALTER COLUMN full_name SET NOT NULL,
    ALTER COLUMN data_payload SET DEFAULT '{}'::JSONB,
    ALTER COLUMN data_payload SET NOT NULL;

ALTER TABLE public.spmb_settings
    ALTER COLUMN value SET DEFAULT '{}'::JSONB,
    ALTER COLUMN value SET NOT NULL,
    ALTER COLUMN updated_at SET DEFAULT NOW(),
    ALTER COLUMN updated_at SET NOT NULL;

-- =============================================================================
-- 9. INDEX DATABASE UNTUK PERFORMA
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

CREATE UNIQUE INDEX IF NOT EXISTS idx_spmb_registration_number_unique
ON public.spmb_registrations (registration_number);

CREATE INDEX IF NOT EXISTS idx_spmb_announcements_active
ON public.spmb_announcements (is_active, published_date DESC);

CREATE INDEX IF NOT EXISTS idx_spmb_waves_active
ON public.spmb_waves (is_active);

-- =============================================================================
-- 10. FUNGSI OTOMATIS UPDATED_AT
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

-- Trigger dibuat ulang secara konsisten.

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

DROP TRIGGER IF EXISTS trg_spmb_announcements_updated_at
ON public.spmb_announcements;

CREATE TRIGGER trg_spmb_announcements_updated_at
BEFORE UPDATE ON public.spmb_announcements
FOR EACH ROW
EXECUTE FUNCTION public.spmb_update_timestamp();

DROP TRIGGER IF EXISTS trg_spmb_waves_updated_at
ON public.spmb_waves;

CREATE TRIGGER trg_spmb_waves_updated_at
BEFORE UPDATE ON public.spmb_waves
FOR EACH ROW
EXECUTE FUNCTION public.spmb_update_timestamp();

-- =============================================================================
-- 11. ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.spmb ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spmb_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spmb_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spmb_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spmb_waves ENABLE ROW LEVEL SECURITY;

-- Hapus kebijakan lama agar tidak terjadi konflik kebijakan permisif.
-- Penghapusan kebijakan tidak menghapus data tabel.

DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename IN (
            'spmb',
            'app_state',
            'spmb_registrations',
            'spmb_settings',
            'spmb_announcements',
            'spmb_waves'
        )
    LOOP
        EXECUTE format(
            'DROP POLICY IF EXISTS %I ON %I.%I',
            policy_record.policyname,
            policy_record.schemaname,
            policy_record.tablename
        );
    END LOOP;
END;
$$;

-- Data konfigurasi publik dapat dibaca pengunjung.
CREATE POLICY "Public read spmb"
ON public.spmb
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Public read app_state"
ON public.app_state
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Public read settings"
ON public.spmb_settings
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Public read announcements"
ON public.spmb_announcements
FOR SELECT
TO anon, authenticated
USING (is_active = TRUE);

CREATE POLICY "Public read waves"
ON public.spmb_waves
FOR SELECT
TO anon, authenticated
USING (true);

-- Pengunjung boleh mengirim pendaftaran baru.
-- Data pribadi pendaftar tidak dapat dibaca oleh pengunjung anonim.
CREATE POLICY "Public insert registrations"
ON public.spmb_registrations
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Pengelolaan data hanya untuk pengguna yang sudah login.
CREATE POLICY "Authenticated manage spmb"
ON public.spmb
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated manage app_state"
ON public.app_state
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated manage registrations"
ON public.spmb_registrations
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated manage settings"
ON public.spmb_settings
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated manage announcements"
ON public.spmb_announcements
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated manage waves"
ON public.spmb_waves
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- =============================================================================
-- 12. HAK AKSES DATABASE
-- =============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT
ON public.spmb,
   public.app_state,
   public.spmb_settings,
   public.spmb_announcements,
   public.spmb_waves
TO anon, authenticated;

GRANT INSERT
ON public.spmb_registrations
TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.spmb,
   public.app_state,
   public.spmb_registrations,
   public.spmb_settings,
   public.spmb_announcements,
   public.spmb_waves
TO authenticated;

-- =============================================================================
-- 13. DATA AWAL SPMB
-- HANYA DITAMBAHKAN JIKA BELUM ADA.
-- DATA YANG SUDAH ADA TIDAK DITIMPA.
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
}'::JSONB
)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 14. SINKRONISASI APP_STATE
-- =============================================================================

INSERT INTO public.app_state (id, data)
SELECT id, data
FROM public.spmb
WHERE id = 'main_state'
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 15. PENGATURAN SEKOLAH
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
}'::JSONB,
'Inisialisasi Sistem'
)
ON CONFLICT (key) DO NOTHING;

-- =============================================================================
-- 16. PENGUMUMAN RESMI
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
-- 17. AKTIVASI SUPABASE REALTIME
-- =============================================================================

DO $$
DECLARE
    tbl TEXT;
BEGIN

    -- Pastikan publication tersedia.
    IF EXISTS (
        SELECT 1
        FROM pg_publication
        WHERE pubname = 'supabase_realtime'
    ) THEN

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

    ELSE
        RAISE NOTICE
        'Publication supabase_realtime belum tersedia. Aktivasi perlu dilakukan melalui pengaturan Realtime Supabase.';
    END IF;

END;
$$;

-- =============================================================================
-- 18. ANALISIS DATABASE
-- =============================================================================

ANALYZE public.spmb;
ANALYZE public.app_state;
ANALYZE public.spmb_registrations;
ANALYZE public.spmb_settings;
ANALYZE public.spmb_announcements;
ANALYZE public.spmb_waves;

-- =============================================================================
-- 19. SELESAI
-- =============================================================================

COMMIT;

SELECT
    'DATABASE SPMB BERHASIL DIPERIKSA' AS status,
    (SELECT COUNT(*) FROM public.spmb) AS total_spmb,
    (SELECT COUNT(*) FROM public.app_state) AS total_app_state,
    (SELECT COUNT(*) FROM public.spmb_registrations) AS total_pendaftar,
    (SELECT COUNT(*) FROM public.spmb_settings) AS total_pengaturan,
    (SELECT COUNT(*) FROM public.spmb_announcements) AS total_pengumuman,
    (SELECT COUNT(*) FROM public.spmb_waves) AS total_gelombang;
