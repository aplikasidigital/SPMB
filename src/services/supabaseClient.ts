/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { StudentRegistration, SchoolSettings } from '../types/spmb';

// Kredensial Resmi Supabase SPMB SMK Lentera Bangsa 2
export const SUPABASE_CONFIG = {
  PROJECT_URL: 'https://jxcjjyqswnvbjpelptig.supabase.co',
  REST_URL: 'https://jxcjjyqswnvbjpelptig.supabase.co/rest/v1',
  ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4Y2pqeXFzd252YmpwZWxwdGlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyNTY5ODUsImV4cCI6MjEwODgzMjk4NX0.2BzwQEIgD_wC7ffOmJEUs8xgafO4NEu3qdQ7ERBVprc',
  PUBLISHABLE_KEY: 'sb_publishable_rFvajFkaMjPQzc474PhtYw_Xbf6HZEJ',
  SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4Y2pqeXFzd252YmpwZWxwdGlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzI1Njk4NSwiZXhwIjoyMTA4ODMyOTg1fQ.E5kAdb66npk5tyQ8H3e3p4jZ5bRt8rX3dWWSiPeWD8M',
};

// Inisialisasi Supabase Client
// Menggunakan Service Role Key / Anon Key resmi untuk memastikan kehandalan akses data
const activeKey = SUPABASE_CONFIG.SERVICE_ROLE_KEY || SUPABASE_CONFIG.ANON_KEY;

export const supabase: SupabaseClient = createClient(
  SUPABASE_CONFIG.PROJECT_URL,
  activeKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// Realtime Channel Reference
let realtimeChannel: RealtimeChannel | null = null;

export interface SupabaseSyncResult {
  success: boolean;
  message: string;
  count?: number;
  error?: any;
}

export class SupabaseService {
  /**
   * Tes konektivitas ke database Supabase
   */
  static async checkConnection(): Promise<{ connected: boolean; latencyMs: number; message: string }> {
    const startTime = Date.now();
    try {
      // Tes koneksi melalui REST endpoint
      const response = await fetch(`${SUPABASE_CONFIG.REST_URL}/`, {
        method: 'GET',
        headers: {
          apikey: activeKey,
          Authorization: `Bearer ${activeKey}`,
        },
      });

      const latencyMs = Date.now() - startTime;
      if (response.ok) {
        return {
          connected: true,
          latencyMs,
          message: `Terhubung ke Supabase Cloud (${latencyMs}ms)`,
        };
      } else {
        return {
          connected: false,
          latencyMs,
          message: `Gagal terhubung: HTTP ${response.status} ${response.statusText}`,
        };
      }
    } catch (err: any) {
      return {
        connected: false,
        latencyMs: Date.now() - startTime,
        message: err?.message || 'Koneksi Supabase offline',
      };
    }
  }

  /**
   * Sinkronisasi data pendaftar ke tabel Supabase (spmb_registrations)
   */
  static async syncRegistrants(registrants: StudentRegistration[]): Promise<SupabaseSyncResult> {
    try {
      if (!registrants || registrants.length === 0) {
        return { success: true, message: 'Tidak ada data pendaftar untuk disinkronkan.', count: 0 };
      }

      const rows = registrants.map((r) => ({
        id: r.id,
        registration_number: r.registrationNumber,
        full_name: r.personalData.fullName,
        nisn: r.personalData.nisn || null,
        phone: r.personalData.phoneWhatsApp,
        email: r.personalData.email,
        major_first: r.majorChoice.firstChoice,
        major_second: r.majorChoice.secondChoice,
        wave: r.wave,
        status: r.status,
        status_note: r.statusNote || null,
        verified_by: r.verifiedBy || null,
        data_payload: r,
        updated_at: new Date().toISOString(),
      }));

      // Coba upsert ke tabel spmb_registrations
      const { error } = await supabase
        .from('spmb_registrations')
        .upsert(rows, { onConflict: 'registration_number' });

      if (error) {
        // Jika tabel spmb_registrations belum dibuat, simpan juga sebagai fallback
        console.warn('[Supabase] spmb_registrations upsert error:', error.message);
        return {
          success: false,
          message: `Supabase: ${error.message}. Harap jalankan Skrip SQL di menu Supabase agar tabel siap.`,
          error,
        };
      }

      return {
        success: true,
        message: `Berhasil menyinkronkan ${registrants.length} data pendaftar ke Supabase Cloud secara real-time.`,
        count: registrants.length,
      };
    } catch (err: any) {
      console.error('[Supabase Sync Error]', err);
      return {
        success: false,
        message: `Gagal sinkronisasi Supabase: ${err?.message || 'Koneksi terputus'}. Data tetap aman di penyimpanan lokal.`,
        error: err,
      };
    }
  }

  /**
   * Ambil data pendaftar dari Supabase
   */
  static async fetchRegistrants(): Promise<{ success: boolean; data?: StudentRegistration[]; message: string }> {
    try {
      const { data, error } = await supabase
        .from('spmb_registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return {
          success: false,
          message: `Supabase: ${error.message}`,
        };
      }

      if (data && Array.isArray(data) && data.length > 0) {
        const parsed: StudentRegistration[] = data
          .map((row) => (row.data_payload as StudentRegistration) || null)
          .filter(Boolean);

        return {
          success: true,
          data: parsed,
          message: `Berhasil mengunduh ${parsed.length} pendaftar dari Supabase.`,
        };
      }

      return {
        success: true,
        data: [],
        message: 'Tabel Supabase kosong atau belum ada pendaftar baru.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Gagal membaca data dari Supabase.',
      };
    }
  }

  /**
   * Sinkronisasi pengaturan sekolah & pengumuman ke Supabase (spmb_settings)
   */
  static async syncSettings(settings: SchoolSettings): Promise<SupabaseSyncResult> {
    try {
      const payload = {
        id: 'primary_settings',
        school_name: settings.schoolName,
        academic_year: settings.academicYear,
        settings_payload: settings,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('spmb_settings')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.warn('[Supabase Settings Error]', error.message);
        return {
          success: false,
          message: `Supabase Settings: ${error.message}`,
          error,
        };
      }

      return {
        success: true,
        message: 'Pengaturan sekolah & pengumuman berhasil disinkronkan ke Supabase Cloud!',
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Gagal sync pengaturan: ${err?.message || 'Error'}`,
        error: err,
      };
    }
  }

  /**
   * Mengambil pengaturan dari Supabase jika tersedia
   */
  static async fetchSettings(): Promise<{ success: boolean; data?: SchoolSettings; message: string }> {
    try {
      const { data, error } = await supabase
        .from('spmb_settings')
        .select('*')
        .eq('id', 'primary_settings')
        .single();

      if (error || !data) {
        return {
          success: false,
          message: error ? error.message : 'Belum ada data pengaturan di Supabase.',
        };
      }

      if (data.settings_payload) {
        return {
          success: true,
          data: data.settings_payload as SchoolSettings,
          message: 'Berhasil mengunduh pengaturan terbaru dari Supabase Cloud.',
        };
      }

      return {
        success: false,
        message: 'Format data pengaturan tidak valid.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Offline',
      };
    }
  }

  /**
   * Hapus pendaftar dari Supabase Cloud
   */
  static async deleteRegistrant(regNum: string, id?: string): Promise<boolean> {
    try {
      if (regNum) {
        await supabase.from('spmb_registrations').delete().eq('registration_number', regNum);
        try {
          await supabase.from('SPMB').delete().eq('registration_number', regNum);
        } catch {
          // ignore if table doesn't exist
        }
      }
      if (id) {
        await supabase.from('spmb_registrations').delete().eq('id', id);
        try {
          await supabase.from('SPMB').delete().eq('id', id);
        } catch {
          // ignore
        }
      }
      return true;
    } catch (e) {
      console.warn('[Supabase Delete Error]', e);
      return false;
    }
  }

  /**
   * Berlangganan (Subscribe) perubahan data Realtime dari Supabase
   * Mendengarkan event INSERT, UPDATE, dan DELETE secara otomatis
   */
  static subscribeToRealtimeChanges(
    onRegistrantUpdate?: (payload?: any) => void,
    onSettingsUpdate?: (payload?: any) => void
  ): () => void {
    try {
      if (realtimeChannel) {
        realtimeChannel.unsubscribe();
      }

      realtimeChannel = supabase
        .channel('spmb_realtime_channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'spmb_registrations' },
          (payload) => {
            console.log('[Supabase Realtime] Event spmb_registrations:', payload.eventType);
            if (onRegistrantUpdate) {
              onRegistrantUpdate(payload);
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'SPMB' },
          (payload) => {
            console.log('[Supabase Realtime] Event SPMB table:', payload.eventType);
            if (onRegistrantUpdate) {
              onRegistrantUpdate(payload);
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'spmb_settings' },
          (payload) => {
            console.log('[Supabase Realtime] Event spmb_settings:', payload.eventType);
            if (onSettingsUpdate) {
              onSettingsUpdate(payload);
            }
          }
        )
        .subscribe((status) => {
          console.log('[Supabase Realtime Status]', status);
        });

      return () => {
        if (realtimeChannel) {
          realtimeChannel.unsubscribe();
          realtimeChannel = null;
        }
      };
    } catch (e) {
      console.warn('[Supabase Realtime Setup Warning]', e);
      return () => {};
    }
  }

  /**
   * Menghasilkan Skrip SQL Otomatis untuk disalin dan dijalankan di Supabase SQL Editor
   */
  static getSupabaseSetupSql(): string {
    return `-- ========================================================================
-- SKRIP SETUP RESMI DATABASE SUPABASE REALTIME & TABEL LENGKAP
-- SISTEM PENERIMAAN MURID BARU (SPMB) SMK LENTERA BANGSA 2
--
-- Target Project URL : https://jxcjjyqswnvbjpelptig.supabase.co
-- Dashboard SQL Editor: https://supabase.com/dashboard/project/jxcjjyqswnvbjpelptig/sql
-- ========================================================================

-- 0. EKSTENSI DATABASE (UUID & PGCRYPTO)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Fungsi Helper Otomatis: Update kolom updated_at saat data berubah
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. TABEL PENDAFTARAN SISWA BARU (spmb_registrations)
CREATE TABLE IF NOT EXISTS public.spmb_registrations (
    id TEXT PRIMARY KEY,
    registration_number TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    nisn TEXT,
    nik TEXT,
    gender TEXT,
    birth_place TEXT,
    birth_date TEXT,
    phone TEXT,
    email TEXT,
    major_first TEXT,
    major_second TEXT,
    wave TEXT,
    status TEXT DEFAULT 'PENDING',
    status_note TEXT,
    test_score NUMERIC(5, 2) DEFAULT 0,
    interview_score NUMERIC(5, 2) DEFAULT 0,
    final_score NUMERIC(5, 2) DEFAULT 0,
    verified_by TEXT,
    verified_at TIMESTAMP WITH TIME ZONE,
    data_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_spmb_reg_num ON public.spmb_registrations(registration_number);
CREATE INDEX IF NOT EXISTS idx_spmb_nisn ON public.spmb_registrations(nisn);
CREATE INDEX IF NOT EXISTS idx_spmb_status ON public.spmb_registrations(status);
CREATE INDEX IF NOT EXISTS idx_spmb_created_at ON public.spmb_registrations(created_at DESC);

DROP TRIGGER IF EXISTS trg_spmb_registrations_updated_at ON public.spmb_registrations;
CREATE TRIGGER trg_spmb_registrations_updated_at
BEFORE UPDATE ON public.spmb_registrations
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.spmb_registrations REPLICA IDENTITY FULL;

-- 2. TABEL PENGATURAN SEKOLAH & SPMB (spmb_settings)
CREATE TABLE IF NOT EXISTS public.spmb_settings (
    id TEXT PRIMARY KEY DEFAULT 'primary_settings',
    school_name TEXT NOT NULL DEFAULT 'SMK LENTERA BANGSA 2',
    academic_year TEXT NOT NULL DEFAULT '2026/2027',
    settings_payload JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.spmb_settings REPLICA IDENTITY FULL;

-- 3. TABEL PROGRAM KEAHLIAN / JURUSAN (spmb_majors)
CREATE TABLE IF NOT EXISTS public.spmb_majors (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    short_desc TEXT,
    full_desc TEXT,
    quota INTEGER DEFAULT 72,
    filled_count INTEGER DEFAULT 0,
    color TEXT,
    icon TEXT,
    data_payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.spmb_majors REPLICA IDENTITY FULL;

-- 4. TABEL GELOMBANG PENDAFTARAN (spmb_waves)
CREATE TABLE IF NOT EXISTS public.spmb_waves (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT false,
    benefits TEXT,
    quota INTEGER,
    fee TEXT,
    discount_note TEXT,
    data_payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.spmb_waves REPLICA IDENTITY FULL;

-- 5. TABEL PENGUMUMAN RESMI SPMB (spmb_announcements)
CREATE TABLE IF NOT EXISTS public.spmb_announcements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT,
    content TEXT,
    image_url TEXT,
    published_date TEXT,
    author TEXT,
    is_pinned BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.spmb_announcements REPLICA IDENTITY FULL;

-- 6. TABEL PENILAIAN & SELEKSI MASUK (spmb_evaluations)
CREATE TABLE IF NOT EXISTS public.spmb_evaluations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    registration_number TEXT REFERENCES public.spmb_registrations(registration_number) ON DELETE CASCADE,
    student_name TEXT,
    major TEXT,
    written_test NUMERIC(5, 2) DEFAULT 0,
    interview_test NUMERIC(5, 2) DEFAULT 0,
    vocational_test NUMERIC(5, 2) DEFAULT 0,
    attitude_score NUMERIC(5, 2) DEFAULT 0,
    final_score NUMERIC(5, 2) DEFAULT 0,
    selection_result TEXT DEFAULT 'BELUM_DITENTUKAN',
    evaluator_name TEXT,
    notes TEXT,
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.spmb_evaluations REPLICA IDENTITY FULL;

-- 7. TABEL LOG AKTIVITAS SISTEM (spmb_activity_logs)
CREATE TABLE IF NOT EXISTS public.spmb_activity_logs (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    action TEXT NOT NULL,
    performed_by TEXT,
    target_id TEXT,
    details TEXT,
    type TEXT
);

ALTER TABLE public.spmb_activity_logs REPLICA IDENTITY FULL;

-- 8. TABEL KOMPATIBILITAS LEGACY / SPMB ALTERNATIF ("SPMB")
CREATE TABLE IF NOT EXISTS public."SPMB" (
    id TEXT PRIMARY KEY,
    registration_number TEXT UNIQUE,
    data_payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public."SPMB" REPLICA IDENTITY FULL;

-- 9. KEBIJAKAN KEAMANAN ROW LEVEL SECURITY (RLS)
ALTER TABLE public.spmb_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spmb_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spmb_majors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spmb_waves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spmb_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spmb_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spmb_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."SPMB" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Izin Penuh spmb_registrations" ON public.spmb_registrations;
CREATE POLICY "Izin Penuh spmb_registrations" ON public.spmb_registrations FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Izin Penuh spmb_settings" ON public.spmb_settings;
CREATE POLICY "Izin Penuh spmb_settings" ON public.spmb_settings FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Izin Penuh spmb_majors" ON public.spmb_majors;
CREATE POLICY "Izin Penuh spmb_majors" ON public.spmb_majors FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Izin Penuh spmb_waves" ON public.spmb_waves;
CREATE POLICY "Izin Penuh spmb_waves" ON public.spmb_waves FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Izin Penuh spmb_announcements" ON public.spmb_announcements;
CREATE POLICY "Izin Penuh spmb_announcements" ON public.spmb_announcements FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Izin Penuh spmb_evaluations" ON public.spmb_evaluations;
CREATE POLICY "Izin Penuh spmb_evaluations" ON public.spmb_evaluations FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Izin Penuh spmb_activity_logs" ON public.spmb_activity_logs;
CREATE POLICY "Izin Penuh spmb_activity_logs" ON public.spmb_activity_logs FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Izin Penuh SPMB Legacy" ON public."SPMB";
CREATE POLICY "Izin Penuh SPMB Legacy" ON public."SPMB" FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

-- 10. AKTIFKAN PUBLIKASI SUPABASE REALTIME
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.spmb_registrations;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.spmb_settings;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.spmb_majors;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.spmb_waves;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.spmb_announcements;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.spmb_evaluations;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.spmb_activity_logs;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public."SPMB";
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
END $$;
`;
  }
}
