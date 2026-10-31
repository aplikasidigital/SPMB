/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';

// Supabase Configuration from SPMB credentials
export const SUPABASE_URL = 'https://jxcjjyqswnvbjpelptig.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4Y2pqeXFzd252YmpwZWxwdGlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyNTY5ODUsImV4cCI6MjEwODgzMjk4NX0.2BzwQEIgD_wC7ffOmJEUs8xgafO4NEu3qdQ7ERBVprc';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_rFvajFkaMjPQzc474PhtYw_Xbf6HZEJ';

// Singleton Supabase Client with Realtime enabled
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

let isRealtimeInitialized = false;

/**
 * Initializes Supabase Realtime listeners for SPMB tables.
 * Dispatches window event 'spmb-storage-updated' when data changes remotely,
 * ensuring automatic sync across open browser tabs, mobile devices, and desktops without page refresh.
 */
export function initSupabaseRealtime(onRemoteChange?: (payload: any) => void) {
  if (typeof window === 'undefined' || isRealtimeInitialized) return;

  try {
    const channel = supabase
      .channel('spmb-realtime-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'spmb_registrations' },
        (payload) => {
          console.log('[Supabase Realtime] Registrations change detected:', payload.eventType);
          window.dispatchEvent(new CustomEvent('spmb-storage-updated', { detail: { table: 'spmb_registrations', payload } }));
          if (onRemoteChange) onRemoteChange(payload);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'spmb_settings' },
        (payload) => {
          console.log('[Supabase Realtime] Settings change detected:', payload.eventType);
          window.dispatchEvent(new CustomEvent('spmb-storage-updated', { detail: { table: 'spmb_settings', payload } }));
          if (onRemoteChange) onRemoteChange(payload);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'spmb_announcements' },
        (payload) => {
          console.log('[Supabase Realtime] Announcements change detected:', payload.eventType);
          window.dispatchEvent(new CustomEvent('spmb-storage-updated', { detail: { table: 'spmb_announcements', payload } }));
          if (onRemoteChange) onRemoteChange(payload);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'spmb_waves' },
        (payload) => {
          console.log('[Supabase Realtime] Waves change detected:', payload.eventType);
          window.dispatchEvent(new CustomEvent('spmb-storage-updated', { detail: { table: 'spmb_waves', payload } }));
          if (onRemoteChange) onRemoteChange(payload);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Supabase Realtime] Connected and listening to live changes.');
        }
      });

    isRealtimeInitialized = true;
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
    anonKey: SUPABASE_ANON_KEY,
    publishableKey: SUPABASE_PUBLISHABLE_KEY,
  };

  static initRealtime(onRemoteChange?: (payload: any) => void) {
    return initSupabaseRealtime(onRemoteChange);
  }

  /**
   * Generates production-ready PostgreSQL / Supabase SQL DDL script for SPMB tables,
   * enabling RLS policies and Realtime publications.
   */
  static getSupabaseSetupSql(): string {
    return `-- ==============================================================================
-- SKRIP SETUP DATABASE SUPABASE POSTGRESQL UNTUK SISTEM SPMB ONLINE REALTIME
-- Jalankan skrip ini di SQL Editor dashboard Supabase Anda (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. TABEL PENDAFTARAN SISWA (spmb_registrations)
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
    status TEXT DEFAULT 'Menunggu Verifikasi',
    status_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    data_payload JSONB
);

-- 2. TABEL PENGATURAN APLIKASI & SEKOLAH (spmb_settings)
CREATE TABLE IF NOT EXISTS public.spmb_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by TEXT DEFAULT 'Admin'
);

-- 3. TABEL PENGUMUMAN SEKOLAH (spmb_announcements)
CREATE TABLE IF NOT EXISTS public.spmb_announcements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'Pemberitahuan',
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

-- 5. AKTIFKAN ROW LEVEL SECURITY (RLS) DENGAN AKSES ANON
ALTER TABLE public.spmb_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spmb_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spmb_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spmb_waves ENABLE ROW LEVEL SECURITY;

-- Policy untuk public / anon agar sistem dapat membaca dan menulis data
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

-- 6. AKTIFKAN SUPABASE REALTIME REPLICATION
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

