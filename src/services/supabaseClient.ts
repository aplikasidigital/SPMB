/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';

// Supabase Configuration from environment or defaults
export const SUPABASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || 'https://jxcjjyqswnvbjpelptig.supabase.co';
export const SUPABASE_API_URL = `${SUPABASE_URL}/rest/v1/`;
export const SUPABASE_ANON_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4Y2pqeXFzd252YmpwZWxwdGlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyNTY5ODUsImV4cCI6MjEwODgzMjk4NX0.2BzwQEIgD_wC7ffOmJEUs8xgafO4NEu3qdQ7ERBVprc';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_rFvajFkaMjPQzc474PhtYw_Xbf6HZEJ';
export const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4Y2pqeXFzd252YmpwZWxwdGlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzI1Njk4NSwiZXhwIjoyMTA4ODMyOTg1fQ.E5kAdb66npk5tyQ8H3e3p4jZ5bRt8rX3dWWSiPeWD8M';

// Create Supabase Client supporting either global CDN window.supabase or bundled SDK
const getSupabaseClientInstance = () => {
  const options = {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  };

  if (typeof window !== 'undefined' && (window as any).supabase?.createClient) {
    try {
      return (window as any).supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, options);
    } catch (e) {
      // fallback
    }
  }
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, options);
};

// Singleton Supabase Client with Realtime enabled
export const supabase = getSupabaseClientInstance();

// Expose globally for interactive debugging, manual inspection, or external scripts
if (typeof window !== 'undefined') {
  (window as any).supabaseClient = supabase;
}

let isRealtimeInitialized = false;

/**
 * Initializes Supabase Realtime WebSocket listeners for SPMB tables.
 * Dispatches window event 'spmb-storage-updated' when data changes remotely,
 * ensuring automatic two-way live sync across open browser tabs, mobile devices, and desktops without page refresh.
 */
export function initSupabaseRealtime(onRemoteChange?: (payload: any) => void) {
  if (typeof window === 'undefined' || isRealtimeInitialized) return;

  try {
    const channel = supabase
      .channel('spmb-realtime-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'spmb_registrations' },
        (payload: any) => {
          console.log('[Supabase Realtime] Registrations change detected:', payload.eventType, payload);
          window.dispatchEvent(new CustomEvent('spmb-storage-updated', { 
            detail: { table: 'spmb_registrations', eventType: payload.eventType, payload } 
          }));
          if (onRemoteChange) onRemoteChange(payload);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'spmb_settings' },
        (payload: any) => {
          console.log('[Supabase Realtime] Settings change detected:', payload.eventType, payload);
          window.dispatchEvent(new CustomEvent('spmb-storage-updated', { 
            detail: { table: 'spmb_settings', eventType: payload.eventType, payload } 
          }));
          if (onRemoteChange) onRemoteChange(payload);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'spmb_announcements' },
        (payload: any) => {
          console.log('[Supabase Realtime] Announcements change detected:', payload.eventType, payload);
          window.dispatchEvent(new CustomEvent('spmb-storage-updated', { 
            detail: { table: 'spmb_announcements', eventType: payload.eventType, payload } 
          }));
          if (onRemoteChange) onRemoteChange(payload);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'spmb_waves' },
        (payload: any) => {
          console.log('[Supabase Realtime] Waves change detected:', payload.eventType, payload);
          window.dispatchEvent(new CustomEvent('spmb-storage-updated', { 
            detail: { table: 'spmb_waves', eventType: payload.eventType, payload } 
          }));
          if (onRemoteChange) onRemoteChange(payload);
        }
      )
      .subscribe((status: string) => {
        console.log('[Supabase Realtime Status]:', status);
        if (status === 'SUBSCRIBED') {
          console.log('⚡ [Supabase Realtime WebSockets]: Terhubung & mendengarkan sinkronisasi dua arah secara live.');
          window.dispatchEvent(new CustomEvent('spmb-realtime-status', { detail: { status: 'SUBSCRIBED' } }));
        }
      });

    isRealtimeInitialized = true;
    (window as any).spmbRealtimeChannel = channel;
    return channel;
  } catch (err) {
    console.warn('[Supabase Realtime] Notice: Offline or unconfigured tables, falling back to local storage cache.', err);
  }
}

/**
 * Service class for Supabase operations, schema utilities, and real-time management.
 */
export class SupabaseService {
  static client = supabase;
  static config = {
    url: SUPABASE_URL,
    apiUrl: SUPABASE_API_URL,
    anonKey: SUPABASE_ANON_KEY,
    publishableKey: SUPABASE_PUBLISHABLE_KEY,
    serviceRoleKey: SUPABASE_SERVICE_ROLE_KEY,
  };

  static initRealtime(onRemoteChange?: (payload: any) => void) {
    return initSupabaseRealtime(onRemoteChange);
  }

  static async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase.from('spmb_settings').select('key').limit(1);
      if (error && error.code !== 'PGRST116') {
        return { success: false, message: error.message };
      }
      return { success: true, message: 'Koneksi Supabase aktif & terhubung.' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Gagal terhubung ke Supabase' };
    }
  }

  /**
   * Generates production-ready PostgreSQL / Supabase SQL DDL script for SPMB tables,
   * enabling RLS policies and Realtime publications.
   */
  static getSupabaseSetupSql(): string {
    return `-- ==============================================================================
-- SKRIP SETUP DATABASE SUPABASE POSTGRESQL UNTUK SISTEM SPMB ONLINE REALTIME
-- Jalankan skrip ini di SQL Editor dashboard Supabase Anda (https://supabase.com/dashboard)
-- Project URL: https://jxcjjyqswnvbjpelptig.supabase.co
-- ==============================================================================

-- 1. TABEL PENDAFTARAN SISWA BARU (spmb_registrations)
CREATE TABLE IF NOT EXISTS public.spmb_registrations (
    id TEXT PRIMARY KEY,
    registration_number TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    nik TEXT,
    family_card_number TEXT,
    nisn TEXT,
    phone TEXT,
    email TEXT,
    wave TEXT,
    major_first TEXT,
    major_second TEXT,
    status TEXT DEFAULT 'PENDING',
    status_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    data_payload JSONB
);

-- Indeks performa pencarian data siswa
CREATE INDEX IF NOT EXISTS idx_spmb_registrations_number ON public.spmb_registrations (registration_number);
CREATE INDEX IF NOT EXISTS idx_spmb_registrations_phone ON public.spmb_registrations (phone);
CREATE INDEX IF NOT EXISTS idx_spmb_registrations_status ON public.spmb_registrations (status);

-- 2. TABEL PENGATURAN APLIKASI & LINK WHATSAPP GROUP (spmb_settings)
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
    content TEXT,
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
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    start_time TEXT DEFAULT '08:00',
    end_time TEXT DEFAULT '23:59',
    is_active BOOLEAN DEFAULT TRUE,
    benefits TEXT[],
    data_payload JSONB
);

-- 5. AKTIFKAN ROW LEVEL SECURITY (RLS) DENGAN AKSES REALTIME & ANON
ALTER TABLE public.spmb_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spmb_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spmb_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spmb_waves ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses Penuh untuk Public / Anon (Akses Web SPMB)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public Registrations Access" ON public.spmb_registrations;
    CREATE POLICY "Public Registrations Access" ON public.spmb_registrations FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public Settings Access" ON public.spmb_settings;
    CREATE POLICY "Public Settings Access" ON public.spmb_settings FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public Announcements Access" ON public.spmb_announcements;
    CREATE POLICY "Public Announcements Access" ON public.spmb_announcements FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public Waves Access" ON public.spmb_waves;
    CREATE POLICY "Public Waves Access" ON public.spmb_waves FOR ALL USING (true) WITH CHECK (true);
END $$;

-- 6. AKTIFKAN SUPABASE REALTIME REPLICATION (Sinkronisasi Otomatis Antar Perangkat)
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
        ALTER PUBLICATION supabase_realtime ADD TABLE public.spmb_announcements;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.spmb_waves;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
END $$;
`;
  }
}

