/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';

const ACTIVE_SUPABASE_URL = 'https://mduwtxkqroausoxriqgf.supabase.co';
const ACTIVE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kdXd0eGtxcm9hdXNveHJpcWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3MTUwMTEsImV4cCI6MjEwOTI5MTAxMX0.l281N2aTChr8qPu7sjLZIyLc4kjPuFxKiZ3Px0j1lwI';

const sanitizeSupabaseUrl = (url?: string) => {
  if (!url || !url.includes('mduwtxkqroausoxriqgf')) {
    return ACTIVE_SUPABASE_URL;
  }
  return url.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
};

const sanitizeSupabaseKey = (key?: string) => {
  if (!key || !key.includes('Im1kdXd0eGtxcm9hdXNveHJpcWdmI')) {
    return ACTIVE_SUPABASE_ANON_KEY;
  }
  return key;
};

// Supabase Configuration
export const SUPABASE_URL = sanitizeSupabaseUrl(typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_URL : undefined);
export const SUPABASE_API_URL = `${SUPABASE_URL}/rest/v1/`;
export const SUPABASE_ANON_KEY = sanitizeSupabaseKey(typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_ANON_KEY : undefined);
export const SUPABASE_PUBLISHABLE_KEY = SUPABASE_ANON_KEY;

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
      // fallback to bundled SDK
    }
  }
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, options);
};

// Singleton Supabase Client with Realtime enabled
export const supabase = getSupabaseClientInstance();

// Expose globally for debugging
if (typeof window !== 'undefined') {
  (window as any).supabaseClient = supabase;
}

let isRealtimeInitialized = false;

/**
 * Helper function: Fetch data from Supabase (khusus database spmb)
 */
export async function fetchData<T = any>(table: string = 'spmb', id: string = 'main_state'): Promise<T | null> {
  // Coba ambil melalui API endpoint lokal jika tersedia
  if ((table === 'spmb' || table === 'app_state') && id === 'main_state') {
    try {
      const res = await fetch('/api/spmb');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data as T;
        }
      }
    } catch {
      // Fallback ke Supabase SDK langsung jika fetch lokal gagal
    }
  }

  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      // Fallback jika tabel utama spmb gagal dan mencoba membaca app_state
      if (table === 'spmb') {
        const fallback = await supabase
          .from('app_state')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (!fallback.error && fallback.data?.data) {
          return fallback.data.data as T;
        }
      }
      return null;
    }

    if (data && data.data) {
      return data.data as T;
    }
    return (data as unknown as T) || null;
  } catch {
    return null;
  }
}

/**
 * Helper function: Save/Upsert data ke Supabase (Sinkronisasi Realtime)
 */
export async function updateData(newData: any, table: string = 'spmb', id: string = 'main_state'): Promise<boolean> {
  if ((table === 'spmb' || table === 'app_state') && id === 'main_state') {
    try {
      const res = await fetch('/api/spmb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: newData }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          return true;
        }
      }
    } catch {
      // Fallback ke Supabase SDK client
    }
  }

  try {
    const { error } = await supabase
      .from(table)
      .upsert({
        id,
        data: newData,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (error) {
      console.error('[Supabase Update Error]:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase Update Exception]:', err);
    return false;
  }
}

/**
 * Helper function: Subscribe ke perubahan Realtime untuk tabel tertentu
 */
export function subscribeRealtime(table: string = 'spmb', onUpdate: (data: any) => void) {
  if (typeof window === 'undefined') return null;

  const channel = supabase
    .channel(`realtime:${table}-${Math.random()}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      (payload: any) => {
        console.log(`⚡ [Supabase Realtime] Perubahan terdeteksi pada tabel ${table}:`, payload);
        const updatedContent = payload.new?.data ?? payload.new;
        if (updatedContent) {
          onUpdate(updatedContent);
        }
      }
    )
    .subscribe((status: string) => {
      console.log(`[Supabase Realtime:${table} status]:`, status);
    });

  return channel;
}

/**
 * Inisialisasi WebSocket listeners Realtime untuk seluruh tabel SPMB secara otomatis.
 */
export function initSupabaseRealtime(onRemoteChange?: (payload: any) => void) {
  if (typeof window === 'undefined' || isRealtimeInitialized) return;

  const tablesToListen = ['spmb', 'app_state', 'spmb_registrations', 'spmb_settings', 'spmb_announcements', 'spmb_waves'];

  try {
    const channel = supabase.channel('spmb-global-realtime-channel');

    tablesToListen.forEach((table) => {
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload: any) => {
          console.log(`[Supabase Realtime] Perubahan pada [${table}]:`, payload.eventType, payload);
          window.dispatchEvent(new CustomEvent('spmb-storage-updated', { 
            detail: { table: table, eventType: payload.eventType, payload } 
          }));
          if (onRemoteChange) onRemoteChange(payload);
        }
      );
    });

    channel.subscribe((status: string) => {
      console.log('[Supabase Realtime Status]:', status);
      if (status === 'SUBSCRIBED') {
        console.log('⚡ [Supabase Realtime WebSockets]: Terhubung & mendengarkan sinkronisasi live.');
        window.dispatchEvent(new CustomEvent('spmb-realtime-status', { detail: { status: 'SUBSCRIBED' } }));
      }
    });

    isRealtimeInitialized = true;
    (window as any).spmbRealtimeChannel = channel;
    return channel;
  } catch (err) {
    console.warn('[Supabase Realtime] Koneksi bermasalah, mencoba menghubungkan ulang...', err);
  }
}

/**
 * Service class untuk operasi Supabase dan utilitas skema SQL database SPMB.
 */
export class SupabaseService {
  static client = supabase;
  static config = {
    url: SUPABASE_URL,
    apiUrl: SUPABASE_API_URL,
    anonKey: SUPABASE_ANON_KEY,
  };

  static initRealtime(onRemoteChange?: (payload: any) => void) {
    return initSupabaseRealtime(onRemoteChange);
  }

  static async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase.from('spmb').select('id').limit(1);
      if (!error) {
        return { success: true, message: 'Koneksi ke database Supabase "spmb" aktif & terhubung.' };
      }
      return { success: false, message: error.message };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Gagal terhubung ke Supabase' };
    }
  }

  static getSupabaseSetupSql(): string {
    return `-- ==============================================================================
-- SKRIP SETUP DATABASE SUPABASE POSTGRESQL (SPMB)
-- Project URL: ${SUPABASE_URL}
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.spmb (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.app_state (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS public.spmb_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by TEXT DEFAULT 'Admin'
);

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

-- RLS & Policies
ALTER TABLE public.spmb ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spmb_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spmb_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spmb_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spmb_waves ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Public spmb Access" ON public.spmb;
    CREATE POLICY "Public spmb Access" ON public.spmb FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public app_state Access" ON public.app_state;
    CREATE POLICY "Public app_state Access" ON public.app_state FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public Registrations Access" ON public.spmb_registrations;
    CREATE POLICY "Public Registrations Access" ON public.spmb_registrations FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public Settings Access" ON public.spmb_settings;
    CREATE POLICY "Public Settings Access" ON public.spmb_settings FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public Announcements Access" ON public.spmb_announcements;
    CREATE POLICY "Public Announcements Access" ON public.spmb_announcements FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public Waves Access" ON public.spmb_waves;
    CREATE POLICY "Public Waves Access" ON public.spmb_waves FOR ALL USING (true) WITH CHECK (true);
END $$;

-- Realtime Publication
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.spmb;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.app_state;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.spmb_registrations;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.spmb_settings;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.spmb_announcements;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.spmb_waves;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
`;
  }
}